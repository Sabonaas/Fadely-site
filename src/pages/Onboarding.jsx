import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabaseClient';
import { goToLogin } from '@/lib/authRedirect';
import * as db from '@/repositories/db';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAuth } from '@/lib/AuthContext';
import { useBusiness } from '@/hooks/useBusiness';
import { Input } from '@/components/ui/input';
import {
  ArrowRight, ArrowLeft, Sparkles, Scissors, Building2,
  Users, MessageSquare, Globe, Clock, Check, Zap
} from 'lucide-react';
import FadelyLogo from '@/components/FadelyLogo';

const businessTypes = [
  { value: 'salon', label: 'Salão de Beleza', emoji: '💇', desc: 'Cortes, coloração, tratamentos' },
  { value: 'barbershop', label: 'Barbearia', emoji: '✂️', desc: 'Corte, barba, bigode' },
  { value: 'aesthetics_clinic', label: 'Clínica de Estética', emoji: '✨', desc: 'Limpeza, peeling, tratamentos' },
  { value: 'nail_studio', label: 'Studio de Unhas', emoji: '💅', desc: 'Manicure, pedicure, nail art' },
  { value: 'wellness', label: 'Wellness & Spa', emoji: '🧘', desc: 'Massagem, relaxamento, spa' },
  { value: 'other', label: 'Outro Negócio', emoji: '🏢', desc: 'Personalizar depois' },
];

const steps = [
  { title: 'Seu segmento', subtitle: 'Qual tipo de estabelecimento você tem?' },
  { title: 'Nome do estabelecimento', subtitle: 'Como seus clientes te conhecem?' },
  { title: 'Sobre sua equipe', subtitle: 'Quantas pessoas trabalham com você?' },
  { title: 'Horário de funcionamento', subtitle: 'Quando seu estabelecimento abre?' },
  { title: 'WhatsApp & Contato', subtitle: 'Para receber notificações e confirmar agendamentos' },
  { title: 'Pronto para voar! 🚀', subtitle: 'Sua plataforma está configurada' },
];

export default function Onboarding() {
  const { isAuthenticated, isLoadingAuth } = useAuth();
  const { business, isLoading: isLoadingBusiness } = useBusiness();
  const [step, setStep] = useState(0);
  const [data, setData] = useState({
    type: '',
    name: '',
    employee_count: 1,
    open_time: '08:00',
    close_time: '18:00',
    phone: '',
    whatsapp_connected: false,
  });
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!isLoadingAuth && !isAuthenticated) {
      goToLogin('/onboarding');
      return;
    }
    if (!isLoadingBusiness && business?.onboarding_completed) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, isLoadingAuth, business, isLoadingBusiness, navigate]);

  if (isLoadingAuth || isLoadingBusiness) {
    return (
      <div className="min-h-screen bg-[#08090E] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white/10 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  const canProceed = () => {
    if (step === 0) return !!data.type;
    if (step === 1) return data.name.trim().length >= 2;
    if (step === 2) return data.employee_count >= 1;
    return true;
  };

  const finishOnboarding = async () => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        goToLogin('/onboarding');
        return;
      }
      await db.completeOnboardingRpc({
        name: data.name.trim(),
        type: data.type,
        employee_count: data.employee_count,
        phone: data.phone,
        whatsapp_connected: data.whatsapp_connected,
        open_time: data.open_time,
        close_time: data.close_time,
        slug_hint: db.slugifyBusinessName(data.name),
      });
      await queryClient.invalidateQueries({ queryKey: ['my-business'] });
      await queryClient.refetchQueries({ queryKey: ['my-business'] });
      navigate('/dashboard');
    } catch (e) {
      let msg = e?.message || 'Não foi possível criar o estabelecimento.';
      if (e?.code === '23505' || /slug/i.test(msg)) {
        msg = 'Este link de agendamento já está em uso. Tente novamente — um sufixo será adicionado automaticamente.';
      }
      if (msg.includes('onboarding_already_completed')) {
        msg = 'Onboarding já concluído. A redirecionar…';
        navigate('/dashboard');
        return;
      }
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  // Time options
  const timeOptions = [];
  for (let h = 6; h <= 23; h++) {
    timeOptions.push(`${String(h).padStart(2,'0')}:00`);
    if (h < 23) timeOptions.push(`${String(h).padStart(2,'0')}:30`);
  }

  return (
    <div className="min-h-screen bg-[#08090E] flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      {/* Ambient */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-blue-600/6 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-1/4 w-72 h-72 bg-purple-600/5 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <FadelyLogo size="md" />
        </div>

        {/* Progress bar */}
        <div className="flex gap-1.5 mb-8">
          {steps.map((_, i) => (
            <motion.div
              key={i}
              className="h-1 flex-1 rounded-full"
              style={{ background: i <= step ? '#4F8EF7' : 'rgba(255,255,255,0.08)' }}
              animate={{ background: i <= step ? '#4F8EF7' : 'rgba(255,255,255,0.08)' }}
              transition={{ duration: 0.3 }}
            />
          ))}
        </div>

        {/* Card */}
        <div className="rounded-2xl overflow-hidden"
          style={{
            background: 'rgba(255,255,255,0.025)',
            border: '1px solid rgba(255,255,255,0.07)',
            backdropFilter: 'blur(24px)',
          }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="p-6 sm:p-8"
            >
              <div className="mb-6">
                <p className="text-blue-400 text-xs font-medium uppercase tracking-wider mb-2">
                  Passo {step + 1} de {steps.length}
                </p>
                <h2 className="text-xl sm:text-2xl font-bold text-white mb-1">{steps[step].title}</h2>
                <p className="text-white/35 text-sm">{steps[step].subtitle}</p>
              </div>

              {/* Step 0: Business type */}
              {step === 0 && (
                <div className="grid grid-cols-2 gap-2.5">
                  {businessTypes.map(bt => (
                    <motion.button
                      key={bt.value}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => { setData(d => ({ ...d, type: bt.value })); }}
                      className="p-4 rounded-xl border text-left transition-all duration-200 relative overflow-hidden group"
                      style={{
                        background: data.type === bt.value ? 'rgba(79,142,247,0.1)' : 'rgba(255,255,255,0.02)',
                        border: data.type === bt.value ? '1px solid rgba(79,142,247,0.4)' : '1px solid rgba(255,255,255,0.07)',
                        boxShadow: data.type === bt.value ? '0 0 20px rgba(79,142,247,0.1)' : 'none',
                      }}
                    >
                      {data.type === bt.value && (
                        <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center">
                          <Check className="w-2.5 h-2.5 text-white" />
                        </div>
                      )}
                      <div className="text-2xl mb-2">{bt.emoji}</div>
                      <p className="text-white/85 text-sm font-semibold leading-tight">{bt.label}</p>
                      <p className="text-white/30 text-[11px] mt-0.5 leading-tight">{bt.desc}</p>
                    </motion.button>
                  ))}
                </div>
              )}

              {/* Step 1: Business name */}
              {step === 1 && (
                <div className="space-y-4">
                  <input
                    type="text"
                    value={data.name}
                    onChange={e => setData(d => ({ ...d, name: e.target.value }))}
                    onKeyDown={e => e.key === 'Enter' && canProceed() && setStep(s => s + 1)}
                    placeholder="Ex: Studio Maria, Barbearia Silva..."
                    className="w-full h-12 px-4 rounded-xl text-white placeholder:text-white/25 text-sm focus:outline-none transition-all"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
                    autoFocus
                  />
                  {data.name.length >= 2 && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="px-3 py-2 rounded-lg text-xs"
                      style={{ background: 'rgba(79,142,247,0.08)', border: '1px solid rgba(79,142,247,0.15)' }}
                    >
                      <span className="text-white/40">Sua página será: </span>
                      <span className="text-blue-400 font-mono">
                        fadely.app/{data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}
                      </span>
                    </motion.div>
                  )}
                </div>
              )}

              {/* Step 2: Team size */}
              {step === 2 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-center gap-5 py-4">
                    <button
                      onClick={() => setData(d => ({ ...d, employee_count: Math.max(1, d.employee_count - 1) }))}
                      className="w-12 h-12 rounded-2xl border border-white/10 bg-white/5 text-white flex items-center justify-center hover:bg-white/10 text-xl font-light transition-all"
                    >
                      −
                    </button>
                    <motion.div
                      key={data.employee_count}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="text-5xl font-bold text-white min-w-[80px] text-center"
                    >
                      {data.employee_count}
                    </motion.div>
                    <button
                      onClick={() => setData(d => ({ ...d, employee_count: d.employee_count + 1 }))}
                      className="w-12 h-12 rounded-2xl border border-white/10 bg-white/5 text-white flex items-center justify-center hover:bg-white/10 text-xl font-light transition-all"
                    >
                      +
                    </button>
                  </div>
                  <p className="text-center text-white/30 text-sm flex items-center justify-center gap-2">
                    <Users className="w-4 h-4" />
                    {data.employee_count === 1 ? 'Apenas você' : `Incluindo você`}
                  </p>
                </div>
              )}

              {/* Step 3: Working hours */}
              {step === 3 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-white/40 text-xs font-medium uppercase tracking-wide mb-2 block">
                        Abre às
                      </label>
                      <select
                        value={data.open_time}
                        onChange={e => setData(d => ({ ...d, open_time: e.target.value }))}
                        className="w-full h-11 px-3 rounded-xl text-white text-sm focus:outline-none"
                        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
                      >
                        {timeOptions.map(t => <option key={t} value={t} style={{ background: '#1a1b20' }}>{t}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-white/40 text-xs font-medium uppercase tracking-wide mb-2 block">
                        Fecha às
                      </label>
                      <select
                        value={data.close_time}
                        onChange={e => setData(d => ({ ...d, close_time: e.target.value }))}
                        className="w-full h-11 px-3 rounded-xl text-white text-sm focus:outline-none"
                        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
                      >
                        {timeOptions.map(t => <option key={t} value={t} style={{ background: '#1a1b20' }}>{t}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-3 rounded-xl"
                    style={{ background: 'rgba(79,142,247,0.05)', border: '1px solid rgba(79,142,247,0.12)' }}>
                    <Clock className="w-4 h-4 text-blue-400 flex-shrink-0" />
                    <p className="text-white/50 text-xs">
                      Clientes só poderão agendar entre {data.open_time} e {data.close_time}
                    </p>
                  </div>
                </div>
              )}

              {/* Step 4: WhatsApp */}
              {step === 4 && (
                <div className="space-y-4">
                  <input
                    type="tel"
                    value={data.phone}
                    onChange={e => setData(d => ({ ...d, phone: e.target.value }))}
                    placeholder="(11) 99999-9999"
                    className="w-full h-12 px-4 rounded-xl text-white placeholder:text-white/25 text-sm focus:outline-none transition-all"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
                  />
                  <div className="flex items-start gap-3 p-4 rounded-xl"
                    style={{ background: 'rgba(37,211,102,0.05)', border: '1px solid rgba(37,211,102,0.12)' }}>
                    <MessageSquare className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-white/70 text-sm font-medium">Automações WhatsApp</p>
                      <p className="text-white/30 text-xs mt-1 leading-relaxed">
                        Confirmações, lembretes e cancelamentos enviados automaticamente para seus clientes.
                      </p>
                    </div>
                  </div>
                  <p className="text-white/20 text-xs text-center">Opcional — você pode configurar depois nas configurações.</p>
                </div>
              )}

              {/* Step 5: Success */}
              {step === 5 && (
                <div className="text-center py-4">
                  <motion.div
                    initial={{ scale: 0, rotate: -90 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', stiffness: 250, damping: 20, delay: 0.1 }}
                    className="w-20 h-20 rounded-2xl mx-auto mb-6 flex items-center justify-center"
                    style={{ background: 'linear-gradient(135deg, #4F8EF7, #7B5EEA)', boxShadow: '0 0 48px rgba(79,142,247,0.35)' }}
                  >
                    <Zap className="w-10 h-10 text-white" />
                  </motion.div>
                  <h3 className="text-xl font-bold text-white mb-2">{data.name}</h3>
                  <p className="text-white/40 text-sm mb-4">Sua página de agendamento estará disponível em:</p>
                  <div className="inline-flex items-center px-4 py-2 rounded-xl mb-6"
                    style={{ background: 'rgba(79,142,247,0.08)', border: '1px solid rgba(79,142,247,0.2)' }}>
                    <Globe className="w-3.5 h-3.5 text-blue-400 mr-2" />
                    <span className="text-blue-400 text-sm font-mono">
                      fadely.app/{data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}
                    </span>
                  </div>
                  <div className="space-y-2 text-left">
                    {[
                      'Agendamento online ativado',
                      'Notificações configuradas',
                      'Dashboard pronto para uso',
                    ].map((item, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 + i * 0.1 }}
                        className="flex items-center gap-2.5 text-sm text-white/50"
                      >
                        <div className="w-4 h-4 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                          <Check className="w-2.5 h-2.5 text-green-400" />
                        </div>
                        {item}
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex justify-between items-center px-6 sm:px-8 py-5 border-t border-white/[0.05]">
            <button
              onClick={() => setStep(s => Math.max(s - 1, 0))}
              disabled={step === 0}
              className="flex items-center gap-2 text-sm text-white/35 hover:text-white/60 disabled:opacity-0 transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar
            </button>

            {step < steps.length - 1 ? (
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => setStep(s => s + 1)}
                disabled={!canProceed()}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                style={{
                  background: canProceed() ? 'linear-gradient(135deg, #4F8EF7, #7B5EEA)' : 'rgba(255,255,255,0.08)',
                  boxShadow: canProceed() ? '0 0 20px rgba(79,142,247,0.25)' : 'none',
                }}
              >
                Continuar
                <ArrowRight className="w-4 h-4" />
              </motion.button>
            ) : (
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={finishOnboarding}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition-all"
                style={{
                  background: 'linear-gradient(135deg, #4F8EF7, #7B5EEA)',
                  boxShadow: '0 0 24px rgba(79,142,247,0.3)',
                  opacity: saving ? 0.7 : 1,
                }}
              >
                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Configurando...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    Acessar Dashboard
                  </>
                )}
              </motion.button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}