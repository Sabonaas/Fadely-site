import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { signInWithEmail, signUpWithEmail } from '@/repositories/db';
import { useTheme } from '@/lib/ThemeContext';
import FadelyLogo from '@/components/FadelyLogo';

export default function Login() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const next = searchParams.get('next') || '/dashboard';

  const [mode, setMode] = useState('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const card = {
    background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.95)',
    border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.08)',
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);
    try {
      if (mode === 'signin') {
        await signInWithEmail(email.trim(), password);
        navigate(next.startsWith('/') ? next : '/dashboard', { replace: true });
      } else {
        const data = await signUpWithEmail(email.trim(), password, fullName.trim());
        if (data?.session) {
          navigate(next.startsWith('/') ? next : '/dashboard', { replace: true });
        } else {
          setMessage('Verifique o seu email para confirmar a conta (se a confirmação estiver ativa no Supabase).');
        }
      }
    } catch (err) {
      setError(err.message || 'Falha na autenticação');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-6 ${isDark ? 'bg-[#0A0B0F]' : 'bg-[#F8F9FC]'}`}>
      <Link
        to="/"
        className="absolute top-6 left-6 inline-flex items-center gap-2 text-sm opacity-60 hover:opacity-100 transition-opacity"
        style={{ color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}
      >
        <ArrowLeft className="w-4 h-4" /> Início
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md rounded-3xl p-8 md:p-10"
        style={card}
      >
        <div className="flex justify-center mb-8">
          <FadelyLogo size="md" />
        </div>

        <div className="flex rounded-xl overflow-hidden mb-6 p-0.5" style={{ background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }}>
          {['signin', 'signup'].map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => { setMode(m); setError(''); setMessage(''); }}
              className="flex-1 py-2.5 text-sm font-medium rounded-lg transition-all"
              style={{
                background: mode === m ? (isDark ? 'rgba(79,142,247,0.2)' : 'white') : 'transparent',
                color: mode === m ? '#4F8EF7' : (isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.45)'),
              }}
            >
              {m === 'signin' ? 'Entrar' : 'Criar conta'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <div>
              <label className="text-xs font-medium block mb-1.5" style={{ color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>Nome</label>
              <input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full h-11 px-4 rounded-xl text-sm outline-none"
                style={{
                  background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
                  border: isDark ? '1px solid rgba(255,255,255,0.09)' : '1px solid rgba(0,0,0,0.09)',
                  color: isDark ? '#fff' : '#111',
                }}
                placeholder="O teu nome"
              />
            </div>
          )}
          <div>
            <label className="text-xs font-medium block mb-1.5" style={{ color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-11 px-4 rounded-xl text-sm outline-none"
              style={{
                background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
                border: isDark ? '1px solid rgba(255,255,255,0.09)' : '1px solid rgba(0,0,0,0.09)',
                color: isDark ? '#fff' : '#111',
              }}
              placeholder="email@exemplo.com"
              autoComplete="email"
            />
          </div>
          <div>
            <label className="text-xs font-medium block mb-1.5" style={{ color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>Palavra-passe</label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-11 px-4 rounded-xl text-sm outline-none"
              style={{
                background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
                border: isDark ? '1px solid rgba(255,255,255,0.09)' : '1px solid rgba(0,0,0,0.09)',
                color: isDark ? '#fff' : '#111',
              }}
              placeholder="••••••••"
              autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
            />
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}
          {message && <p className="text-sm text-green-400">{message}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 rounded-2xl text-white font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, #4F8EF7 0%, #7B5EEA 100%)' }}
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {mode === 'signin' ? 'Entrar' : 'Registar'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
