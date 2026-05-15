import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import FadelyLogo from '@/components/FadelyLogo';
import ThemeToggle from '@/components/ThemeToggle';
import {
  LayoutDashboard, Calendar, Users, Scissors, UserCheck,
  DollarSign, BarChart3, Settings, LogOut, Globe,
  Bell, Cake, ChevronRight, Ticket
} from 'lucide-react';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { path: '/dashboard/calendar', label: 'Calendário', icon: Calendar },
  { path: '/dashboard/clients', label: 'Clientes', icon: Users },
  { path: '/dashboard/birthdays', label: 'Aniversariantes', icon: Cake },
  { path: '/dashboard/services', label: 'Serviços', icon: Scissors },
  { path: '/dashboard/employees', label: 'Equipe', icon: UserCheck },
  { path: '/dashboard/coupons', label: 'Cupons', icon: Ticket },
  { path: '/dashboard/financial', label: 'Financeiro', icon: DollarSign },
  { path: '/dashboard/reports', label: 'Relatórios', icon: BarChart3 },
  { path: '/dashboard/notifications', label: 'Notificações', icon: Bell },
];

const bottomItems = [
  { path: '/dashboard/settings', label: 'Configurações', icon: Settings },
];

function UserAvatar({ url, name, className = 'w-6 h-6' }) {
  const initials = (name || 'U').split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase();
  if (url) {
    return <img src={url} alt={name} className={`${className} rounded-lg object-cover flex-shrink-0`} />;
  }
  return (
    <div className={`${className} rounded-lg flex items-center justify-center text-[10px] font-bold text-primary-foreground flex-shrink-0 bg-gradient-to-br from-[#4F8EF7] to-[#7B5EEA]`}>
      {initials}
    </div>
  );
}

export default function Sidebar({ business }) {
  const { logout } = useAuth();
  const { avatarUrl, displayName } = useProfile();
  const location = useLocation();

  const isActive = (item) => {
    if (item.exact) return location.pathname === item.path;
    return location.pathname.startsWith(item.path);
  };

  return (
    <aside className="dashboard-sidebar">
      <motion.div
        className="px-5 py-5 border-b border-border"
        whileHover={{ opacity: 0.92 }}
        transition={{ duration: 0.2 }}
      >
        <Link
          to="/"
          className="block rounded-lg transition-transform hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          title="Ir para o site"
        >
          <FadelyLogo size="sm" />
        </Link>
        {business && (
          <motion.div className="mt-3 flex items-center gap-2 min-w-0" layout>
            <motion.div whileHover={{ scale: 1.05 }}>
              <UserAvatar url={business.logo_url} name={business.name} className="w-6 h-6" />
            </motion.div>
            <motion.div className="min-w-0 flex-1">
              <p className="text-foreground/80 text-xs font-medium truncate">{business.name}</p>
              <p className="text-muted-foreground text-[10px]">Estabelecimento</p>
            </motion.div>
          </motion.div>
        )}
      </motion.div>

      <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto overscroll-contain">
        {navItems.map((item) => {
          const active = isActive(item);
          return (
            <Link key={item.path} to={item.path} className="block min-w-0">
              <div
                className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group min-w-0 ${
                  active ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {active && (
                  <motion.div
                    layoutId="sidebar-active-bg"
                    className="absolute inset-0 rounded-xl bg-primary/10 border border-primary/20"
                    transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                  />
                )}
                {!active && (
                  <motion.div
                    className="absolute inset-0 rounded-xl bg-accent/50 opacity-0 group-hover:opacity-100 transition-opacity"
                  />
                )}
                <item.icon className={`w-4 h-4 relative z-10 flex-shrink-0 ${active ? 'text-primary' : ''}`} />
                <span className="relative z-10 truncate">{item.label}</span>
                {active && <ChevronRight className="w-3 h-3 relative z-10 ml-auto text-primary/50 flex-shrink-0" />}
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="px-3 py-3 border-t border-border space-y-0.5 flex-shrink-0">
        {business?.slug && (
          <Link to={`/book/${business.slug}`} target="_blank" rel="noopener noreferrer" className="block min-w-0">
            <motion.div
              whileHover={{ x: 2 }}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-all min-w-0"
            >
              <Globe className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">Página Pública</span>
            </motion.div>
          </Link>
        )}
        {bottomItems.map((item) => {
          const active = location.pathname === item.path;
          return (
            <Link key={item.path} to={item.path} className="block min-w-0">
              <div
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all min-w-0 ${
                  active ? 'text-foreground bg-accent' : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                }`}
              >
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
          type="button"
          onClick={() => logout('/')}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          <span>Sair</span>
        </button>
      </div>
    </aside>
  );
}
