import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { goToLogin } from '@/lib/authRedirect';
import { useAuth } from '@/lib/AuthContext';
import { useTheme } from '@/lib/ThemeContext';
import ThemeToggle from '@/components/ThemeToggle';
import FadelyLogo from '@/components/FadelyLogo';
import ProfileDropdown from '@/components/navbar/ProfileDropdown';
import { Menu, X, LayoutDashboard } from 'lucide-react';

const navLinks = [
  { label: 'Funcionalidades', href: '#features' },
  { label: 'Depoimentos', href: '#testimonials' },
  { label: 'Planos', href: '#pricing' },
  { label: 'FAQ', href: '#faq' },
];

export default function Navbar() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { isAuthenticated, user, isLoadingAuth } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  const glassNav = {
    background: isDark ? 'rgba(10,11,15,0.88)' : 'rgba(255,255,255,0.85)',
    backdropFilter: 'blur(24px)',
    WebkitBackdropFilter: 'blur(24px)',
    border: isDark ? '1px solid rgba(255,255,255,0.07)' : '1px solid rgba(0,0,0,0.07)',
    boxShadow: isDark
      ? '0 8px 32px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)'
      : '0 8px 32px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.8)',
  };

  return (
    <motion.nav
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="fixed top-3 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-1.5rem)] max-w-5xl flex flex-col gap-2"
    >
      <div className="flex items-center justify-between px-4 sm:px-5 py-2.5 rounded-2xl" style={glassNav}>
        {/* Logo */}
        <div className="flex-shrink-0">
          <Link to="/"><FadelyLogo size="sm" /></Link>
        </div>

        {/* Center links — desktop only */}
        <div className="hidden lg:flex items-center gap-5 xl:gap-7">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium transition-opacity hover:opacity-80 whitespace-nowrap"
              style={{ color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.48)' }}
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0 min-w-0">
          <ThemeToggle size="sm" />

          {/* Auth loading skeleton */}
          {isLoadingAuth && (
            <div className="w-16 h-8 rounded-xl animate-pulse flex-shrink-0" style={{ background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)' }} />
          )}

          {/* NOT logged in */}
          {!isLoadingAuth && !isAuthenticated && (
            <>
              <button
                onClick={() => goToLogin('/dashboard')}
                className="hidden sm:block text-sm font-medium px-3 py-1.5 rounded-xl transition-all whitespace-nowrap flex-shrink-0"
                style={{
                  color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)',
                  background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                  border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.07)',
                }}
              >
                Entrar
              </button>
              <button
                onClick={() => goToLogin('/onboarding')}
                className="text-xs sm:text-sm font-semibold px-3 sm:px-3.5 py-1.5 rounded-xl text-white transition-all whitespace-nowrap flex-shrink-0"
                style={{
                  background: 'linear-gradient(135deg, #4F8EF7 0%, #7B5EEA 100%)',
                  boxShadow: '0 0 18px rgba(79,142,247,0.28)',
                }}
              >
                Começar
              </button>
            </>
          )}

          {/* Logged in */}
          {!isLoadingAuth && isAuthenticated && user && (
            <>
              <button
                onClick={() => navigate('/dashboard')}
                className="hidden sm:flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-xl transition-all whitespace-nowrap flex-shrink-0"
                style={{
                  color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)',
                  background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                  border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.07)',
                }}
              >
                <LayoutDashboard className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="hidden lg:inline">Dashboard</span>
              </button>
              <div className="flex-shrink-0">
                <ProfileDropdown user={user} isDark={isDark} />
              </div>
            </>
          )}

          {/* Mobile hamburger */}
          <button
            className="md:hidden flex items-center justify-center w-8 h-8 rounded-lg transition-all flex-shrink-0"
            style={{
              background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
              color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.55)',
            }}
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scaleY: 0.95 }}
            animate={{ opacity: 1, y: 0, scaleY: 1 }}
            exit={{ opacity: 0, y: -8, scaleY: 0.95 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="rounded-2xl overflow-hidden"
            style={{
              background: isDark ? 'rgba(10,11,15,0.97)' : 'rgba(255,255,255,0.97)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.07)',
              boxShadow: isDark ? '0 20px 40px rgba(0,0,0,0.6)' : '0 20px 40px rgba(0,0,0,0.1)',
              transformOrigin: 'top',
            }}
          >
            <div className="p-3 space-y-0.5">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center px-4 py-2.5 rounded-xl text-sm font-medium transition-all"
                  style={{ color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.65)' }}
                >
                  {link.label}
                </a>
              ))}

              <div className="pt-2 mt-1 border-t flex flex-col gap-2" style={{ borderColor: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)' }}>
                {!isAuthenticated ? (
                  <>
                    <button
                      onClick={() => { goToLogin('/dashboard'); setMobileOpen(false); }}
                      className="w-full text-sm font-medium px-4 py-2.5 rounded-xl"
                      style={{
                        color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)',
                        background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                        border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.07)',
                      }}
                    >
                      Entrar
                    </button>
                    <button
                      onClick={() => { goToLogin('/onboarding'); setMobileOpen(false); }}
                      className="w-full text-sm font-semibold px-4 py-2.5 rounded-xl text-white"
                      style={{ background: 'linear-gradient(135deg, #4F8EF7 0%, #7B5EEA 100%)' }}
                    >
                      Começar Grátis
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => { navigate('/dashboard'); setMobileOpen(false); }}
                    className="w-full text-sm font-semibold px-4 py-2.5 rounded-xl text-white flex items-center justify-center gap-2"
                    style={{ background: 'linear-gradient(135deg, #4F8EF7 0%, #7B5EEA 100%)' }}
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    Dashboard
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}