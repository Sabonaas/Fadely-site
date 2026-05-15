import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { goToLogin } from '@/lib/authRedirect';
import { useTheme } from '@/lib/ThemeContext';
import FadelyLogo from '@/components/FadelyLogo';

export default function FooterSection() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <>
      {/* CTA Section */}
      <section className={`py-32 relative overflow-hidden transition-colors duration-500 ${isDark ? 'bg-[#0A0B0F]' : 'bg-white'}`}>
        <div className="absolute inset-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-blue-600/10 rounded-full blur-3xl" />
        </div>
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-6xl font-bold mb-6"
            style={{ color: isDark ? 'rgba(255,255,255,0.95)' : 'rgba(10,12,20,0.9)' }}
          >
            Ready to transform your business?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-lg mb-8 max-w-xl mx-auto"
            style={{ color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.45)' }}
          >
            Join thousands of beauty professionals who chose Fadely to grow their business.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <Button
              size="lg"
              onClick={() => goToLogin('/onboarding')}
              className="h-12 px-8 rounded-full font-medium gap-2 text-white"
              style={{ background: 'linear-gradient(135deg, #4F8EF7 0%, #7B5EEA 100%)', boxShadow: '0 0 30px rgba(79,142,247,0.3)' }}
            >
              Get Started Free <ArrowRight className="w-4 h-4" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className={`py-12 transition-colors duration-500 ${isDark ? 'bg-[#060709] border-t border-white/5' : 'bg-[#F8F9FC] border-t border-black/5'}`}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <FadelyLogo size="sm" />
            <p className="text-sm" style={{ color: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.35)' }}>
              © 2026 Fadely. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}