/** Planos exibidos no dashboard (Stripe: essential | professional | premium) */
export const DASHBOARD_PLANS = [
  {
    key: 'essential',
    name: 'Essencial',
    price: 'R$ 97',
    period: '/mês',
    description: 'Para começar com agenda e equipe pequena.',
    features: ['1 colaborador', 'Agenda online', 'Página de agendamento', 'Lembretes básicos'],
    limits: { employees: 1 },
    stripeKey: 'essential',
  },
  {
    key: 'professional',
    name: 'Profissional',
    price: 'R$ 197',
    period: '/mês',
    description: 'Para salões em crescimento.',
    features: ['Até 10 colaboradores', 'Relatórios', 'Cupons', 'WhatsApp avançado'],
    limits: { employees: 10 },
    stripeKey: 'professional',
    popular: true,
  },
  {
    key: 'premium',
    name: 'Premium',
    price: 'R$ 397',
    period: '/mês',
    description: 'Operação completa sem limites.',
    features: ['Colaboradores ilimitados', 'Analytics avançado', 'Suporte prioritário', 'Multi-unidade'],
    limits: { employees: Infinity },
    stripeKey: 'premium',
  },
];

/** Mapeia planos legados do business → chave Stripe/UI */
export function normalizePlanKey(plan) {
  const map = {
    free_trial: 'essential',
    starter: 'essential',
    essential: 'essential',
    professional: 'professional',
    enterprise: 'premium',
    premium: 'premium',
  };
  return map[plan] || 'essential';
}

export function planDisplayName(plan) {
  const key = normalizePlanKey(plan);
  return DASHBOARD_PLANS.find((p) => p.key === key)?.name ?? 'Essencial';
}
