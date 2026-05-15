import { motion } from 'framer-motion';
import { Star, TrendingUp, Users, Calendar } from 'lucide-react';
import { useTheme } from '@/lib/ThemeContext';

const testimonials = [
  {
    name: 'Fernanda Alves',
    role: 'Proprietária • Studio Fernanda Alves',
    city: 'São Paulo, SP',
    avatar: 'FA',
    color: '#ec4899',
    quote: 'Desde que comecei a usar o Fadely, minha agenda está sempre cheia. Os lembretes automáticos via WhatsApp reduziram minhas faltas em quase 70%. Simplesmente incrível.',
    metric: '+70% menos faltas',
  },
  {
    name: 'Carlos Mendes',
    role: 'Dono • Barbearia Kings',
    city: 'Rio de Janeiro, RJ',
    avatar: 'CM',
    color: '#4F8EF7',
    quote: 'Antes eu perdia tempo no WhatsApp confirmando todo agendamento. Hoje meus clientes agendam sozinhos pelo link e eu só cuido do que realmente importa: o atendimento.',
    metric: '3h economizadas/dia',
  },
  {
    name: 'Juliana Costa',
    role: 'Gestora • Clínica Estética Pelle',
    city: 'Belo Horizonte, MG',
    avatar: 'JC',
    color: '#a855f7',
    quote: 'O controle financeiro do Fadely me deu uma visão que eu nunca tive do meu negócio. Hoje sei exatamente quanto cada profissional gera e onde está meu lucro real.',
    metric: '+42% de receita',
  },
  {
    name: 'Marcos Oliveira',
    role: 'Sócio • Hair & Co. (3 unidades)',
    city: 'Curitiba, PR',
    avatar: 'MO',
    color: '#22c55e',
    quote: 'Gerenciar 3 unidades era um caos. Com o Fadely tenho tudo centralizado: agenda, equipe, financeiro e relatórios. É o sistema que eu estava procurando há anos.',
    metric: '3 unidades integradas',
  },
  {
    name: 'Priscila Souza',
    role: 'Manicure • Studio PS Nails',
    city: 'Fortaleza, CE',
    avatar: 'PS',
    color: '#f59e0b',
    quote: 'Comecei usando no plano gratuito e em 2 semanas já vi o resultado. Meus clientes amaram o agendamento online e minha fila de espera dobrou de tamanho.',
    metric: '2x mais clientes',
  },
  {
    name: 'Rafael Lima',
    role: 'Proprietário • Espaço Well-being',
    city: 'Recife, PE',
    avatar: 'RL',
    color: '#06b6d4',
    quote: 'A automação do WhatsApp paga o plano sozinha. Sem contar o tempo que eu economizo e a profissionalização que trouxe para o meu negócio. Recomendo demais.',
    metric: 'ROI em 2 semanas',
  },
];

const metrics = [
  { icon: TrendingUp, value: '+38%', label: 'aumento médio de receita', color: '#22c55e' },
  { icon: Calendar, value: '-70%', label: 'redução em faltas', color: '#4F8EF7' },
  { icon: Users, value: '2x', label: 'mais clientes fidelizados', color: '#a855f7' },
];

export default function TestimonialsSection() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <section id="testimonials" className={`py-28 transition-colors duration-500 ${isDark ? 'bg-[#060709]' : 'bg-[#F8F9FC]'}`}>
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-5" style={{
            background: isDark ? 'rgba(234,179,8,0.1)' : 'rgba(234,179,8,0.08)',
            color: '#eab308',
            border: '1px solid rgba(234,179,8,0.2)',
          }}>
            Histórias reais de sucesso
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: isDark ? 'rgba(255,255,255,0.95)' : 'rgba(8,10,20,0.9)' }}>
            Quem usa, não volta<br />para o sistema antigo
          </h2>
          <p className="text-lg max-w-xl mx-auto" style={{ color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.45)' }}>
            Mais de 12.000 profissionais de beleza já transformaram seus negócios com o Fadely.
          </p>
        </motion.div>

        {/* Metrics */}
        <div className="grid grid-cols-3 gap-4 mb-14">
          {metrics.map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center p-6 rounded-2xl"
              style={{
                background: isDark ? 'rgba(255,255,255,0.025)' : 'rgba(255,255,255,0.9)',
                border: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.06)',
              }}
            >
              <div className="text-3xl md:text-4xl font-bold mb-1" style={{ color: m.color }}>{m.value}</div>
              <div className="text-sm" style={{ color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.45)' }}>{m.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Testimonials grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.06 }}
              className="p-6 rounded-2xl"
              style={{
                background: isDark ? 'rgba(255,255,255,0.025)' : 'rgba(255,255,255,0.9)',
                border: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.06)',
                boxShadow: isDark ? 'none' : '0 2px 20px rgba(0,0,0,0.04)',
              }}
            >
              <div className="flex gap-0.5 mb-4">
                {[1,2,3,4,5].map(s => <Star key={s} className="w-4 h-4 fill-yellow-400 text-yellow-400" />)}
              </div>
              <p className="text-sm leading-relaxed mb-5" style={{ color: isDark ? 'rgba(255,255,255,0.65)' : 'rgba(0,0,0,0.6)' }}>
                "{t.quote}"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0" style={{ background: t.color }}>
                  {t.avatar}
                </div>
                <div>
                  <div className="text-sm font-semibold" style={{ color: isDark ? 'rgba(255,255,255,0.85)' : 'rgba(0,0,0,0.8)' }}>{t.name}</div>
                  <div className="text-xs" style={{ color: isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.4)' }}>{t.role}</div>
                </div>
                <div className="ml-auto text-xs font-medium px-2.5 py-1 rounded-full" style={{ background: `${t.color}15`, color: t.color }}>
                  {t.metric}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}