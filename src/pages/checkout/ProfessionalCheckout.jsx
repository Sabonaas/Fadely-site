import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, ArrowLeft, Shield, CreditCard, QrCode, FileText, Zap, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { goToLogin } from '@/lib/authRedirect';
import { useTheme } from '@/lib/ThemeContext';

const features = [
  'Até 10 profissionais',
  'Relatórios e analytics completos',
  'Gestão financeira avançada',
  'Automações ilimitadas',
  'Agendamento online premium',
  'Suporte prioritário',
  'Personalização de marca',
  'Integrações avançadas',
];

const paymentMethods = [
  { id: 'credit', label: 'Cartão de Crédito', icon: CreditCard },
  { id: 'pix', label: 'PIX', icon: QrCode },
  { id: 'boleto', label: 'Boleto', icon: FileText },
];

export default function ProfessionalCheckout() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [annual, setAnnual] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('credit');
  const [coupon, setCoupon] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);

  const price = annual ? 63 : 79;
  const totalYear = price * 12;

  const card = (active) => ({
    background: active
      ? isDark ? 'rgba(79,142,247,0.12)' : 'rgba(79,142,247,0.08)'
      : isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
    border: active ? '1.5px solid rgba(79,142,247,0.4)' : isDark ? '1px solid rgba(255,255,255,0.07)' : '1px solid rgba(0,0,0,0.07)',
  });

  return (
    <div className={`min-h-screen transition-colors duration-500 ${isDark ? 'bg-[#0A0B0F]' : 'bg-[#F8F9FC]'} p-6 py-12`}>
      <div className="max-w-5xl mx-auto">
        <Link to="/" className="inline-flex items-center gap-2 text-sm mb-8 transition-opacity hover:opacity-70" style={{ color: isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.45)' }}>
          <ArrowLeft className="w-4 h-4" /> Voltar aos planos
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left — summary */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold mb-6 text-white" style={{
              background: 'linear-gradient(135deg, #4F8EF7, #7B5EEA)',
            }}>
              <Sparkles className="w-3 h-3" /> Plano Professional
            </div>

            <h1 className="text-3xl font-bold mb-3" style={{ color: isDark ? 'rgba(255,255,255,0.95)' : 'rgba(8,10,20,0.9)' }}>
              Assinatura Professional
            </h1>
            <p className="text-sm mb-8" style={{ color: isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.48)' }}>
              O plano ideal para salões, barbearias e clínicas em crescimento.
            </p>

            {/* Billing toggle */}
            <div className="flex gap-3 mb-8">
              {[false, true].map((isAnnual) => (
                <button
                  key={String(isAnnual)}
                  onClick={() => setAnnual(isAnnual)}
                  className="flex-1 py-3 rounded-xl text-sm font-medium transition-all relative"
                  style={card(annual === isAnnual)}
                >
                  <span style={{ color: annual === isAnnual ? '#4F8EF7' : (isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.55)') }}>
                    {isAnnual ? 'Anual' : 'Mensal'}
                  </span>
                  {isAnnual && (
                    <span className="absolute -top-2 right-2 text-xs px-1.5 py-0.5 rounded-full font-semibold text-white" style={{ background: '#22c55e' }}>
                      -20%
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-5xl font-bold" style={{ color: isDark ? '#fff' : 'rgba(8,10,20,0.9)' }}>R${price}</span>
              <span style={{ color: isDark ? 'rgba(255,255,255,0.38)' : 'rgba(0,0,0,0.4)' }}>/mês</span>
            </div>
            {annual && <p className="text-sm text-green-400 mb-6">R${totalYear}/ano · você economiza R${(79-63)*12}</p>}

            {/* Features */}
            <div className="space-y-2.5 mt-6">
              {features.map((f, i) => (
                <div key={i} className="flex items-center gap-2.5 text-sm" style={{ color: isDark ? 'rgba(255,255,255,0.62)' : 'rgba(0,0,0,0.58)' }}>
                  <div className="w-5 h-5 rounded-full bg-blue-500/15 flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3 text-blue-400" />
                  </div>
                  {f}
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right — payment */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
            className="rounded-3xl p-7 md:p-8"
            style={{
              background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.95)',
              border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.08)',
              boxShadow: isDark ? '0 40px 80px rgba(0,0,0,0.5)' : '0 40px 80px rgba(0,0,0,0.08)',
            }}
          >
            <h2 className="text-lg font-semibold mb-6" style={{ color: isDark ? 'rgba(255,255,255,0.9)' : 'rgba(8,10,20,0.85)' }}>
              Forma de pagamento
            </h2>

            {/* Payment method selector */}
            <div className="grid grid-cols-3 gap-2.5 mb-6">
              {paymentMethods.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setPaymentMethod(m.id)}
                  className="flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl text-xs font-medium transition-all"
                  style={card(paymentMethod === m.id)}
                >
                  <m.icon className="w-5 h-5" style={{ color: paymentMethod === m.id ? '#4F8EF7' : (isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.45)') }} />
                  <span style={{ color: paymentMethod === m.id ? '#4F8EF7' : (isDark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.5)') }}>{m.label}</span>
                </button>
              ))}
            </div>

            {/* Credit card fields */}
            {paymentMethod === 'credit' && (
              <div className="space-y-3 mb-6">
                {[
                  { label: 'Número do cartão', placeholder: '0000 0000 0000 0000' },
                  { label: 'Nome no cartão', placeholder: 'Como aparece no cartão' },
                ].map((field) => (
                  <div key={field.label}>
                    <label className="text-xs font-medium mb-1.5 block" style={{ color: isDark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.5)' }}>{field.label}</label>
                    <input
                      placeholder={field.placeholder}
                      className="w-full h-11 px-4 rounded-xl text-sm outline-none transition-all"
                      style={{
                        background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
                        border: isDark ? '1px solid rgba(255,255,255,0.09)' : '1px solid rgba(0,0,0,0.09)',
                        color: isDark ? 'rgba(255,255,255,0.85)' : 'rgba(0,0,0,0.8)',
                      }}
                    />
                  </div>
                ))}
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Validade', placeholder: 'MM/AA' },
                    { label: 'CVV', placeholder: '000' },
                  ].map((field) => (
                    <div key={field.label}>
                      <label className="text-xs font-medium mb-1.5 block" style={{ color: isDark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.5)' }}>{field.label}</label>
                      <input
                        placeholder={field.placeholder}
                        className="w-full h-11 px-4 rounded-xl text-sm outline-none"
                        style={{
                          background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
                          border: isDark ? '1px solid rgba(255,255,255,0.09)' : '1px solid rgba(0,0,0,0.09)',
                          color: isDark ? 'rgba(255,255,255,0.85)' : 'rgba(0,0,0,0.8)',
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {paymentMethod === 'pix' && (
              <div className="text-center py-6 mb-6 rounded-2xl" style={{
                background: isDark ? 'rgba(34,197,94,0.06)' : 'rgba(34,197,94,0.04)',
                border: '1px solid rgba(34,197,94,0.2)',
              }}>
                <QrCode className="w-12 h-12 mx-auto mb-3 text-green-400" />
                <p className="text-sm font-medium" style={{ color: isDark ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.75)' }}>PIX é aprovado na hora</p>
                <p className="text-xs mt-1" style={{ color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.45)' }}>O QR code será gerado após confirmação</p>
              </div>
            )}

            {paymentMethod === 'boleto' && (
              <div className="text-center py-6 mb-6 rounded-2xl" style={{
                background: isDark ? 'rgba(245,158,11,0.06)' : 'rgba(245,158,11,0.04)',
                border: '1px solid rgba(245,158,11,0.2)',
              }}>
                <FileText className="w-12 h-12 mx-auto mb-3 text-yellow-400" />
                <p className="text-sm font-medium" style={{ color: isDark ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.75)' }}>Boleto bancário</p>
                <p className="text-xs mt-1" style={{ color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.45)' }}>Vencimento em 3 dias úteis</p>
              </div>
            )}

            {/* Coupon */}
            <div className="flex gap-2 mb-6">
              <input
                value={coupon}
                onChange={e => setCoupon(e.target.value)}
                placeholder="Cupom de desconto"
                className="flex-1 h-10 px-4 rounded-xl text-sm outline-none"
                style={{
                  background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
                  border: isDark ? '1px solid rgba(255,255,255,0.09)' : '1px solid rgba(0,0,0,0.09)',
                  color: isDark ? 'rgba(255,255,255,0.85)' : 'rgba(0,0,0,0.8)',
                }}
              />
              <button
                className="h-10 px-4 rounded-xl text-sm font-medium transition-all"
                style={{
                  background: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)',
                  color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)',
                  border: isDark ? '1px solid rgba(255,255,255,0.09)' : '1px solid rgba(0,0,0,0.08)',
                }}
              >
                Aplicar
              </button>
            </div>

            {/* Total */}
            <div className="py-4 mb-5 flex items-center justify-between" style={{ borderTop: isDark ? '1px solid rgba(255,255,255,0.07)' : '1px solid rgba(0,0,0,0.07)', borderBottom: isDark ? '1px solid rgba(255,255,255,0.07)' : '1px solid rgba(0,0,0,0.07)' }}>
              <span className="text-sm" style={{ color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>Total {annual ? 'anual' : 'mensal'}</span>
              <span className="text-xl font-bold" style={{ color: isDark ? '#fff' : 'rgba(8,10,20,0.9)' }}>
                R${annual ? totalYear : price}
              </span>
            </div>

            <button
              onClick={() => goToLogin('/onboarding')}
              className="w-full h-12 rounded-2xl text-white font-semibold text-sm transition-all"
              style={{
                background: 'linear-gradient(135deg, #4F8EF7 0%, #7B5EEA 100%)',
                boxShadow: '0 0 28px rgba(79,142,247,0.3)',
              }}
            >
              Assinar agora · R${annual ? totalYear : price}/{annual ? 'ano' : 'mês'}
            </button>

            <div className="flex items-center justify-center gap-2 mt-4">
              <Shield className="w-3.5 h-3.5 text-green-400" />
              <span className="text-xs" style={{ color: isDark ? 'rgba(255,255,255,0.32)' : 'rgba(0,0,0,0.35)' }}>
                Pagamento seguro · Cancele quando quiser
              </span>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}