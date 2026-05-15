import { motion } from 'framer-motion';
import { Check, ArrowLeft, Shield, Zap, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { goToLogin } from '@/lib/authRedirect';
import { useTheme } from '@/lib/ThemeContext';

const features = [
  '1 profissional incluído',
  'Página de agendamento online',
  'Lembretes automáticos via WhatsApp',
  'Agenda online 24/7',
  'Relatórios básicos',
  'Suporte por e-mail',
];

export default function StarterCheckout() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className={`min-h-screen transition-colors duration-500 ${isDark ? 'bg-[#0A0B0F]' : 'bg-[#F8F9FC]'} flex items-center justify-center p-6`}>
      <div className="w-full max-w-lg">
        {/* Back */}
        <Link to="/" className="inline-flex items-center gap-2 text-sm mb-8 transition-opacity hover:opacity-70" style={{ color: isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.45)' }}>
          <ArrowLeft className="w-4 h-4" /> Voltar
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="rounded-3xl p-8 md:p-10"
          style={{
            background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.95)',
            border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.08)',
            boxShadow: isDark ? '0 40px 80px rgba(0,0,0,0.5)' : '0 40px 80px rgba(0,0,0,0.08)',
          }}
        >
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium mb-4" style={{
              background: 'rgba(79,142,247,0.12)',
              color: '#4F8EF7',
              border: '1px solid rgba(79,142,247,0.2)',
            }}>
              <Star className="w-3 h-3" /> Plano Starter — 14 dias grátis
            </div>
            <h1 className="text-3xl font-bold mb-2" style={{ color: isDark ? 'rgba(255,255,255,0.95)' : 'rgba(8,10,20,0.9)' }}>
              Comece seu teste grátis
            </h1>
            <p className="text-sm" style={{ color: isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.48)' }}>
              14 dias completos, sem cartão de crédito. Após o trial, R$39/mês.
            </p>
          </div>

          {/* Price display */}
          <div className="text-center py-6 mb-6 rounded-2xl" style={{
            background: 'linear-gradient(135deg, rgba(79,142,247,0.08), rgba(123,94,234,0.06))',
            border: '1px solid rgba(79,142,247,0.15)',
          }}>
            <div className="text-5xl font-bold mb-1" style={{
              background: 'linear-gradient(135deg, #4F8EF7, #7B5EEA)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>R$0</div>
            <p className="text-sm" style={{ color: isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.48)' }}>por 14 dias, depois R$39/mês</p>
          </div>

          {/* Features */}
          <ul className="space-y-3 mb-8">
            {features.map((f, i) => (
              <li key={i} className="flex items-center gap-2.5 text-sm" style={{ color: isDark ? 'rgba(255,255,255,0.65)' : 'rgba(0,0,0,0.6)' }}>
                <div className="w-5 h-5 rounded-full bg-blue-500/15 flex items-center justify-center flex-shrink-0">
                  <Check className="w-3 h-3 text-blue-400" />
                </div>
                {f}
              </li>
            ))}
          </ul>

          {/* CTA */}
          <button
            onClick={() => goToLogin('/onboarding')}
            className="w-full h-13 rounded-2xl text-white font-semibold text-base transition-all"
            style={{
              height: '52px',
              background: 'linear-gradient(135deg, #4F8EF7 0%, #7B5EEA 100%)',
              boxShadow: '0 0 32px rgba(79,142,247,0.35)',
            }}
          >
            Criar conta e começar grátis
          </button>

          {/* Trust */}
          <div className="flex items-center justify-center gap-2 mt-5">
            <Shield className="w-4 h-4 text-green-400" />
            <span className="text-xs" style={{ color: isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.38)' }}>
              Sem cobrança. Cancele quando quiser.
            </span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}