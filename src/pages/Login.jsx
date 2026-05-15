import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Loader2, Sparkles } from 'lucide-react';
import { signInWithEmail, signUpWithEmail } from '@/repositories/db';
import { supabase } from '@/lib/supabaseClient';
import { useTheme } from '@/lib/ThemeContext';
import { rateLimit } from '@/middleware/rateLimit';
import FadelyLogo from '@/components/FadelyLogo';
import ThemeToggle from '@/components/ThemeToggle';

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
  const [showReset, setShowReset] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    if (!rateLimit(`auth:${email}`, 8, 120_000)) {
      setError('Muitas tentativas. Aguarde um minuto.');
      return;
    }
    setLoading(true);
    try {
      if (mode === 'signin') {
        await signInWithEmail(email.trim(), password);
        navigate(next.startsWith('/') ? next : '/dashboard', { replace: true });
      } else {
        const data = await signUpWithEmail(email.trim(), password, fullName.trim());
        if (data?.session) navigate(next.startsWith('/') ? next : '/dashboard', { replace: true });
        else setMessage('Verifique o seu email para confirmar a conta.');
      }
    } catch (err) {
      setError(err.message || 'Falha na autenticação');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    if (!rateLimit(`reset:${email}`, 3, 300_000)) {
      setError('Aguarde antes de solicitar novamente.');
      return;
    }
    setLoading(true);
    try {
      const { error: resetErr } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/login?reset=1`,
      });
      if (resetErr) throw resetErr;
      setMessage('Enviamos um link de recuperação para o seu email.');
    } catch (err) {
      setError(err.message || 'Não foi possível enviar o email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen relative overflow-hidden ${isDark ? 'bg-[#06070D]' : 'bg-[#F4F6FB]'}`}>
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <motion.div
          className="absolute -top-32 left-1/2 -translate-x-1/2 w-[720px] h-[420px] rounded-full blur-3xl opacity-60"
          style={{ background: isDark ? 'radial-gradient(circle, rgba(79,142,247,0.18), transparent 70%)' : 'radial-gradient(circle, rgba(79,142,247,0.12), transparent 70%)' }}
        />
        <motion.div
          className="absolute bottom-0 right-0 w-[480px] h-[320px] rounded-full blur-3xl opacity-40"
          style={{ background: isDark ? 'radial-gradient(circle, rgba(123,94,234,0.15), transparent 70%)' : 'radial-gradient(circle, rgba(123,94,234,0.08), transparent 70%)' }}
        />
      </div>

      <div className="absolute top-6 left-6 right-6 flex items-center justify-between z-10 safe-top">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" /> Início
        </Link>
        <ThemeToggle compact />
      </div>

      <div className="relative z-10 min-h-screen flex flex-col lg:flex-row">
        <motion.aside
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="hidden lg:flex flex-1 flex-col justify-center px-16 xl:px-24 py-20"
        >
          <FadelyLogo size="lg" />
          <h1 className={`mt-10 text-4xl xl:text-5xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Gestão premium para o seu negócio de beleza.
          </h1>
          <p className={`mt-4 text-lg max-w-md ${isDark ? 'text-white/45' : 'text-gray-500'}`}>
            Agenda, equipe, clientes e financeiro — com a experiência que o seu salão merece.
          </p>
          <ul className="mt-10 space-y-3 text-sm">
            {['Agendamentos online', 'Multi-unidade', 'WhatsApp integrado'].map((t) => (
              <li key={t} className={`flex items-center gap-2 ${isDark ? 'text-white/50' : 'text-gray-500'}`}>
                <Sparkles className="w-4 h-4 text-blue-400 shrink-0" /> {t}
              </li>
            ))}
          </ul>
        </motion.aside>

        <div className="flex-1 flex items-center justify-center p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md rounded-3xl p-8 md:p-10 border backdrop-blur-xl shadow-2xl"
            style={{
              background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.95)',
              borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
            }}
          >
            <div className="lg:hidden flex justify-center mb-8">
              <FadelyLogo size="md" />
            </div>

            <AnimatePresence mode="wait">
              {showReset ? (
                <motion.form key="reset" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onSubmit={handleReset} className="space-y-4">
                  <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Recuperar senha</h2>
                  <AuthInput label="Email" type="email" value={email} onChange={setEmail} required />
                  {error && <p className="text-sm text-red-400">{error}</p>}
                  {message && <p className="text-sm text-green-500">{message}</p>}
                  <SubmitButton loading={loading} label="Enviar link" />
                  <button type="button" onClick={() => setShowReset(false)} className="w-full text-sm text-muted-foreground hover:text-foreground">
                    Voltar ao login
                  </button>
                </motion.form>
              ) : (
                <motion.div key="auth" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <div className="flex rounded-xl p-0.5 mb-6" style={{ background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }}>
                    {['signin', 'signup'].map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => { setMode(m); setError(''); setMessage(''); }}
                        className="flex-1 py-2.5 text-sm font-medium rounded-lg transition-all"
                        style={{
                          background: mode === m ? (isDark ? 'rgba(79,142,247,0.2)' : 'white') : 'transparent',
                          color: mode === m ? '#4F8EF7' : isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.45)',
                        }}
                      >
                        {m === 'signin' ? 'Entrar' : 'Criar conta'}
                      </button>
                    ))}
                  </div>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {mode === 'signup' && <AuthInput label="Nome" value={fullName} onChange={setFullName} placeholder="O seu nome" />}
                    <AuthInput label="Email" type="email" value={email} onChange={setEmail} required autoComplete="email" />
                    <AuthInput label="Palavra-passe" type="password" value={password} onChange={setPassword} required minLength={8} />
                    {mode === 'signin' && (
                      <button type="button" onClick={() => setShowReset(true)} className="text-xs text-blue-400 hover:underline">
                        Esqueceu a senha?
                      </button>
                    )}
                    {error && <p className="text-sm text-red-400">{error}</p>}
                    {message && <p className="text-sm text-green-500">{message}</p>}
                    <SubmitButton loading={loading} label={mode === 'signin' ? 'Entrar' : 'Criar conta'} />
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function AuthInput({ label, value, onChange, type = 'text', ...rest }) {
  return (
    <div>
      <label className="text-xs font-medium block mb-1.5 text-muted-foreground">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-11 px-4 rounded-xl text-sm border border-border bg-background/50 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
        {...rest}
      />
    </div>
  );
}

function SubmitButton({ loading, label }) {
  return (
    <motion.button
      type="submit"
      disabled={loading}
      whileHover={{ scale: loading ? 1 : 1.01 }}
      whileTap={{ scale: 0.99 }}
      className="w-full h-12 rounded-2xl text-white font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50"
      style={{ background: 'linear-gradient(135deg, #4F8EF7, #7B5EEA)' }}
    >
      {loading && <Loader2 className="w-4 h-4 animate-spin" />}
      {label}
    </motion.button>
  );
}
