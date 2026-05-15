import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { goToLogin } from '@/lib/authRedirect';
import * as db from '@/repositories/db';
import { useAuth } from '@/lib/AuthContext';
import { motion } from 'framer-motion';
import { Building2, CheckCircle, Loader2, AlertTriangle, Briefcase } from 'lucide-react';
import FadelyLogo from '@/components/FadelyLogo';

export default function EmployeeInvite() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoadingAuth } = useAuth();
  const employeeId = searchParams.get('eid');
  const inviteCode = searchParams.get('code');

  const [state, setState] = useState('loading'); // loading | confirm | processing | success | error
  const [employee, setEmployee] = useState(null);
  const [business, setBusiness] = useState(null);

  useEffect(() => {
    if (isLoadingAuth) return;
    if (!isAuthenticated) {
      goToLogin(`/employee-invite?code=${inviteCode}&eid=${employeeId}`);
      return;
    }
    if (!employeeId && !inviteCode) { setState('error'); return; }
    loadInvite();
  }, [isAuthenticated, isLoadingAuth, employeeId, inviteCode]);

  const loadInvite = async () => {
    try {
      const raw = await db.invitePreviewRpc(employeeId || null, inviteCode || null);
      const emp = raw?.employee || null;
      const biz = raw?.business || null;
      if (!biz || Object.keys(biz).length === 0) {
        setState('error');
        return;
      }
      setBusiness(biz);
      if (emp && Object.keys(emp).length > 0) setEmployee(emp);
      setState('confirm');
    } catch {
      setState('error');
    }
  };

  const handleAccept = async () => {
    setState('processing');
    try {
      await db.acceptInviteRpc({
        employeeId: employee?.id || null,
        inviteCode: !employee ? inviteCode : null,
        userId: user.id,
        email: user.email,
        fullName: user.full_name || user.email,
      });
      setState('success');
      setTimeout(() => navigate('/employee'), 2000);
    } catch {
      setState('error');
    }
  };

  if (state === 'loading' || isLoadingAuth) {
    return (
      <div className="min-h-screen bg-[#08090E] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
      </div>
    );
  }

  if (state === 'error') {
    return (
      <div className="min-h-screen bg-[#08090E] flex items-center justify-center p-6">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="text-white font-bold text-xl mb-2">Link inválido</h2>
          <p className="text-white/40 text-sm mb-6">Este link de convite não é válido ou já foi utilizado.</p>
          <button onClick={() => navigate('/')} className="px-6 py-2.5 rounded-xl text-sm font-medium text-white/50 hover:text-white border border-white/10 transition-all">
            Voltar ao início
          </button>
        </div>
      </div>
    );
  }

  if (state === 'success') {
    return (
      <div className="min-h-screen bg-[#08090E] flex items-center justify-center p-6">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center max-w-sm">
          <div className="w-20 h-20 rounded-full bg-green-500/12 flex items-center justify-center mx-auto mb-6 border-2 border-green-500/25">
            <CheckCircle className="w-10 h-10 text-green-400" />
          </div>
          <h2 className="text-white font-bold text-2xl mb-2">Bem-vindo(a)! 🎉</h2>
          <p className="text-white/40 text-sm">Você agora faz parte de <strong className="text-white">{business?.name}</strong>. Redirecionando...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#08090E] flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-blue-600/5 rounded-full blur-3xl pointer-events-none" />

      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm relative z-10">
        <div className="text-center mb-8">
          <FadelyLogo size="md" className="justify-center mb-6" />
          <h1 className="text-white font-bold text-2xl mb-1">Convite de Equipe</h1>
          <p className="text-white/40 text-sm">Você foi convidado para fazer parte de uma equipe</p>
        </div>

        <div className="rounded-2xl p-6 space-y-4" style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)' }}>
          {business && (
            <div className="flex items-center gap-3 p-4 rounded-xl" style={{ background: 'rgba(79,142,247,0.06)', border: '1px solid rgba(79,142,247,0.12)' }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #4F8EF7, #7B5EEA)' }}>
                {business.name?.[0]}
              </div>
              <div>
                <p className="text-white font-semibold text-sm">{business.name}</p>
                {business.address && <p className="text-white/40 text-xs">{business.address}</p>}
              </div>
            </div>
          )}

          {employee && (
            <div className="space-y-2">
              <div className="flex justify-between py-1.5 border-b border-white/[0.05]">
                <span className="text-white/40 text-sm">Seu nome</span>
                <span className="text-white text-sm font-medium">{employee.name}</span>
              </div>
              {employee.role && (
                <div className="flex justify-between py-1.5 border-b border-white/[0.05]">
                  <span className="text-white/40 text-sm flex items-center gap-1.5"><Briefcase className="w-3 h-3" /> Cargo</span>
                  <span className="text-white text-sm font-medium">{employee.role}</span>
                </div>
              )}
              <div className="flex justify-between py-1.5">
                <span className="text-white/40 text-sm">Sua conta</span>
                <span className="text-white text-sm font-medium truncate max-w-[180px]">{user?.email}</span>
              </div>
            </div>
          )}

          {!employee && (
            <div className="flex justify-between py-1.5">
              <span className="text-white/40 text-sm">Sua conta</span>
              <span className="text-white text-sm font-medium truncate max-w-[180px]">{user?.email}</span>
            </div>
          )}
        </div>

        <p className="text-white/25 text-xs text-center mt-4 mb-6">
          Ao aceitar, seu login ficará vinculado a este estabelecimento. Você poderá sair a qualquer momento.
        </p>

        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleAccept}
          disabled={state === 'processing'}
          className="w-full h-12 rounded-xl font-semibold text-white text-sm flex items-center justify-center gap-2 disabled:opacity-50 transition-all"
          style={{ background: 'linear-gradient(135deg, #4F8EF7, #7B5EEA)', boxShadow: '0 0 30px rgba(79,142,247,0.25)' }}
        >
          {state === 'processing' ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Processando...</>
          ) : (
            <><CheckCircle className="w-4 h-4" /> Aceitar e entrar na equipe</>
          )}
        </motion.button>
      </motion.div>
    </div>
  );
}