import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Lock, Bell, CreditCard, ArrowLeft, Camera, Check, Eye, EyeOff, Sun, Moon } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { useTheme } from '@/lib/ThemeContext';
import * as db from '@/repositories/db';
import { Avatar } from '@/components/navbar/ProfileDropdown';

const tabs = [
  { id: 'profile', label: 'Perfil', icon: User },
  { id: 'security', label: 'Segurança', icon: Lock },
  { id: 'preferences', label: 'Preferências', icon: Bell },
  { id: 'subscription', label: 'Assinatura', icon: CreditCard },
];

const planInfo = {
  free_trial: { label: 'Trial gratuito', color: '#a855f7', price: 'R$0', desc: '14 dias de teste' },
  starter: { label: 'Starter', color: '#4F8EF7', price: 'R$39/mês', desc: '1 profissional' },
  professional: { label: 'Professional', color: '#22c55e', price: 'R$79/mês', desc: 'Até 10 profissionais' },
  enterprise: { label: 'Enterprise', color: '#f59e0b', price: 'R$149/mês', desc: 'Profissionais ilimitados' },
};

export default function AccountSettings() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [showPass, setShowPass] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    full_name: user?.full_name || '',
    email: user?.email || '',
    currentPass: '',
    newPass: '',
    confirmPass: '',
  });

  const handleSave = async () => {
    if (activeTab === 'profile') {
      await db.updateAuthUserFullName(form.full_name);
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const plan = planInfo[user?.role] || planInfo.free_trial;

  const cardStyle = {
    background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.95)',
    border: isDark ? '1px solid rgba(255,255,255,0.07)' : '1px solid rgba(0,0,0,0.07)',
    boxShadow: isDark ? 'none' : '0 2px 20px rgba(0,0,0,0.05)',
  };

  const inputStyle = {
    background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
    border: isDark ? '1px solid rgba(255,255,255,0.09)' : '1px solid rgba(0,0,0,0.09)',
    color: isDark ? 'rgba(255,255,255,0.85)' : 'rgba(0,0,0,0.8)',
  };

  return (
    <div className={`min-h-screen transition-colors duration-500 ${isDark ? 'bg-[#0A0B0F]' : 'bg-[#F8F9FC]'} p-4 py-10`}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-sm transition-opacity hover:opacity-70"
            style={{ color: isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.45)' }}
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: isDark ? 'rgba(255,255,255,0.95)' : 'rgba(8,10,20,0.9)' }}>
              Configurações da conta
            </h1>
            <p className="text-sm" style={{ color: isDark ? 'rgba(255,255,255,0.38)' : 'rgba(0,0,0,0.42)' }}>
              Gerencie seu perfil, segurança e assinatura
            </p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar tabs */}
          <div className="md:w-52 flex-shrink-0">
            <div className="rounded-2xl p-2 space-y-0.5" style={cardStyle}>
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left"
                  style={{
                    background: activeTab === tab.id
                      ? isDark ? 'rgba(79,142,247,0.12)' : 'rgba(79,142,247,0.08)'
                      : 'transparent',
                    color: activeTab === tab.id
                      ? '#4F8EF7'
                      : isDark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.55)',
                  }}
                >
                  <tab.icon className="w-4 h-4 flex-shrink-0" />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className="rounded-2xl p-6 md:p-7"
              style={cardStyle}
            >
              {/* PROFILE TAB */}
              {activeTab === 'profile' && (
                <div>
                  <h2 className="text-base font-semibold mb-6" style={{ color: isDark ? 'rgba(255,255,255,0.9)' : 'rgba(8,10,20,0.85)' }}>Informações pessoais</h2>

                  {/* Avatar section */}
                  <div className="flex items-center gap-5 mb-8">
                    <div className="relative">
                      <Avatar user={user} size={72} />
                      <button
                        className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center text-white transition-transform hover:scale-110"
                        style={{ background: 'linear-gradient(135deg, #4F8EF7, #7B5EEA)' }}
                      >
                        <Camera className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div>
                      <p className="text-sm font-medium mb-0.5" style={{ color: isDark ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.75)' }}>Foto do perfil</p>
                      <p className="text-xs mb-2" style={{ color: isDark ? 'rgba(255,255,255,0.38)' : 'rgba(0,0,0,0.42)' }}>JPG ou PNG, máx. 5MB</p>
                      <div className="flex gap-2">
                        <button className="text-xs px-3 py-1.5 rounded-lg font-medium transition-all" style={{ background: 'rgba(79,142,247,0.12)', color: '#4F8EF7', border: '1px solid rgba(79,142,247,0.2)' }}>
                          Alterar foto
                        </button>
                        <button className="text-xs px-3 py-1.5 rounded-lg font-medium transition-all" style={{ background: isDark ? 'rgba(239,68,68,0.1)' : 'rgba(239,68,68,0.07)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' }}>
                          Remover
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-medium mb-1.5 block" style={{ color: isDark ? 'rgba(255,255,255,0.52)' : 'rgba(0,0,0,0.5)' }}>Nome completo</label>
                      <input
                        value={form.full_name}
                        onChange={e => setForm({ ...form, full_name: e.target.value })}
                        className="w-full h-11 px-4 rounded-xl text-sm outline-none"
                        style={inputStyle}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium mb-1.5 block" style={{ color: isDark ? 'rgba(255,255,255,0.52)' : 'rgba(0,0,0,0.5)' }}>E-mail</label>
                      <input
                        value={form.email}
                        disabled
                        className="w-full h-11 px-4 rounded-xl text-sm outline-none opacity-60 cursor-not-allowed"
                        style={inputStyle}
                      />
                      <p className="text-xs mt-1.5" style={{ color: isDark ? 'rgba(255,255,255,0.32)' : 'rgba(0,0,0,0.38)' }}>
                        E-mail não pode ser alterado diretamente
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* SECURITY TAB */}
              {activeTab === 'security' && (
                <div>
                  <h2 className="text-base font-semibold mb-6" style={{ color: isDark ? 'rgba(255,255,255,0.9)' : 'rgba(8,10,20,0.85)' }}>Segurança da conta</h2>
                  <div className="space-y-4">
                    {[
                      { key: 'currentPass', label: 'Senha atual' },
                      { key: 'newPass', label: 'Nova senha' },
                      { key: 'confirmPass', label: 'Confirmar nova senha' },
                    ].map((f) => (
                      <div key={f.key}>
                        <label className="text-xs font-medium mb-1.5 block" style={{ color: isDark ? 'rgba(255,255,255,0.52)' : 'rgba(0,0,0,0.5)' }}>{f.label}</label>
                        <div className="relative">
                          <input
                            type={showPass ? 'text' : 'password'}
                            value={form[f.key]}
                            onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                            className="w-full h-11 px-4 pr-10 rounded-xl text-sm outline-none"
                            style={inputStyle}
                          />
                          <button className="absolute right-3 top-1/2 -translate-y-1/2" onClick={() => setShowPass(!showPass)}>
                            {showPass ? <EyeOff className="w-4 h-4" style={{ color: isDark ? 'rgba(255,255,255,0.38)' : 'rgba(0,0,0,0.38)' }} /> : <Eye className="w-4 h-4" style={{ color: isDark ? 'rgba(255,255,255,0.38)' : 'rgba(0,0,0,0.38)' }} />}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* PREFERENCES TAB */}
              {activeTab === 'preferences' && (
                <div>
                  <h2 className="text-base font-semibold mb-6" style={{ color: isDark ? 'rgba(255,255,255,0.9)' : 'rgba(8,10,20,0.85)' }}>Preferências</h2>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-xl" style={{
                      background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
                      border: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.06)',
                    }}>
                      <div className="flex items-center gap-3">
                        {isDark ? <Moon className="w-5 h-5 text-blue-400" /> : <Sun className="w-5 h-5 text-yellow-400" />}
                        <div>
                          <p className="text-sm font-medium" style={{ color: isDark ? 'rgba(255,255,255,0.85)' : 'rgba(0,0,0,0.8)' }}>
                            Tema {isDark ? 'Escuro' : 'Claro'}
                          </p>
                          <p className="text-xs" style={{ color: isDark ? 'rgba(255,255,255,0.38)' : 'rgba(0,0,0,0.42)' }}>Aparência da interface</p>
                        </div>
                      </div>
                      <button
                        onClick={toggleTheme}
                        className="relative w-12 h-6 rounded-full transition-all"
                        style={{ background: isDark ? 'rgba(79,142,247,0.6)' : 'rgba(0,0,0,0.18)' }}
                      >
                        <div className="absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all" style={{ left: isDark ? '28px' : '4px' }} />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* SUBSCRIPTION TAB */}
              {activeTab === 'subscription' && (
                <div>
                  <h2 className="text-base font-semibold mb-6" style={{ color: isDark ? 'rgba(255,255,255,0.9)' : 'rgba(8,10,20,0.85)' }}>Assinatura</h2>
                  <div className="p-5 rounded-2xl mb-5" style={{
                    background: `${plan.color}0D`,
                    border: `1px solid ${plan.color}25`,
                  }}>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ background: `${plan.color}20`, color: plan.color }}>
                        {plan.label}
                      </span>
                      <span className="text-lg font-bold" style={{ color: isDark ? '#fff' : 'rgba(8,10,20,0.9)' }}>{plan.price}</span>
                    </div>
                    <p className="text-sm" style={{ color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>{plan.desc}</p>
                  </div>

                  <div className="flex gap-3">
                    <Link
                      to="/checkout/professional"
                      className="flex-1 h-10 rounded-xl text-sm font-semibold flex items-center justify-center text-white transition-all"
                      style={{ background: 'linear-gradient(135deg, #4F8EF7, #7B5EEA)' }}
                    >
                      Fazer upgrade
                    </Link>
                    <button
                      onClick={logout}
                      className="h-10 px-4 rounded-xl text-sm font-medium transition-all"
                      style={{
                        background: isDark ? 'rgba(239,68,68,0.1)' : 'rgba(239,68,68,0.07)',
                        color: '#ef4444',
                        border: '1px solid rgba(239,68,68,0.2)',
                      }}
                    >
                      Cancelar plano
                    </button>
                  </div>
                </div>
              )}

              {/* Save button (not on subscription tab) */}
              {activeTab !== 'subscription' && (
                <div className="mt-8 flex items-center gap-3">
                  <button
                    onClick={handleSave}
                    className="h-10 px-6 rounded-xl text-sm font-semibold text-white flex items-center gap-2 transition-all"
                    style={{
                      background: saved ? '#22c55e' : 'linear-gradient(135deg, #4F8EF7, #7B5EEA)',
                      boxShadow: saved ? '0 0 20px rgba(34,197,94,0.3)' : '0 0 20px rgba(79,142,247,0.25)',
                    }}
                  >
                    {saved ? <><Check className="w-4 h-4" /> Salvo!</> : 'Salvar alterações'}
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}