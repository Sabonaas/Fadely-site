import Stripe from 'https://esm.sh/stripe@17.4.0?target=deno';
import { createServiceClient } from '../_shared/supabase.ts';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
  apiVersion: '2024-11-20.acacia',
  httpClient: Stripe.createFetchHttpClient(),
});

const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET') ?? '';

async function syncSubscription(sub: Stripe.Subscription) {
  const admin = createServiceClient();
  const orgId = sub.metadata?.organization_id;
  if (!orgId) return;

  const plan = sub.metadata?.plan ?? 'essential';
  const status = sub.status;

  await admin.from('subscriptions').upsert(
    {
      organization_id: orgId,
      stripe_subscription_id: sub.id,
      stripe_price_id: sub.items.data[0]?.price.id,
      plan,
      status,
      current_period_start: new Date(sub.current_period_start * 1000).toISOString(),
      current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
      cancel_at_period_end: sub.cancel_at_period_end,
      trial_end: sub.trial_end ? new Date(sub.trial_end * 1000).toISOString() : null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'stripe_subscription_id' }
  );

  await admin
    .from('organizations')
    .update({
      plan,
      subscription_status: status,
      stripe_subscription_id: sub.id,
      updated_at: new Date().toISOString(),
    })
    .eq('id', orgId);

  await admin
    .from('businesses')
    .update({ subscription_plan: plan, subscription_status: status })
    .eq('organization_id', orgId);
}

Deno.serve(async (req) => {
  const signature = req.headers.get('stripe-signature');
  if (!signature) return new Response('Missing signature', { status: 400 });

  const body = await req.text();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (e) {
    console.error('[stripe-webhook] verify failed', e);
    return new Response('Invalid signature', { status: 400 });
  }

  const admin = createServiceClient();

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.subscription && session.metadata?.organization_id) {
        const sub = await stripe.subscriptions.retrieve(session.subscription as string);
        await syncSubscription(sub);
      }
      break;
    }
    case 'customer.subscription.updated':
    case 'customer.subscription.created': {
      await syncSubscription(event.data.object as Stripe.Subscription);
      break;
    }
    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription;
      const orgId = sub.metadata?.organization_id;
      if (orgId) {
        await admin.from('organizations').update({
          subscription_status: 'canceled',
          plan: 'free_trial',
        }).eq('id', orgId);
      }
      break;
    }
    case 'invoice.paid':
    case 'invoice.payment_failed':
      // Extend with audit_logs / user_notifications as needed
      break;
    default:
      break;
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { 'Content-Type': 'application/json' },
  });
});
