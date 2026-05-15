import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/AuthContext';
import FadelyLogo from '@/components/FadelyLogo';
import ThemeToggle from '@/components/ThemeToggle';
import {
  LayoutDashboard, Calendar, Users, Scissors, UserCheck,
  DollarSign, BarChart3, Settings, LogOut, Globe,
  Bell, Cake, ChevronRight
} from 'lucide-react';

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
];

const bottomItems = [
  { path: '/dashboard/settings', label: 'Configurações', icon: Settings },
];

export default function Sidebar({ business }) {
  const { logout } = useAuth();
  const location = useLocation();

  const isActive = (item) => {
    if (item.exact) return location.pathname === item.path;
    return location.pathname.startsWith(item.path);
  };

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-60 flex flex-col z-40"
      style={{
        background: 'rgba(8,9,14,0.97)',
        borderRight: '1px solid rgba(255,255,255,0.05)',
        backdropFilter: 'blur(24px)',
      }}
    >
      {/* Logo */}
      <div className="px-5 py-5 border-b border-white/[0.05]">
        <Link to="/dashboard" className="block">
          <FadelyLogo size="sm" />
        </Link>
        {business && (
          <div className="mt-3 flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #4F8EF7, #7B5EEA)' }}>
              {business.name?.[0]?.toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-white/80 text-xs font-medium truncate">{business.name}</p>
              <p className="text-white/25 text-[10px]">Estabelecimento</p>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
        {navItems.map(item => {
          const active = isActive(item);
          return (
            <Link key={item.path} to={item.path}>
              <div className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                active
                  ? 'text-white'
                  : 'text-white/35 hover:text-white/70'
              }`}>
                {active && (
                  <motion.div
                    layoutId="sidebar-active-bg"
                    className="absolute inset-0 rounded-xl"
                    style={{ background: 'rgba(79,142,247,0.1)', border: '1px solid rgba(79,142,247,0.2)' }}
                    transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                  />
                )}
                {!active && (
                  <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ background: 'rgba(255,255,255,0.03)' }} />
                )}
                <item.icon className={`w-4 h-4 relative z-10 flex-shrink-0 ${active ? 'text-blue-400' : ''}`} />
                <span className="relative z-10 truncate">{item.label}</span>
                {active && <ChevronRight className="w-3 h-3 relative z-10 ml-auto text-blue-400/50 flex-shrink-0" />}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="px-3 py-3 border-t border-white/[0.05] space-y-0.5">
        {business?.slug && (
          <Link to={`/book/${business.slug}`} target="_blank">
            <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white/35 hover:text-white/60 hover:bg-white/[0.03] transition-all">
              <Globe className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">Página Pública</span>
            </div>
          </Link>
        )}
        {bottomItems.map(item => {
          const active = location.pathname === item.path;
          return (
            <Link key={item.path} to={item.path}>
              <div className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
                active ? 'text-white bg-white/[0.06]' : 'text-white/35 hover:text-white/60 hover:bg-white/[0.03]'
              }`}>
                <item.icon className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{item.label}</span>
              </div>
            </Link>
          );
        })}
        <div className="mb-1">
          <ThemeToggle />
        </div>
        <button
          onClick={() => logout('/')}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white/25 hover:text-red-400 hover:bg-red-500/5 transition-all"
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          <span>Sair</span>
        </button>
      </div>
    </aside>
  );
}