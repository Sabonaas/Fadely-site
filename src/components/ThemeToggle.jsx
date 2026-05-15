import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/lib/ThemeContext';

export default function ThemeToggle({ compact = false }) {
  const { theme, toggle } = useTheme();
  const isDark = theme === 'dark';

  if (compact) {
    return (
      <button
        onClick={toggle}
        title={isDark ? 'Mudar para claro' : 'Mudar para escuro'}
        className="w-8 h-8 rounded-xl flex items-center justify-center transition-all hover:opacity-80"
        style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={isDark ? 'moon' : 'sun'}
            initial={{ opacity: 0, rotate: -30, scale: 0.7 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            exit={{ opacity: 0, rotate: 30, scale: 0.7 }}
            transition={{ duration: 0.2 }}
          >
            {isDark ? (
              <Moon className="w-4 h-4 text-white/50" />
            ) : (
              <Sun className="w-4 h-4 text-yellow-400" />
            )}
          </motion.div>
        </AnimatePresence>
      </button>
    );
  }

  return (
    <button
      onClick={toggle}
      className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl transition-all text-left"
      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
    >
      <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ background: isDark ? 'rgba(79,142,247,0.12)' : 'rgba(251,191,36,0.15)' }}>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={isDark ? 'moon' : 'sun'}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.15 }}
          >
            {isDark ? (
              <Moon className="w-3.5 h-3.5 text-blue-400" />
            ) : (
              <Sun className="w-3.5 h-3.5 text-yellow-400" />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-white/55 text-xs font-medium">{isDark ? 'Modo Escuro' : 'Modo Claro'}</p>
        <p className="text-white/25 text-[10px]">Clique para alternar</p>
      </div>
      {/* Toggle track */}
      <div className="relative w-9 h-5 rounded-full flex-shrink-0 transition-all"
        style={{ background: isDark ? 'rgba(79,142,247,0.35)' : 'rgba(251,191,36,0.35)' }}>
        <motion.div
          animate={{ x: isDark ? 16 : 2 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          className="absolute top-0.5 w-4 h-4 rounded-full"
          style={{ background: isDark ? '#4F8EF7' : '#fbbf24' }}
        />
      </div>
    </button>
  );
}