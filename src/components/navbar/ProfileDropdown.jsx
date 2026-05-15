import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { Settings, LayoutDashboard, LogOut, ChevronDown } from 'lucide-react';

const planBadge = {
  free_trial: { label: 'Trial', color: '#a855f7' },
  starter: { label: 'Starter', color: '#4F8EF7' },
  professional: { label: 'Pro', color: '#22c55e' },
  enterprise: { label: 'Enterprise', color: '#f59e0b' },
};

function Avatar({ user, size = 32 }) {
  const initials = (user?.full_name || user?.email || 'U')
    .split(' ')
    .map(p => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  if (user?.avatar_url) {
    return (
      <img
        src={user.avatar_url}
        alt={user.full_name}
        className="rounded-full object-cover"
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <div
      className="rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.35,
        background: 'linear-gradient(135deg, #4F8EF7 0%, #7B5EEA 100%)',
      }}
    >
      {initials}
    </div>
  );
}

export { Avatar };

export default function ProfileDropdown({ user, isDark }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const navigate = useNavigate();
  const { logout } = useAuth();

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const plan = planBadge[user?.role] || planBadge.free_trial;

  const items = [
    { icon: LayoutDashboard, label: 'Dashboard', action: () => navigate('/dashboard') },
    { icon: Settings, label: 'Configurações da conta', action: () => navigate('/account') },
  ];

  return (
    <div ref={ref} className="relative">
      <motion.button
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.97 }}
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 pl-1 pr-2.5 py-1 rounded-xl transition-all"
        style={{
          background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
          border: isDark ? '1px solid rgba(255,255,255,0.09)' : '1px solid rgba(0,0,0,0.07)',
          boxShadow: open ? '0 0 16px rgba(79,142,247,0.2)' : 'none',
        }}
      >
        <Avatar user={user} size={28} />
        <ChevronDown
          className="w-3.5 h-3.5 transition-transform"
          style={{
            color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.35)',
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
          }}
        />
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="absolute right-0 top-full mt-3 w-64 rounded-2xl overflow-hidden z-50"
            style={{
              background: isDark ? 'rgba(12,13,18,0.97)' : 'rgba(255,255,255,0.98)',
              border: isDark ? '1px solid rgba(255,255,255,0.09)' : '1px solid rgba(0,0,0,0.08)',
              boxShadow: isDark
                ? '0 24px 48px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.04)'
                : '0 24px 48px rgba(0,0,0,0.14), 0 0 0 1px rgba(255,255,255,0.8)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
            }}
          >
            {/* Profile header */}
            <div
              className="px-4 py-4 flex items-center gap-3"
              style={{ borderBottom: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.06)' }}
            >
              <Avatar user={user} size={40} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold truncate" style={{ color: isDark ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.85)' }}>
                    {user?.full_name || 'Usuário'}
                  </span>
                  <span
                    className="text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0"
                    style={{
                      background: `${plan.color}18`,
                      color: plan.color,
                      border: `1px solid ${plan.color}30`,
                    }}
                  >
                    {plan.label}
                  </span>
                </div>
                <p className="text-xs truncate mt-0.5" style={{ color: isDark ? 'rgba(255,255,255,0.38)' : 'rgba(0,0,0,0.4)' }}>
                  {user?.email}
                </p>
              </div>
            </div>

            {/* Menu items */}
            <div className="p-2">
              {items.map((item, i) => (
                <button
                  key={i}
                  onClick={() => { item.action(); setOpen(false); }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left"
                  style={{ color: isDark ? 'rgba(255,255,255,0.72)' : 'rgba(0,0,0,0.65)' }}
                  onMouseEnter={e => e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <item.icon className="w-4 h-4 flex-shrink-0" style={{ color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.38)' }} />
                  {item.label}
                </button>
              ))}

              <div className="mt-1 pt-1" style={{ borderTop: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.06)' }}>
                <button
                  onClick={() => { logout(); setOpen(false); }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left"
                  style={{ color: '#ef4444' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.08)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <LogOut className="w-4 h-4 flex-shrink-0" />
                  Sair da conta
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}