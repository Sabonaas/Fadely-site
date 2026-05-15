import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, Sparkles, Calendar, Users, BarChart3, TrendingUp, Star, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { goToLogin } from '@/lib/authRedirect';
import { useTheme } from '@/lib/ThemeContext';
import { useRef } from 'react';

const stats = [
  { value: '12.000+', label: 'Negócios ativos' },
  { value: '4M+', label: 'Agendamentos/mês' },
  { value: '98%', label: 'Satisfação dos clientes' },
];

const floatingBadges = [
  { icon: Calendar, label: 'Agendamento confirmado!', sub: 'João Silva • 14h30', color: '#4F8EF7', delay: 0 },
  { icon: TrendingUp, label: '+38% de receita', sub: 'Comparado ao mês anterior', color: '#22c55e', delay: 0.3 },
  { icon: Users, label: '3 novos clientes hoje', sub: 'Via agendamento online', color: '#a855f7', delay: 0.6 },
];

export default function HeroSection() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '20%']);
  const opacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  return (
    <section ref={ref} className={`relative min-h-screen flex flex-col items-center justify-center overflow-hidden pt-24 pb-16 transition-colors duration-500 ${isDark ? 'bg-[#0A0B0F]' : 'bg-white'}`}>
      {/* Animated background */}
      <motion.div style={{ y, opacity }} className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[20%] w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px]" />
        <div className="absolute top-[20%] right-[10%] w-[400px] h-[400px] bg-purple-600/8 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 left-[10%] w-[500px] h-[300px] bg-blue-500/6 rounded-full blur-[80px]" />
      </motion.div>

      {/* Subtle grid */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(${isDark ? 'rgba(255,255,255,0.025)' : 'rgba(0,0,0,0.03)'} 1px, transparent 1px), linear-gradient(90deg, ${isDark ? 'rgba(255,255,255,0.025)' : 'rgba(0,0,0,0.03)'} 1px, transparent 1px)`,
          backgroundSize: '72px 72px',
          maskImage: 'radial-gradient(ellipse 80% 60% at 50% 50%, black 40%, transparent 100%)',
        }}
      />

      <div className="relative z-10 max-w-6xl mx-auto px-6 text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8"
          style={{
            border: isDark ? '1px solid rgba(79,142,247,0.25)' : '1px solid rgba(79,142,247,0.3)',
            background: isDark ? 'rgba(79,142,247,0.08)' : 'rgba(79,142,247,0.06)',
          }}
        >
          <Sparkles className="w-3.5 h-3.5 text-blue-400" />
          <span className="text-xs font-medium text-blue-400">Plataforma #1 para negócios de beleza no Brasil</span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="text-5xl sm:text-6xl md:text-7xl lg:text-[82px] font-bold tracking-tight leading-[1.0] mb-6"
        >
          <span style={{ color: isDark ? 'rgba(255,255,255,0.95)' : 'rgba(8,10,20,0.9)' }}>Gerencie seu negócio</span>
          <br />
          <span style={{ color: isDark ? 'rgba(255,255,255,0.95)' : 'rgba(8,10,20,0.9)' }}>de beleza com </span>
          <span style={{
            background: 'linear-gradient(135deg, #4F8EF7 0%, #9B6DFF 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>elegância.</span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="text-lg md:text-xl max-w-2xl mx-auto mb-10 font-light leading-relaxed"
          style={{ color: isDark ? 'rgba(255,255,255,0.48)' : 'rgba(0,0,0,0.48)' }}
        >
          A plataforma tudo-em-um para agendamentos, automação e crescimento do seu negócio de beleza.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12"
        >
          <Button
            size="lg"
            onClick={() => goToLogin('/onboarding')}
            className="h-13 px-8 rounded-full font-semibold text-base gap-2 text-white shadow-2xl"
            style={{
              background: 'linear-gradient(135deg, #4F8EF7 0%, #7B5EEA 100%)',
              boxShadow: '0 0 40px rgba(79,142,247,0.35), 0 4px 20px rgba(0,0,0,0.2)',
              height: '52px',
            }}
          >
            Começar Teste Grátis
            <ArrowRight className="w-4 h-4" />
          </Button>
          <Button
            size="lg"
            onClick={() => goToLogin('/dashboard')}
            className="h-13 px-8 rounded-full font-medium text-base"
            style={{
              height: '52px',
              background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
              color: isDark ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.65)',
              border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)',
            }}
          >
            Ver Demonstração
          </Button>
        </motion.div>

        {/* Trust indicators */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.8 }}
          className="flex items-center justify-center gap-3 mb-16"
        >
          <div className="flex -space-x-2">
            {['#4F8EF7','#a855f7','#22c55e','#f59e0b','#ef4444'].map((c, i) => (
              <div key={i} className="w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-bold text-white" style={{ borderColor: isDark ? '#0A0B0F' : '#fff', background: c }}>
                {['A','B','C','D','E'][i]}
              </div>
            ))}
          </div>
          <div className="flex items-center gap-1.5">
            {[1,2,3,4,5].map(i => <Star key={i} className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />)}
          </div>
          <span className="text-sm" style={{ color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.45)' }}>
            Amado por +12.000 profissionais
          </span>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.9 }}
          className="grid grid-cols-3 gap-6 max-w-xl mx-auto mb-20"
        >
          {stats.map((s, i) => (
            <div key={i} className="text-center">
              <div className="text-2xl md:text-3xl font-bold" style={{
                background: 'linear-gradient(135deg, #4F8EF7 0%, #9B6DFF 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>{s.value}</div>
              <div className="text-xs mt-1" style={{ color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.45)' }}>{s.label}</div>
            </div>
          ))}
        </motion.div>

        {/* Dashboard mockup with floating cards */}
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 1.1, delay: 1, ease: [0.22, 1, 0.36, 1] }}
          className="relative max-w-4xl mx-auto"
        >
          {/* Main mockup */}
          <div
            className="rounded-2xl overflow-hidden"
            style={{
              background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.9)',
              border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.08)',
              boxShadow: isDark
                ? '0 40px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04)'
                : '0 40px 80px rgba(0,0,0,0.12), 0 0 0 1px rgba(255,255,255,0.8)',
            }}
          >
            {/* Browser chrome */}
            <div className="flex items-center gap-2 px-4 py-3" style={{ borderBottom: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.06)', background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)' }}>
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-400/60" />
                <div className="w-3 h-3 rounded-full bg-yellow-400/60" />
                <div className="w-3 h-3 rounded-full bg-green-400/60" />
              </div>
              <div className="flex-1 flex justify-center">
                <div className="h-5 rounded-md px-3 flex items-center text-xs" style={{ background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)', color: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.35)' }}>
                  app.fadely.com.br/dashboard
                </div>
              </div>
            </div>
            {/* Dashboard interior */}
            <div className="p-6 grid grid-cols-4 gap-4 min-h-[280px]">
              {/* Sidebar mini */}
              <div className="col-span-1">
                <div className="space-y-2">
                  {['Dashboard','Agenda','Clientes','Financeiro'].map((item, i) => (
                    <div key={i} className="h-8 rounded-lg flex items-center px-3 text-xs font-medium" style={{
                      background: i === 1 ? 'linear-gradient(135deg, rgba(79,142,247,0.2), rgba(123,94,234,0.2))' : 'transparent',
                      color: i === 1 ? '#4F8EF7' : isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.35)',
                    }}>
                      {item}
                    </div>
                  ))}
                </div>
              </div>
              {/* Main area */}
              <div className="col-span-3 grid grid-cols-3 gap-3">
                {[
                  { label: 'Agendamentos hoje', val: '24', color: '#4F8EF7' },
                  { label: 'Receita do mês', val: 'R$18.4k', color: '#22c55e' },
                  { label: 'Novos clientes', val: '8', color: '#a855f7' },
                ].map((c, i) => (
                  <div key={i} className="rounded-xl p-3" style={{ background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)', border: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.06)' }}>
                    <div className="text-xs mb-2" style={{ color: isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.4)' }}>{c.label}</div>
                    <div className="text-xl font-bold" style={{ color: c.color }}>{c.val}</div>
                  </div>
                ))}
                {/* Mini calendar */}
                <div className="col-span-3 rounded-xl p-3" style={{ background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)', border: isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.05)' }}>
                  <div className="flex gap-2 overflow-hidden">
                    {['08h','09h','10h','11h','12h','13h','14h','15h'].map((t, i) => (
                      <div key={i} className="flex-shrink-0 text-center">
                        <div className="text-xs mb-1.5" style={{ color: isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.3)' }}>{t}</div>
                        <div className="w-14 h-12 rounded-lg" style={{
                          background: [1,3,5].includes(i) ? 'linear-gradient(135deg, rgba(79,142,247,0.25), rgba(123,94,234,0.25))' : isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
                          border: [1,3,5].includes(i) ? '1px solid rgba(79,142,247,0.3)' : isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.05)',
                        }} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Floating notification cards */}
          {floatingBadges.map((badge, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30, y: 20 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              transition={{ duration: 0.8, delay: 1.4 + badge.delay }}
              className="absolute hidden md:flex"
              style={{
                left: i === 0 ? '-140px' : i === 2 ? '-120px' : 'auto',
                right: i === 1 ? '-130px' : 'auto',
                top: i === 0 ? '40px' : i === 1 ? '80px' : '180px',
              }}
            >
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 4, repeat: Infinity, delay: badge.delay, ease: 'easeInOut' }}
                className="rounded-2xl px-4 py-3 flex items-center gap-3 min-w-[200px]"
                style={{
                  background: isDark ? 'rgba(10,11,15,0.9)' : 'rgba(255,255,255,0.95)',
                  border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.08)',
                  boxShadow: isDark ? '0 20px 40px rgba(0,0,0,0.5)' : '0 20px 40px rgba(0,0,0,0.1)',
                  backdropFilter: 'blur(20px)',
                }}
              >
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${badge.color}20` }}>
                  <badge.icon className="w-4 h-4" style={{ color: badge.color }} />
                </div>
                <div>
                  <div className="text-xs font-semibold" style={{ color: isDark ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.8)' }}>{badge.label}</div>
                  <div className="text-xs" style={{ color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)' }}>{badge.sub}</div>
                </div>
              </motion.div>
            </motion.div>
          ))}

          {/* Glow below mockup */}
          <div className="absolute -bottom-20 left-1/2 -translate-x-1/2 w-2/3 h-20 bg-blue-500/20 blur-3xl rounded-full pointer-events-none" />
        </motion.div>
      </div>
    </section>
  );
}