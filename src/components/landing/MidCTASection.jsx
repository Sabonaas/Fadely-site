import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle } from 'lucide-react';
import { goToLogin } from '@/lib/authRedirect';
import { useTheme } from '@/lib/ThemeContext';

const perks = [
  '14 dias grátis, sem cartão',
  'Onboarding em 10 minutos',
  'Suporte em português',
  'Cancele quando quiser',
];

export default function MidCTASection() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <section className={`py-20 transition-colors duration-500 ${isDark ? 'bg-[#0A0B0F]' : 'bg-white'}`}>
      <div className="max-w-4xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative rounded-3xl p-10 md:p-14 text-center overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(79,142,247,0.12) 0%, rgba(123,94,234,0.10) 100%)',
            border: '1px solid rgba(79,142,247,0.2)',
          }}
        >
          {/* Glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-blue-500/20 blur-3xl rounded-full pointer-events-none" />

          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: isDark ? 'rgba(255,255,255,0.95)' : 'rgba(8,10,20,0.9)' }}>
              Comece agora e transforme<br />seu negócio de beleza
            </h2>
            <p className="text-base mb-8 max-w-lg mx-auto" style={{ color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>
              Junte-se a mais de 12.000 profissionais que escolheram o Fadely para crescer com elegância.
            </p>
            <button
              onClick={() => goToLogin('/onboarding')}
              className="inline-flex items-center gap-2 px-8 rounded-full font-semibold text-white text-base"
              style={{
                background: 'linear-gradient(135deg, #4F8EF7 0%, #7B5EEA 100%)',
                boxShadow: '0 0 40px rgba(79,142,247,0.4)',
                height: '52px',
              }}
            >
              Começar Teste Grátis
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 mt-7">
              {perks.map((p, i) => (
                <div key={i} className="flex items-center gap-1.5 text-sm" style={{ color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>
                  <CheckCircle className="w-4 h-4 text-blue-400 flex-shrink-0" />
                  {p}
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}