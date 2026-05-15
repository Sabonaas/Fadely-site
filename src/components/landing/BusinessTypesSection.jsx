import { motion } from 'framer-motion';
import { Scissors, Sparkles, Hand, Leaf, Building2, Crown, ArrowRight } from 'lucide-react';
import { goToLogin } from '@/lib/authRedirect';
import { useTheme } from '@/lib/ThemeContext';

const types = [
  {
    icon: Scissors,
    title: 'Salões de Beleza',
    description: 'Gerencie cabelo, manicure, pedicure e estética em um só lugar. Agenda online, fila de espera e comissões automáticas.',
    color: '#4F8EF7',
    tag: 'Mais popular',
  },
  {
    icon: Crown,
    title: 'Barbearias',
    description: 'Agendamento online para corte masculino, barba e tratamentos. Fidelização e controle de caixa simplificados.',
    color: '#a855f7',
    tag: null,
  },
  {
    icon: Sparkles,
    title: 'Clínicas Estéticas',
    description: 'Prontuário de cliente, histórico de procedimentos, lembretes de retorno e consentimentos digitais.',
    color: '#ec4899',
    tag: null,
  },
  {
    icon: Hand,
    title: 'Estúdios de Unhas',
    description: 'Controle de materiais, galeria de nail art, agendamentos recorrentes e cartão fidelidade digital.',
    color: '#f59e0b',
    tag: null,
  },
  {
    icon: Leaf,
    title: 'Centros de Bem-estar',
    description: 'Spa, massagem, terapias holísticas. Gerencie salas, terapeutas e pacotes de sessões com facilidade.',
    color: '#22c55e',
    tag: null,
  },
  {
    icon: Building2,
    title: 'Redes e Franquias',
    description: 'Dashboard consolidado para múltiplas unidades, comparativo de desempenho e padronização de processos.',
    color: '#06b6d4',
    tag: 'Enterprise',
  },
];

export default function BusinessTypesSection() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <section className={`py-28 transition-colors duration-500 ${isDark ? 'bg-[#0A0B0F]' : 'bg-[#F8F9FC]'}`}>
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-5" style={{
            background: isDark ? 'rgba(79,142,247,0.1)' : 'rgba(79,142,247,0.08)',
            color: '#4F8EF7',
            border: '1px solid rgba(79,142,247,0.2)',
          }}>
            Para todos os negócios de beleza
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: isDark ? 'rgba(255,255,255,0.95)' : 'rgba(8,10,20,0.9)' }}>
            Feito para o seu segmento
          </h2>
          <p className="text-lg max-w-xl mx-auto" style={{ color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.45)' }}>
            O Fadely foi projetado com as necessidades específicas de cada tipo de negócio de beleza em mente.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {types.map((type, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.07 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="group relative p-7 rounded-2xl cursor-pointer"
              style={{
                background: isDark ? 'rgba(255,255,255,0.025)' : 'rgba(255,255,255,0.9)',
                border: isDark ? '1px solid rgba(255,255,255,0.07)' : '1px solid rgba(0,0,0,0.07)',
                boxShadow: isDark ? 'none' : '0 2px 20px rgba(0,0,0,0.04)',
              }}
              onClick={() => goToLogin('/onboarding')}
            >
              {type.tag && (
                <div className="absolute top-5 right-5 text-xs px-2.5 py-1 rounded-full font-medium" style={{
                  background: `${type.color}15`,
                  color: type.color,
                  border: `1px solid ${type.color}30`,
                }}>
                  {type.tag}
                </div>
              )}
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5 transition-transform group-hover:scale-110 duration-300"
                style={{ background: `${type.color}15` }}
              >
                <type.icon className="w-6 h-6" style={{ color: type.color }} />
              </div>
              <h3 className="text-lg font-semibold mb-2" style={{ color: isDark ? 'rgba(255,255,255,0.9)' : 'rgba(8,10,20,0.85)' }}>
                {type.title}
              </h3>
              <p className="text-sm leading-relaxed mb-5" style={{ color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.5)' }}>
                {type.description}
              </p>
              <div className="flex items-center gap-1.5 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: type.color }}>
                Saiba mais <ArrowRight className="w-4 h-4" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}