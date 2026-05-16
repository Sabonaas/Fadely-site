import { useOutletContext, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import * as db from '@/repositories/db';
import { motion } from 'framer-motion';
import { Calendar, Users, Scissors, TrendingUp, Clock, ArrowRight, Plus, Zap, CheckCircle, AlertCircle } from 'lucide-react';
import { format, parseISO } from 'date-fns';

const statusConfig = {
  scheduled: { label: 'Agendado', color: '#4F8EF7', bg: 'rgba(79,142,247,0.1)', border: 'rgba(79,142,247,0.2)' },
  confirmed: { label: 'Confirmado', color: '#22c55e', bg: 'rgba(34,197,94,0.1)', border: 'rgba(34,197,94,0.2)' },
  completed: { label: 'Concluído', color: '#a855f7', bg: 'rgba(168,85,247,0.1)', border: 'rgba(168,85,247,0.2)' },
  in_progress: { label: 'Em andamento', color: '#f59e0b', bg: 'rgba(251,191,36,0.1)', border: 'rgba(251,191,36,0.2)' },
  cancelled: { label: 'Cancelado', color: '#ef4444', bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.2)' },
};

function StatCard({ icon: Icon, title, value, sub, color, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="relative rounded-2xl p-5 overflow-hidden group bg-card border border-border"
        style={{
        backdropFilter: 'blur(12px)',
      }}
>
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ background: `radial-gradient(circle at 70% 30%, ${color}08, transparent 70%)` }} />
      <div className="flex items-start justify-between mb-4">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: `${color}15`, border: `1px solid ${color}25` }}>
          <Icon className="w-4 h-4" style={{ color }} />
        </div>
      </div>
      <p className="text-2xl font-bold text-foreground mb-1">{value}</p>
      <p className="text-muted-foreground text-sm">{title}</p>
      {sub && <p className="text-xs mt-1" style={{ color }}>{sub}</p>}
    </motion.div>
  );
}

export default function DashboardHome() {
  const { business } = useOutletContext();
  const today = format(new Date(), 'yyyy-MM-dd');
  const now = new Date();

  const { data: services = [] } = useQuery({
    queryKey: ['services', business.id],
    queryFn: () => db.listServicesByBusiness(business.id),
    refetchInterval: 30000,
  });

  const { data: appointments = [] } = useQuery({
    queryKey: ['appointments', business.id],
    queryFn: () => db.listAppointmentsByBusiness(business.id),
    refetchInterval: 30000,
  });

  const { data: clients = [] } = useQuery({
    queryKey: ['clients', business.id],
    queryFn: () => db.listClientsByBusiness(business.id),
    refetchInterval: 30000,
  });

  const { data: employees = [] } = useQuery({
    queryKey: ['employees', business.id],
    queryFn: () => db.listEmployeesByBusinessId(business.id),
  });

  const todayAppointments = appointments
    .filter(a => a.date === today && a.status !== 'cancelled')
    .sort((a, b) => a.time > b.time ? 1 : -1);

  const totalRevenue = appointments
    .filter(a => a.status === 'completed')
    .reduce((sum, a) => sum + (a.price || 0), 0);

  const pendingCount = appointments.filter(a => a.status === 'scheduled' && a.date >= today).length;
  const completedToday = todayAppointments.filter(a => a.status === 'completed').length;

  const greeting = now.getHours() < 12 ? 'Bom dia' : now.getHours() < 18 ? 'Boa tarde' : 'Boa noite';
  const dayLabel = format(new Date(), "EEEE',' d 'de' MMMM");

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">
            {greeting}, {business.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5 capitalize">{dayLabel}</p>
        </div>
        <Link
          to="/dashboard/calendar"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-foreground transition-all hover:opacity-90 self-start sm:self-auto"
          style={{ background: 'linear-gradient(135deg, #4F8EF7, #7B5EEA)', boxShadow: '0 0 20px rgba(79,142,247,0.25)' }}
        >
          <Plus className="w-4 h-4" />
          Novo Agendamento
        </Link>
      </motion.div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard icon={Calendar} title="Hoje" value={todayAppointments.length} sub={`${completedToday} concluídos`} color="#4F8EF7" delay={0} />
        <StatCard icon={Users} title="Clientes" value={clients.length} sub={`${clients.length} clientes`} color="#a855f7" delay={0.05} />
        <StatCard icon={Scissors} title="Serviços" value={services.filter(s => s.is_active !== false).length} sub={`${services.filter(s => s.is_active !== false).length} serviços`} color="#22c55e" delay={0.1} />
        <StatCard icon={TrendingUp} title="Receita" value={`R$${totalRevenue.toFixed(0)}`} sub={`${pendingCount} pendentes`} color="#f59e0b" delay={0.15} />
      </div>

      {/* Today's schedule + quick actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Schedule */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2 rounded-2xl p-5"
          style={{
            background: 'rgba(255,255,255,0.018)',
            border: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
              <h2 className="text-white font-semibold">Agenda de Hoje</h2>
            </div>
            <Link to="/dashboard/calendar" className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors">
              Ver tudo <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {todayAppointments.length === 0 ? (
            <div className="text-center py-10">
              <Clock className="w-8 h-8 text-white/15 mx-auto mb-3" />
              <p className="text-muted-foreground text-sm">Nenhum agendamento hoje</p>
              <Link to="/dashboard/calendar" className="inline-flex items-center gap-1.5 mt-3 text-xs text-blue-400 hover:text-blue-300">
                <Plus className="w-3 h-3" /> Agendar agora
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {todayAppointments.slice(0, 6).map((apt, i) => {
                const sc = statusConfig[apt.status] || statusConfig.scheduled;
                return (
                  <motion.div
                    key={apt.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + i * 0.04 }}
                    className="flex items-center gap-3 p-3 rounded-xl transition-all hover:bg-card"
                    style={{ border: '1px solid rgba(255,255,255,0.04)' }}
                  >
                    <div className="text-center w-12 flex-shrink-0">
                      <p className="text-foreground font-bold text-sm">{apt.time}</p>
                    </div>
                    <div className="w-px h-8 flex-shrink-0" style={{ background: sc.color + '40' }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-foreground text-sm font-medium truncate">{apt.client_name}</p>
                      <p className="text-muted-foreground text-xs truncate">{apt.service_name}</p>
                    </div>
                    {apt.employee_name && (
                      <p className="text-muted-foreground text-xs hidden sm:block truncate max-w-[80px]">{apt.employee_name}</p>
                    )}
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-medium flex-shrink-0"
                      style={{ background: sc.bg, color: sc.color, border: `1px solid ${sc.border}` }}>
                      {sc.label}
                    </span>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* Quick stats sidebar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="space-y-3"
        >
          {/* Plan badge */}
          <div className="rounded-2xl p-4"
            style={{
              background: 'rgba(79,142,247,0.06)',
              border: '1px solid rgba(79,142,247,0.15)',
            }}>
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4 text-blue-400" />
              <span className="text-muted-foreground text-xs font-medium uppercase tracking-wide">Plano Atual</span>
            </div>
            <p className="text-foreground font-semibold capitalize">
              {business.subscription_plan === 'free_trial' ? 'Período de Teste' :
               business.subscription_plan === 'starter' ? 'Essencial' :
               business.subscription_plan === 'professional' ? 'Crescimento' :
               business.subscription_plan === 'enterprise' ? 'Elite' :
               business.subscription_plan}
            </p>
            <p className="text-muted-foreground text-xs mt-1">
              {business.subscription_status === 'trial' ? '14 dias gratuitos' : 'Ativo'}
            </p>
          </div>

          {/* Quick links */}
          <div className="rounded-2xl p-4 space-y-2"
            style={{
              background: 'rgba(255,255,255,0.018)',
              border: '1px solid rgba(255,255,255,0.06)',
            }}>

            <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide mb-3">Acesso Rápido</p>
            {[
              { label: 'Gerenciar Clientes', path: '/dashboard/clients', icon: Users },
              { label: 'Ver Relatórios', path: '/dashboard/reports', icon: TrendingUp },
              { label: 'Configurar Serviços', path: '/dashboard/services', icon: Scissors },
            ].map(item => (
              <Link key={item.path} to={item.path}
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-muted-foreground hover:text-white/80 hover:bg-white/[0.03] transition-all group">
                <item.icon className="w-3.5 h-3.5 flex-shrink-0 group-hover:text-blue-400 transition-colors" />
                <span>{item.label}</span>
                <ArrowRight className="w-3 h-3 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            ))}
          </div>

          {/* Employees quick */}
          {employees.length > 0 && (
            <div className="rounded-2xl p-4"
              style={{
                background: 'rgba(255,255,255,0.018)',
                border: '1px solid rgba(255,255,255,0.06)',
              }}>
              <p className="text-white/40 text-xs font-medium uppercase tracking-wide mb-3">Equipe</p>
              <div className="space-y-2">
                {employees.slice(0, 3).map(emp => (
                  <div key={emp.id} className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0"
                      style={{ background: 'linear-gradient(135deg, #4F8EF7, #7B5EEA)' }}>
                      {emp.name?.[0]}
                    </div>
                    <span className="text-white/60 text-xs truncate">{emp.name}</span>
                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-green-400 flex-shrink-0" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
