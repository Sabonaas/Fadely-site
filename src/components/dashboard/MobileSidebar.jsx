import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { Menu, X, LayoutDashboard, Calendar, Users, Scissors, UserCheck, DollarSign, BarChart3, Settings, LogOut, Bell, Cake, Globe, ChevronRight } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import FadelyLogo from '@/components/FadelyLogo';
import ThemeToggle from '@/components/ThemeToggle';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { path: '/dashboard/calendar', label: 'Calendário', icon: Calendar },
  { path: '/dashboard/clients', label: 'Clientes', icon: Users },
  { path: '/dashboard/birthdays', label: 'Aniversariantes', icon: Cake },
  { path: '/dashboard/services', label: 'Serviços', icon: Scissors },
  { path: '/dashboard/employees', label: 'Equipe', icon: UserCheck },
  { path: '/dashboard/financial', label: 'Financeiro', icon: DollarSign },
  { path: '/dashboard/reports', label: 'Relatórios', icon: BarChart3 },
  { path: '/dashboard/notifications', label: 'Notificações', icon: Bell },
  { path: '/dashboard/settings', label: 'Configurações', icon: Settings },
];

export default function MobileSidebar({ business }) {
  const [open, setOpen] = useState(false);
  const { logout } = useAuth();
  const location = useLocation();

  const isActive = (item) => {
    if (item.exact) return location.pathname === item.path;
    return location.pathname.startsWith(item.path);
  };

  // Get current page label
  const currentPage = navItems.find(item => isActive(item))?.label || 'Dashboard';

  return (
    <div className="lg:hidden">
      {/* Top bar */}
      <div
        className="fixed top-0 left-0 right-0 h-14 flex items-center justify-between px-4 z-50"
        style={{
          background: 'rgba(8,9,14,0.95)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
        }}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={() => setOpen(true)}
            className="w-8 h-8 rounded-xl flex items-center justify-center transition-all"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <Menu className="w-4 h-4 text-white/60" />
          </button>
          <span className="text-white/70 text-sm font-medium">{currentPage}</span>
        </div>

        <FadelyLogo size="sm" showWordmark={false} />

        <div className="w-8 flex justify-end">
          <ThemeToggle compact />
        </div>
      </div>

      <div className="h-14" />

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40"
              style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 350, damping: 35 }}
              className="fixed left-0 top-0 bottom-0 w-72 z-50 flex flex-col"
              style={{
                background: 'rgba(8,9,14,0.99)',
                borderRight: '1px solid rgba(255,255,255,0.06)',
                backdropFilter: 'blur(24px)',
              }}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-5 border-b border-white/[0.05]">
                <FadelyLogo size="sm" />
                <button
                  onClick={() => setOpen(false)}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-white/30 hover:text-white hover:bg-white/5 transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Business info */}
              {business && (
                <div className="px-5 py-3 border-b border-white/[0.05]">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                      style={{ background: 'linear-gradient(135deg, #4F8EF7, #7B5EEA)' }}>
                      {business.name?.[0]?.toUpperCase()}
                    </div>
                    <div>
                      <p className="text-white/80 text-sm font-medium">{business.name}</p>
                      <p className="text-white/25 text-xs">Estabelecimento</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Nav */}
              <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
                {navItems.map(item => {
                  const active = isActive(item);
                  return (
                    <Link key={item.path} to={item.path} onClick={() => setOpen(false)}>
                      <div className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all ${
                        active ? 'text-white' : 'text-white/40'
                      }`}
                        style={active ? {
                          background: 'rgba(79,142,247,0.1)',
                          border: '1px solid rgba(79,142,247,0.2)',
                        } : {}}
                      >
                        <item.icon className={`w-4.5 h-4.5 flex-shrink-0 ${active ? 'text-blue-400' : ''}`} />
                        <span className="flex-1">{item.label}</span>
                        {active && <ChevronRight className="w-3.5 h-3.5 text-blue-400/50" />}
                      </div>
                    </Link>
                  );
                })}
              </nav>

              {/* Bottom */}
              <div className="px-3 py-4 border-t border-white/[0.05] space-y-1">
                <ThemeToggle />
                {business?.slug && (
                  <Link to={`/book/${business.slug}`} target="_blank" onClick={() => setOpen(false)}>
                    <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white/35 hover:text-white/60 transition-all">
                      <Globe className="w-4 h-4" />
                      <span>Página Pública</span>
                    </div>
                  </Link>
                )}
                <button
                  onClick={() => { logout('/'); }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white/25 hover:text-red-400 hover:bg-red-500/5 transition-all"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sair</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}