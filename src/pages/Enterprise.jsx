import { useState } from 'react';
import { motion } from 'framer-motion'; // @ts-check-ignore import { motion } from 'framer-motion'; // @ts-check-ignore
import { Building2, Check, ArrowLeft, Users, BarChart3, Shield, Globe, Zap, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom'; // @ts-check-ignore import { Link } from 'react-router-dom'; // @ts-check-ignore
import { useTheme } from '@/lib/ThemeContext';

const enterpriseFeatures = [
  { icon: Users, title: 'Profissionais ilimitados', desc: 'Sem limite de equipe. Gerencie centenas de profissionais.' },
  { icon: Building2, title: 'Multi unidades', desc: 'Dashboard consolidado para todas as filiais em tempo real.' },
  { icon: BarChart3, title: 'Analytics premium', desc: 'Relatórios avançados com comparativo entre unidades.' },
  { icon: Shield, title: 'Permissões avançadas', desc: 'Controle granular de acesso por cargo e unidade.' },
  { icon: Globe, title: 'API access', desc: 'Integre o Fadely com seus sistemas existentes via API.' },
  { icon: Zap, title: 'Automações personalizadas', desc: 'Fluxos de automação customizados para o seu negócio.' },
];

export default function Enterprise() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [form, setForm] = useState({ name: '', email: '', phone: '', company: '', units: '', size: '', goal: '' });
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSent(true);
  };

  const inputStyle = {
    background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
    border: isDark ? '1px solid rgba(255,255,255,0.09)' : '1px solid rgba(0,0,0,0.09)',
    color: isDark ? 'rgba(255,255,255,0.85)' : 'rgba(0,0,0,0.8)',
  };

  return (
    <div className={`min-h-screen transition-colors duration-500 ${isDark ? 'bg-[#0A0B0F]' : 'bg-white'} p-6 py-16`}>
      <div className="max-w-6xl mx-auto">
        <Link to="/" className="inline-flex items-center gap-2 text-sm mb-10 transition-opacity hover:opacity-70" style={{ color: isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.45)' }}>
          <ArrowLeft className="w-4 h-4" /> Voltar
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          {/* Left — showcase */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-6" style={{
              background: 'rgba(168,85,247,0.12)',
              color: '#a855f7',
              border: '1px solid rgba(168,85,247,0.25)',
            }}>
              <Building2 className="w-3 h-3" /> Enterprise
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight" style={{ color: isDark ? 'rgba(255,255,255,0.95)' : 'rgba(8,10,20,0.9)' }}>
              Para redes,<br />franquias e<br />grandes operações
            </h1>
            <p className="text-lg mb-10" style={{ color: isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.5)' }}>
              Infraestrutura robusta e ferramentas avançadas para negócios de beleza que operam em escala.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {enterpriseFeatures.map((f, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + i * 0.06 }}
                  className="flex gap-3 p-4 rounded-2xl"
                  style={{
                    background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                    border: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.06)',
                  }}
                >
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(168,85,247,0.12)' }}>
                    <f.icon className="w-4 h-4 text-purple-400" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold mb-0.5" style={{ color: isDark ? 'rgba(255,255,255,0.85)' : 'rgba(8,10,20,0.8)' }}>{f.title}</div>
                    <div className="text-xs leading-relaxed" style={{ color: isDark ? 'rgba(255,255,255,0.42)' : 'rgba(0,0,0,0.48)' }}>{f.desc}</div>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="mt-8 p-5 rounded-2xl" style={{
              background: 'linear-gradient(135deg, rgba(168,85,247,0.08), rgba(79,142,247,0.06))',
              border: '1px solid rgba(168,85,247,0.18)',
            }}>
              <div className="text-2xl font-bold mb-1" style={{ color: isDark ? '#fff' : 'rgba(8,10,20,0.9)' }}>R$149/mês</div>
              <div className="text-sm" style={{ color: isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.5)' }}>por unidade · desconto progressivo para múltiplas filiais</div>
            </div>
          </motion.div>

          {/* Right — form */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
            className="rounded-3xl p-8"
            style={{
              background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.95)',
              border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.08)',
              boxShadow: isDark ? '0 40px 80px rgba(0,0,0,0.4)' : '0 40px 80px rgba(0,0,0,0.08)',
            }}
          >
            {sent ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-full bg-green-500/15 flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8 text-green-400" />
                </div>
                <h3 className="text-xl font-bold mb-2" style={{ color: isDark ? 'rgba(255,255,255,0.9)' : 'rgba(8,10,20,0.85)' }}>
                  Solicitação enviada!
                </h3>
                <p className="text-sm" style={{ color: isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.5)' }}>
                  Nossa equipe de vendas entrará em contato em até 24h.
                </p>
              </div>
            ) : (
              <>
                <h2 className="text-xl font-bold mb-1" style={{ color: isDark ? 'rgba(255,255,255,0.9)' : 'rgba(8,10,20,0.85)' }}>
                  Fale com nossa equipe
                </h2>
                <p className="text-sm mb-6" style={{ color: isDark ? 'rgba(255,255,255,0.42)' : 'rgba(0,0,0,0.48)' }}>
                  Resposta em até 24h. Sem compromisso.
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { key: 'name', label: 'Nome completo', placeholder: 'João Silva' },
                      { key: 'email', label: 'E-mail comercial', placeholder: 'joao@salao.com' },
                    ].map((f) => (
                      <div key={f.key}>
                        <label className="text-xs font-medium mb-1.5 block" style={{ color: isDark ? 'rgba(255,255,255,0.52)' : 'rgba(0,0,0,0.5)' }}>{f.label}</label>
                        <input
                          required
                          value={form[f.key]}
                          onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                          placeholder={f.placeholder}
                          className="w-full h-10 px-3.5 rounded-xl text-sm outline-none transition-all"
                          style={inputStyle}
                        />
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { key: 'phone', label: 'WhatsApp', placeholder: '(11) 99999-9999' },
                      { key: 'company', label: 'Nome do negócio', placeholder: 'Salão XYZ' },
                    ].map((f) => (
                      <div key={f.key}>
                        <label className="text-xs font-medium mb-1.5 block" style={{ color: isDark ? 'rgba(255,255,255,0.52)' : 'rgba(0,0,0,0.5)' }}>{f.label}</label>
                        <input
                          value={form[f.key]}
                          onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                          placeholder={f.placeholder}
                          className="w-full h-10 px-3.5 rounded-xl text-sm outline-none"
                          style={inputStyle}
                        />
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium mb-1.5 block" style={{ color: isDark ? 'rgba(255,255,255,0.52)' : 'rgba(0,0,0,0.5)' }}>Nº de unidades</label>
                      <select
                        value={form.units}
                        onChange={e => setForm({ ...form, units: e.target.value })}
                        className="w-full h-10 px-3.5 rounded-xl text-sm outline-none"
                        style={inputStyle}
                      >
                        <option value="">Selecionar</option>
                        <option>2-5 unidades</option>
                        <option>6-15 unidades</option>
                        <option>16-50 unidades</option>
                        <option>50+ unidades</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-medium mb-1.5 block" style={{ color: isDark ? 'rgba(255,255,255,0.52)' : 'rgba(0,0,0,0.5)' }}>Tamanho da equipe</label>
                      <select
                        value={form.size}
                        onChange={e => setForm({ ...form, size: e.target.value })}
                        className="w-full h-10 px-3.5 rounded-xl text-sm outline-none"
                        style={inputStyle}
                      >
                        <option value="">Selecionar</option>
                        <option>5-20 pessoas</option>
                        <option>21-50 pessoas</option>
                        <option>51-100 pessoas</option>
                        <option>100+ pessoas</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-medium mb-1.5 block" style={{ color: isDark ? 'rgba(255,255,255,0.52)' : 'rgba(0,0,0,0.5)' }}>Qual seu principal desafio hoje?</label>
                    <textarea
                      value={form.goal}
                      onChange={e => setForm({ ...form, goal: e.target.value })}
                      placeholder="Ex: Quero centralizar a gestão das minhas 5 unidades..."
                      rows={3}
                      className="w-full px-3.5 py-3 rounded-xl text-sm outline-none resize-none"
                      style={inputStyle}
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full h-12 rounded-2xl text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all"
                    style={{
                      background: 'linear-gradient(135deg, #a855f7 0%, #4F8EF7 100%)',
                      boxShadow: '0 0 28px rgba(168,85,247,0.3)',
                    }}
                  >
                    Solicitar demonstração
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </form>
              </>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}