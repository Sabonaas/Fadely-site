import { motion } from 'framer-motion';
import { Calendar, MessageCircle, Users, DollarSign, BarChart3, Clock, Bell, RefreshCw } from 'lucide-react';
import { useTheme } from '@/lib/ThemeContext';

const benefits = [
  {
    icon: Calendar,
    color: '#4F8EF7',
    title: 'Agendamento Online 24/7',
    description: 'Seus clientes agendam pelo celular a qualquer hora, sem ligação e sem mensagem no WhatsApp. Você recebe notificações em tempo real e tem controle total da agenda.',
    visual: ['09:00 • Corte + Barba', '10:30 • Manicure', '11:00 • Escova', '14:00 • Coloração'],
  },
  {
    icon: MessageCircle,
    color: '#22c55e',
    title: 'Automação via WhatsApp',
    description: 'Envie confirmações, lembretes D-1 e mensagens de follow-up automaticamente. Reduza faltas em até 70% e mantenha seus clientes engajados sem esforço manual.',
    visual: ['✅ Agendamento confirmado!', '⏰ Lembrete: amanhã 14h', '⭐ Avalie seu atendimento', '🎁 Promoção especial para você'],
  },
  {
    icon: Users,
    color: '#a855f7',
    title: 'Gestão de Clientes',
    description: 'Histórico completo de cada cliente: serviços realizados, preferências, alergias, data de aniversário e valor gasto. Fidelize com programas de pontos e promoções personalizadas.',
    visual: ['Ana Lima • 42 visitas', 'Pedro Costa • R$3.200 gasto', 'Bday: 15/07 • Enviar desconto', 'Preferências: sem amônia'],
  },
  {
    icon: DollarSign,
    color: '#f59e0b',
    title: 'Controle Financeiro',
    description: 'Receitas, despesas, comissões e relatórios em tempo real. Integração com meios de pagamento e fechamento de caixa simplificado para você saber exatamente o que entra e sai.',
    visual: ['Receita: R$18.400', 'Comissões: R$3.680', 'Ticket médio: R$148', 'Crescimento: +38%'],
  },
  {
    icon: Bell,
    color: '#ec4899',
    title: 'Lembretes Inteligentes',
    description: 'Lembretes automáticos por WhatsApp 24h antes do agendamento. Seus clientes nunca mais esquecem e você não perde tempo ligando para confirmar.',
    visual: ['D-1: Lembrete enviado', 'D-0: Check-in enviado', 'Após: Solicitar avaliação', 'Retorno sugerido em 30d'],
  },
  {
    icon: BarChart3,
    color: '#06b6d4',
    title: 'Relatórios & Analytics',
    description: 'Dashboards visuais com os dados que importam: serviços mais vendidos, horários de pico, funcionários mais produtivos e projeção de receita para o próximo mês.',
    visual: ['Serviço top: Coloração', 'Pico: Sábado 10-14h', 'Melhor profissional: Ana', 'Projeção: R$22k/mês'],
  },
];

export default function BenefitsSection() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <section id="features" className={`py-28 transition-colors duration-500 ${isDark ? 'bg-[#0A0B0F]' : 'bg-white'}`}>
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-5" style={{
            background: isDark ? 'rgba(79,142,247,0.1)' : 'rgba(79,142,247,0.08)',
            color: '#4F8EF7',
            border: '1px solid rgba(79,142,247,0.2)',
          }}>
            Funcionalidades premium
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: isDark ? 'rgba(255,255,255,0.95)' : 'rgba(8,10,20,0.9)' }}>
            Tudo que você precisa,<br />em um só lugar
          </h2>
          <p className="text-lg max-w-2xl mx-auto" style={{ color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.45)' }}>
            Cada funcionalidade foi pensada especificamente para o mercado de beleza brasileiro.
          </p>
        </motion.div>

        <div className="space-y-6">
          {benefits.map((b, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55, delay: i * 0.04 }}
              className="flex flex-col md:flex-row gap-6 p-7 rounded-2xl"
              style={{
                background: isDark ? 'rgba(255,255,255,0.025)' : 'rgba(0,0,0,0.02)',
                border: isDark ? '1px solid rgba(255,255,255,0.07)' : '1px solid rgba(0,0,0,0.06)',
              }}
            >
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${b.color}18` }}>
                    <b.icon className="w-5 h-5" style={{ color: b.color }} />
                  </div>
                  <h3 className="text-xl font-semibold" style={{ color: isDark ? 'rgba(255,255,255,0.9)' : 'rgba(8,10,20,0.85)' }}>
                    {b.title}
                  </h3>
                </div>
                <p className="text-sm leading-relaxed" style={{ color: isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.5)' }}>
                  {b.description}
                </p>
              </div>

              {/* Mini visual */}
              <div
                className="md:w-56 flex-shrink-0 rounded-xl p-4 space-y-2"
                style={{
                  background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.8)',
                  border: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.06)',
                }}
              >
                {b.visual.map((line, j) => (
                  <motion.div
                    key={j}
                    initial={{ opacity: 0, x: 10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 + j * 0.08 }}
                    className="flex items-center gap-2 py-1.5 px-2.5 rounded-lg text-xs"
                    style={{
                      background: j === 0 ? `${b.color}12` : 'transparent',
                      color: j === 0 ? b.color : isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)',
                      fontWeight: j === 0 ? 500 : 400,
                    }}
                  >
                    {line}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}