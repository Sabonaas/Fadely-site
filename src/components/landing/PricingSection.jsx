import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Sparkles, ArrowRight } from 'lucide-react';
import { goToLogin } from '@/lib/authRedirect';
import { useTheme } from '@/lib/ThemeContext';
import { useNavigate } from 'react-router-dom';

const plans = [
  {
    name: 'Essencial',
    monthly: 39,
    yearly: 31,
    period: '/mês',
    description: 'Para profissionais autônomos',
    features: ['1 profissional', 'Página de agendamento', 'WhatsApp automático', 'Agenda online', 'Suporte por e-mail'],
    cta: 'Começar grátis',
    route: '/checkout/starter',
    popular: false,
    trial: true,
    color: '#4F8EF7',
  },
  {
    name: 'Crescimento',
    monthly: 79,
    yearly: 63,
    period: '/mês',
    description: 'Para equipes em crescimento',
    features: ['Até 10 profissionais', 'Relatórios completos', 'Analytics avançado', 'Gestão financeira', 'Automações ilimitadas', 'Suporte prioritário'],
    cta: 'Escolher Crescimento',
    route: '/checkout/professional',
    popular: true,
    trial: false,
    color: '#4F8EF7',
  },
  {
    name: 'Elite',
    monthly: 149,
    yearly: 119,
    period: '/mês',
    description: 'Para redes e franquias',
    features: ['Profissionais ilimitados', 'Multi unidades', 'Permissões avançadas', 'Analytics premium', 'API access', 'Gerente de conta dedicado'],
    cta: 'Falar com vendas',
    route: '/enterprise',
    popular: false,
    trial: false,
    color: '#a855f7',
  },
];

export default function PricingSection() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [annual, setAnnual] = useState(false);
  const navigate = useNavigate();

  const handleCTA = (plan) => {
    if (plan.name === 'Elite') {
      navigate('/enterprise');
    } else {
      goToLogin(plan.route);
    }
  };

  return (
    <section id="pricing" className={`py-28 relative transition-colors duration-500 ${isDark ? 'bg-[#0A0B0F]' : 'bg-[#F8F9FC]'}`}>
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-5" style={{
            background: isDark ? 'rgba(79,142,247,0.1)' : 'rgba(79,142,247,0.08)',
            color: '#4F8EF7',
            border: '1px solid rgba(79,142,247,0.2)',
          }}>
            Planos e preços
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: isDark ? 'rgba(255,255,255,0.95)' : 'rgba(8,10,20,0.9)' }}>
            Planos simples e transparentes
          </h2>
          <p className="text-lg max-w-xl mx-auto mb-8" style={{ color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.45)' }}>
            Comece grátis por 14 dias, sem cartão de crédito. Cancele quando quiser.
          </p>

          {/* Annual toggle */}
          <div className="inline-flex items-center gap-3 p-1 rounded-xl" style={{
            background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
            border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.07)',
          }}>
            <button
              onClick={() => setAnnual(false)}
              className="text-sm font-medium px-4 py-1.5 rounded-lg transition-all"
              style={{
                background: !annual ? (isDark ? 'rgba(255,255,255,0.1)' : 'white') : 'transparent',
                color: !annual ? (isDark ? 'white' : 'rgba(0,0,0,0.8)') : (isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.45)'),
                boxShadow: !annual ? '0 2px 8px rgba(0,0,0,0.1)' : 'none',
              }}
            >
              Mensal
            </button>
            <button
              onClick={() => setAnnual(true)}
              className="text-sm font-medium px-4 py-1.5 rounded-lg transition-all flex items-center gap-2"
              style={{
                background: annual ? (isDark ? 'rgba(255,255,255,0.1)' : 'white') : 'transparent',
                color: annual ? (isDark ? 'white' : 'rgba(0,0,0,0.8)') : (isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.45)'),
                boxShadow: annual ? '0 2px 8px rgba(0,0,0,0.1)' : 'none',
              }}
            >
              Anual
              <span className="text-xs px-1.5 py-0.5 rounded-md font-semibold text-white" style={{ background: '#22c55e' }}>-20%</span>
            </button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {plans.map((plan, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="relative rounded-2xl p-7 flex flex-col transition-all duration-300"
              style={{
                border: plan.popular ? '1px solid rgba(79,142,247,0.35)' : isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.07)',
                background: plan.popular
                  ? isDark ? 'rgba(79,142,247,0.06)' : 'rgba(79,142,247,0.04)'
                  : isDark ? 'rgba(255,255,255,0.025)' : 'rgba(255,255,255,0.9)',
                boxShadow: plan.popular
                  ? '0 0 40px rgba(79,142,247,0.1)'
                  : isDark ? 'none' : '0 2px 20px rgba(0,0,0,0.04)',
              }}
            >
              {plan.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-white text-xs font-semibold" style={{ background: 'linear-gradient(135deg, #4F8EF7, #7B5EEA)' }}>
                    <Sparkles className="w-3 h-3" /> Mais popular
                  </span>
                </div>
              )}

              <div className="mb-5">
                <h3 className="text-base font-semibold mb-0.5" style={{ color: isDark ? 'rgba(255,255,255,0.88)' : 'rgba(8,10,20,0.82)' }}>{plan.name}</h3>
                <p className="text-xs" style={{ color: isDark ? 'rgba(255,255,255,0.38)' : 'rgba(0,0,0,0.42)' }}>{plan.description}</p>
              </div>

              <div className="mb-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold" style={{ color: isDark ? '#fff' : 'rgba(8,10,20,0.9)' }}>
                    R${annual ? plan.yearly : plan.monthly}
                  </span>
                  <span className="text-sm" style={{ color: isDark ? 'rgba(255,255,255,0.38)' : 'rgba(0,0,0,0.4)' }}>/mês</span>
                </div>
                {annual && (
                  <p className="text-xs mt-1" style={{ color: '#22c55e' }}>
                    Economize R${(plan.monthly - plan.yearly) * 12}/ano
                  </p>
                )}
              </div>

              <ul className="space-y-2.5 mb-7 flex-1">
                {plan.features.map((f, j) => (
                  <li key={j} className="flex items-center gap-2.5 text-sm" style={{ color: isDark ? 'rgba(255,255,255,0.58)' : 'rgba(0,0,0,0.55)' }}>
                    <Check className="w-3.5 h-3.5 flex-shrink-0 text-blue-400" />
                    {f}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleCTA(plan)}
                className="w-full h-11 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all"
                style={plan.popular ? {
                  background: 'linear-gradient(135deg, #4F8EF7 0%, #7B5EEA 100%)',
                  color: 'white',
                  boxShadow: '0 0 24px rgba(79,142,247,0.3)',
                } : {
                  background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
                  color: isDark ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.7)',
                  border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)',
                }}
              >
                {plan.cta}
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              {plan.trial && (
                <p className="text-center text-xs mt-3" style={{ color: isDark ? 'rgba(255,255,255,0.28)' : 'rgba(0,0,0,0.32)' }}>
                  14 dias grátis · Sem cartão de crédito
                </p>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}