import Stripe from 'https://esm.sh/stripe@17.4.0?target=deno';
import { corsHeaders, handleCors } from '../_shared/cors.ts';
import { createServiceClient, createUserClient } from '../_shared/supabase.ts';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
  apiVersion: '2024-11-20.acacia',
  httpClient: Stripe.createFetchHttpClient(),
});

const PRICE_MAP: Record<string, string | undefined> = {
  essential: Deno.env.get('STRIPE_PRICE_ESSENTIAL'),
  professional: Deno.env.get('STRIPE_PRICE_PROFESSIONAL'),
  premium: Deno.env.get('STRIPE_PRICE_PREMIUM'),
};

Deno.serve(async (req) => {
  const cors = handleCors(req);
  if (cors) return cors;

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { plan, organizationId } = await req.json();
    const priceId = PRICE_MAP[plan];
    if (!priceId) {
      return new Response(JSON.stringify({ error: 'Invalid plan' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const userClient = createUserClient(authHeader);
    const { data: { user } } = await userClient.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const admin = createServiceClient();
    const { data: org } = await admin.from('organizations').select('*').eq('id', organizationId).single();
    if (!org) {
      return new Response(JSON.stringify({ error: 'Organization not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let customerId = org.stripe_customer_id as string | null;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { organization_id: organizationId, user_id: user.id },
      });
      customerId = customer.id;
      await admin.from('organizations').update({ stripe_customer_id: customerId }).eq('id', organizationId);
    }

    const siteUrl = Deno.env.get('SITE_URL') ?? 'http://localhost:5173';
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${siteUrl}/dashboard/settings?checkout=success`,
      cancel_url: `${siteUrl}/dashboard/settings?checkout=cancel`,
      subscription_data: {
        trial_period_days: org.plan === 'free_trial' ? 14 : undefined,
        metadata: { organization_id: organizationId, plan },
      },
      metadata: { organization_id: organizationId, plan },
    });

    return new Response(JSON.stringify({ url: session.url, sessionId: session.id }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error('[stripe-checkout]', e);
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
