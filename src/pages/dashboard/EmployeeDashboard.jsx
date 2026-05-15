import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as db from '@/repositories/db';
import { useAuth } from '@/lib/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { format, parseISO, isSameDay } from 'date-fns';
import {
  Calendar, Scissors, Clock, DollarSign, LogOut, Settings,
  CheckCircle, XCircle, User, Building2, AlertTriangle, Loader2
} from 'lucide-react';
import FadelyLogo from '@/components/FadelyLogo';

const statusColors = {
  scheduled: { bg: 'rgba(79,142,247,0.15)', text: '#7BB3FF', label: 'Agendado' },
  confirmed: { bg: 'rgba(34,197,94,0.12)', text: '#4ade80', label: 'Confirmado' },
  completed: { bg: 'rgba(168,85,247,0.12)', text: '#c084fc', label: 'Concluído' },
  in_progress: { bg: 'rgba(251,191,36,0.12)', text: '#fbbf24', label: 'Em andamento' },
  cancelled: { bg: 'rgba(239,68,68,0.08)', text: '#f87171', label: 'Cancelado' },
};

export default function EmployeeDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showResignConfirm, setShowResignConfirm] = useState(false);
  const today = new Date();

  // Find employee record linked to this user
  const { data: employeeRecords = [], isLoading: loadingEmployee } = useQuery({
    queryKey: ['employee-by-email', user?.email],
    queryFn: () => db.listEmployeesByUserEmail(user?.email),
    enabled: !!user?.email,
  });

  const employee = employeeRecords[0];

  // Get business
  const { data: businesses = [] } = useQuery({
    queryKey: ['business-for-employee', employee?.business_id],
    queryFn: async () => {
      const b = await db.getBusinessById(employee?.business_id);
      return b ? [b] : [];
    },
    enabled: !!employee?.business_id,
  });
  const business = businesses[0];

  // Get appointments for this employee
  const { data: appointments = [] } = useQuery({
    queryKey: ['employee-appointments', employee?.id],
    queryFn: () => db.listAppointmentsByEmployee(employee?.id),
    enabled: !!employee?.id,
    refetchInterval: 30000,
  });

  const resignMutation = useMutation({
    mutationFn: () => db.updateEmployee(employee.id, {
      user_email: null,
      is_linked: false,
      auth_user_id: null,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee-by-email'] });
      navigate('/');
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }) => db.updateAppointment(id, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['employee-appointments'] }),
  });

  if (loadingEmployee) {
    return (
      <div className="min-h-screen bg-[#08090E] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="min-h-screen bg-[#08090E] flex items-center justify-center p-6">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 rounded-2xl bg-yellow-500/10 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-yellow-400" />
          </div>
          <h2 className="text-white font-bold text-xl mb-2">Sem vínculo ativo</h2>
          <p className="text-white/40 text-sm mb-6">Sua conta não está vinculada a nenhum estabelecimento. Use o link de convite recebido pelo estabelecimento.</p>
          <button onClick={() => logout('/')} className="px-6 py-2.5 rounded-xl text-sm font-medium text-white/50 hover:text-white border border-white/10 hover:border-white/20 transition-all">
            Sair
          </button>
        </div>
      </div>
    );
  }

  const todayApts = appointments.filter(a => a.date === format(today, 'yyyy-MM-dd') && a.status !== 'cancelled');
  const upcomingApts = appointments
    .filter(a => a.date >= format(today, 'yyyy-MM-dd') && a.status !== 'cancelled')
    .sort((a, b) => (a.date + a.time) > (b.date + b.time) ? 1 : -1)
    .slice(0, 10);
  const completedThisMonth = appointments.filter(a => {
    return a.status === 'completed' && a.date?.startsWith(format(today, 'yyyy-MM'));
  });
  const revenueThisMonth = completedThisMonth.reduce((sum, a) => sum + (a.price || 0), 0);

  return (
    <div className="min-h-screen bg-[#08090E]">
      {/* Top bar */}
      <div className="border-b border-white/[0.05]" style={{ background: 'rgba(8,9,14,0.97)' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <FadelyLogo size="sm" />
          <div className="flex items-center gap-3">
            <button
              onClick={() => logout('/')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs text-white/30 hover:text-white/60 transition-all border border-white/[0.07] hover:border-white/15"
            >
              <LogOut className="w-3.5 h-3.5" /> Sair
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Employee badge */}
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-bold text-white flex-shrink-0"
            style={{ background: `linear-gradient(135deg, ${employee.color || '#4F8EF7'}40, ${employee.color || '#4F8EF7'}20)`, border: `1px solid ${employee.color || '#4F8EF7'}30` }}>
            {employee.name?.[0]?.toUpperCase()}
          </div>
          <div>
            <h1 className="text-white font-bold text-xl">{employee.name}</h1>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              {employee.role && (
                <span className="text-xs px-2 py-0.5 rounded-full text-white/60"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.09)' }}>
                  {employee.role}
                </span>
              )}
              {business && (
                <span className="text-xs px-2 py-0.5 rounded-full text-blue-400 flex items-center gap-1"
                  style={{ background: 'rgba(79,142,247,0.1)', border: '1px solid rgba(79,142,247,0.2)' }}>
                  <Building2 className="w-2.5 h-2.5" /> {business.name}
                </span>
              )}
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="grid grid-cols-3 gap-3">
          {[
            { label: 'Hoje', value: todayApts.length, icon: Calendar, color: '#4F8EF7' },
            { label: 'Mês', value: completedThisMonth.length, icon: Scissors, color: '#a855f7' },
            { label: 'Receita', value: `R$${revenueThisMonth.toFixed(0)}`, icon: DollarSign, color: '#22c55e' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div className="w-8 h-8 rounded-xl flex items-center justify-center mb-3" style={{ background: `${color}18` }}>
                <Icon className="w-4 h-4" style={{ color }} />
              </div>
              <p className="text-white font-bold text-xl">{value}</p>
              <p className="text-white/35 text-xs mt-0.5">{label}</p>
            </div>
          ))}
        </motion.div>

        {/* Today */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
          <h2 className="text-white font-semibold text-sm mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-400" /> Agendamentos de hoje
          </h2>
          {todayApts.length === 0 ? (
            <p className="text-white/25 text-sm text-center py-6">Nenhum agendamento para hoje</p>
          ) : (
            <div className="space-y-2">
              {todayApts.map(apt => {
                const s = statusColors[apt.status] || statusColors.scheduled;
                return (
                  <div key={apt.id} className="flex items-center gap-3 p-3 rounded-xl"
                    style={{ background: s.bg, border: `1px solid ${s.bg.replace('0.15', '0.25').replace('0.12', '0.2').replace('0.08', '0.15')}` }}>
                    <div className="text-center flex-shrink-0 w-12">
                      <p className="text-white font-bold text-sm">{apt.time}</p>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium text-sm truncate">{apt.client_name}</p>
                      <p className="text-white/40 text-xs truncate">{apt.service_name}</p>
                    </div>
                    {apt.price > 0 && <span className="text-green-400 text-xs font-semibold">R${apt.price}</span>}
                    <div className="flex gap-1">
                      {apt.status !== 'completed' && (
                        <button onClick={() => updateStatusMutation.mutate({ id: apt.id, status: 'completed' })}
                          className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-green-500/10 transition-all text-green-400/50 hover:text-green-400">
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* Upcoming */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
          <h2 className="text-white font-semibold text-sm mb-4 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-purple-400" /> Próximos agendamentos
          </h2>
          {upcomingApts.length === 0 ? (
            <p className="text-white/25 text-sm text-center py-6">Nenhum agendamento próximo</p>
          ) : (
            <div className="space-y-2">
              {upcomingApts.map(apt => {
                const s = statusColors[apt.status] || statusColors.scheduled;
                return (
                  <div key={apt.id} className="flex items-center gap-3 p-3 rounded-xl"
                    style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div className="flex-shrink-0 text-center">
                      <p className="text-white/50 text-xs">{format(parseISO(apt.date), 'dd/MM')}</p>
                      <p className="text-white font-semibold text-sm">{apt.time}</p>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate">{apt.client_name}</p>
                      <p className="text-white/35 text-xs truncate">{apt.service_name}</p>
                    </div>
                    <span className="text-xs px-2 py-0.5 rounded-full flex-shrink-0" style={{ background: s.bg, color: s.text }}>
                      {s.label}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* Resign */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
          className="rounded-2xl p-5" style={{ background: 'rgba(239,68,68,0.04)', border: '1px solid rgba(239,68,68,0.1)' }}>
          <h3 className="text-white/60 text-sm font-medium mb-2">Zona de Saída</h3>
          <p className="text-white/30 text-xs mb-4">Ao sair do estabelecimento, seu vínculo será removido. Seus dados de login são mantidos.</p>
          {!showResignConfirm ? (
            <button
              onClick={() => setShowResignConfirm(true)}
              className="px-4 py-2 rounded-xl text-xs font-medium text-red-400 border border-red-500/20 hover:bg-red-500/10 transition-all"
            >
              Sair do estabelecimento
            </button>
          ) : (
            <div className="flex items-center gap-3 flex-wrap">
              <p className="text-white/50 text-xs">Tem certeza? Esta ação não pode ser desfeita.</p>
              <div className="flex gap-2">
                <button onClick={() => setShowResignConfirm(false)} className="px-3 py-1.5 rounded-lg text-xs text-white/40 hover:text-white border border-white/10 transition-all">
                  Cancelar
                </button>
                <button
                  onClick={() => resignMutation.mutate()}
                  disabled={resignMutation.isPending}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-white bg-red-500/70 hover:bg-red-500/90 transition-all disabled:opacity-50"
                >
                  {resignMutation.isPending ? 'Saindo...' : 'Confirmar saída'}
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}