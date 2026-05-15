import { motion } from 'framer-motion';
import { X, Check, Zap } from 'lucide-react';
import { useTheme } from '@/lib/ThemeContext';

const comparisons = [
  { label: 'Agenda em papel ou planilha', old: true, issues: ['Sem acesso remoto', 'Sem lembretes automáticos', 'Sem relatórios', 'Fácil de perder dados'] },
  { label: 'Só WhatsApp', old: true, issues: ['Horas confirmando manualmente', 'Sem histórico organizado', 'Sem métricas', 'Confusão de horários'] },
  { label: 'ERPs genéricos e complicados', old: true, issues: ['Interface difícil', 'Não feito para beleza', 'Suporte ruim', 'Caro demais'] },
];

const fadelyDiff = [
  { title: 'Feito para beleza', desc: 'Cada funcionalidade pensada para salões, barbearias e clínicas estéticas.' },
  { title: 'UX nível Apple', desc: 'Interface intuitiva que qualquer profissional aprende em minutos, sem treinamento.' },
  { title: 'Automação real', desc: 'WhatsApp, lembretes, relatórios e comissões: automáticos, não manuais.' },
  { title: 'Suporte humanizado', desc: 'Time brasileiro especializado em beleza, disponível via WhatsApp e chat.' },
  { title: 'Onboarding em 10 min', desc: 'Da conta ao primeiro agendamento em menos de 10 minutos.' },
  { title: 'Preço justo', desc: 'Planos a partir de R$79/mês com 14 dias grátis. Sem surpresas na fatura.' },
];

export default function WhyFadelySection() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <section className={`py-28 transition-colors duration-500 ${isDark ? 'bg-[#0A0B0F]' : 'bg-white'}`}>
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-5" style={{
            background: isDark ? 'rgba(239,68,68,0.1)' : 'rgba(239,68,68,0.07)',
            color: '#ef4444',
            border: '1px solid rgba(239,68,68,0.2)',
          }}>
            Por que mudar agora?
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: isDark ? 'rgba(255,255,255,0.95)' : 'rgba(8,10,20,0.9)' }}>
            Seu negócio merece<br />algo melhor
          </h2>
          <p className="text-lg max-w-xl mx-auto" style={{ color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.45)' }}>
            Enquanto você usa sistemas ultrapassados, seus concorrentes estão crescendo com automação e dados.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Old ways */}
          <div className="space-y-4">
            <div className="text-sm font-semibold mb-4 flex items-center gap-2" style={{ color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)' }}>
              <X className="w-4 h-4 text-red-400" /> Como a maioria ainda trabalha
            </div>
            {comparisons.map((c, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-5 rounded-2xl"
                style={{
                  background: isDark ? 'rgba(239,68,68,0.05)' : 'rgba(239,68,68,0.03)',
                  border: isDark ? '1px solid rgba(239,68,68,0.15)' : '1px solid rgba(239,68,68,0.1)',
                }}
              >
                <div className="font-medium mb-3 text-sm" style={{ color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.65)' }}>
                  {c.label}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {c.issues.map((issue, j) => (
                    <div key={j} className="flex items-center gap-1.5 text-xs" style={{ color: isDark ? 'rgba(255,100,100,0.7)' : 'rgba(200,50,50,0.7)' }}>
                      <X className="w-3 h-3 flex-shrink-0" />
                      {issue}
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Fadely way */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="p-8 rounded-2xl relative overflow-hidden"
            style={{
              background: isDark
                ? 'linear-gradient(135deg, rgba(79,142,247,0.08) 0%, rgba(123,94,234,0.06) 100%)'
                : 'linear-gradient(135deg, rgba(79,142,247,0.06) 0%, rgba(123,94,234,0.04) 100%)',
              border: '1px solid rgba(79,142,247,0.2)',
            }}
          >
            <div className="absolute top-4 right-4">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-white" style={{ background: 'linear-gradient(135deg, #4F8EF7, #7B5EEA)' }}>
                <Zap className="w-3 h-3" /> Fadely
              </div>
            </div>
            <div className="text-sm font-semibold mb-6 flex items-center gap-2" style={{ color: '#4F8EF7' }}>
              <Check className="w-4 h-4" /> Como você vai trabalhar com o Fadely
            </div>
            <div className="space-y-4">
              {fadelyDiff.map((d, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 + i * 0.07 }}
                  className="flex gap-3"
                >
                  <div className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-blue-400" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold mb-0.5" style={{ color: isDark ? 'rgba(255,255,255,0.85)' : 'rgba(8,10,20,0.8)' }}>{d.title}</div>
                    <div className="text-xs" style={{ color: isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.5)' }}>{d.desc}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}