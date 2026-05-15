/** Stripe plan price IDs — set in Supabase secrets + .env */
export const STRIPE_PLANS = {
  essential: {
    name: 'Essencial',
    planKey: 'essential',
    priceEnvKey: 'STRIPE_PRICE_ESSENTIAL',
  },
  professional: {
    name: 'Profissional',
    planKey: 'professional',
    priceEnvKey: 'STRIPE_PRICE_PROFESSIONAL',
  },
  premium: {
    name: 'Premium',
    planKey: 'premium',
    priceEnvKey: 'STRIPE_PRICE_PREMIUM',
  },
} as const;

export type StripePlanKey = keyof typeof STRIPE_PLANS;

export function getFunctionsUrl(): string {
  const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
  if (!url) return '';
  return `${url}/functions/v1`;
}
