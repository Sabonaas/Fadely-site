import Stripe from 'https://esm.sh/stripe@17.4.0?target=deno';
import { corsHeaders, handleCors } from '../_shared/cors.ts';
import { createServiceClient, createUserClient } from '../_shared/supabase.ts';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
  apiVersion: '2024-11-20.acacia',
  httpClient: Stripe.createFetchHttpClient(),
});

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

    const { organizationId } = await req.json();
    const userClient = createUserClient(authHeader);
    const { data: { user } } = await userClient.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const admin = createServiceClient();
    const { data: org } = await admin.from('organizations').select('stripe_customer_id').eq('id', organizationId).single();
    if (!org?.stripe_customer_id) {
      return new Response(JSON.stringify({ error: 'No Stripe customer' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const siteUrl = Deno.env.get('SITE_URL') ?? 'http://localhost:5173';
    const portal = await stripe.billingPortal.sessions.create({
      customer: org.stripe_customer_id,
      return_url: `${siteUrl}/dashboard/settings`,
    });

    return new Response(JSON.stringify({ url: portal.url }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error('[stripe-portal]', e);
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
