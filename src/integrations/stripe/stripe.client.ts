import { getSupabase } from '@/lib/supabase/client';
import { getFunctionsUrl, type StripePlanKey } from './config';

async function invokeFunction(name: string, body: Record<string, unknown>) {
  const supabase = getSupabase();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) throw new Error('Sessão necessária para billing');

  const res = await fetch(`${getFunctionsUrl()}/${name}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.access_token}`,
      apikey: import.meta.env.VITE_SUPABASE_ANON_KEY as string,
    },
    body: JSON.stringify(body),
  });

  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error ?? `Stripe function failed: ${name}`);
  return json;
}

export const stripeClient = {
  createCheckout(plan: StripePlanKey, organizationId: string) {
    return invokeFunction('stripe-checkout', { plan, organizationId });
  },
  openCustomerPortal(organizationId: string) {
    return invokeFunction('stripe-portal', { organizationId });
  },
};
