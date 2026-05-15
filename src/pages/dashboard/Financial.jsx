import { useOutletContext } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import * as db from '@/repositories/db';
import { motion } from 'framer-motion';
import { DollarSign, TrendingUp, Calendar, CreditCard } from 'lucide-react';
import StatCard from '@/components/dashboard/StatCard';
import EmptyState from '@/components/dashboard/EmptyState';
import { format, startOfMonth, endOfMonth, isWithinInterval, parseISO } from 'date-fns';

export default function Financial() {
  const { business } = useOutletContext();

  const { data: appointments = [] } = useQuery({
    queryKey: ['appointments', business.id],
    queryFn: () => db.listAppointmentsByBusiness(business.id),
  });

  const completed = appointments.filter(a => a.status === 'completed');
  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);

  const thisMonth = completed.filter(a => {
    if (!a.date) return false;
    const d = parseISO(a.date);
    return isWithinInterval(d, { start: monthStart, end: monthEnd });
  });

  const totalRevenue = completed.reduce((s, a) => s + (a.price || 0), 0);
  const monthRevenue = thisMonth.reduce((s, a) => s + (a.price || 0), 0);
  const avgTicket = completed.length > 0 ? totalRevenue / completed.length : 0;

  if (completed.length === 0) {
    return (
      <div>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-8">
          <h1 className="text-2xl font-bold text-white">Financeiro</h1>
          <p className="text-white/40 mt-1">Controle de receita e insights</p>
        </motion.div>
        <EmptyState icon={DollarSign} title="Sem dados financeiros" description="Conclua atendimentos para começar a acompanhar a receita e métricas financeiras." />
      </div>
    );
  }

  return (
    <div>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-8">
        <h1 className="text-2xl font-bold text-white">Financeiro</h1>
        <p className="text-white/40 mt-1">{format(now, 'MMMM yyyy')}</p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={DollarSign} title="Receita Total" value={`R$${totalRevenue.toFixed(2)}`} delay={0} />
        <StatCard icon={TrendingUp} title="Este Mês" value={`R$${monthRevenue.toFixed(2)}`} delay={0.05} />
        <StatCard icon={Calendar} title="Atendimentos Concluídos" value={completed.length} delay={0.1} />
        <StatCard icon={CreditCard} title="Ticket Médio" value={`R$${avgTicket.toFixed(2)}`} delay={0.15} />
      </div>

      {/* Recent transactions */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="rounded-2xl border border-white/5 bg-white/[0.02] p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Transações Recentes</h2>
        <div className="space-y-2">
          {completed.slice(0, 10).map((a, i) => (
            <div key={a.id} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5">
              <div>
                <p className="text-white text-sm font-medium">{a.client_name}</p>
                <p className="text-white/40 text-xs">{a.service_name} — {a.date}</p>
              </div>
              <span className="text-green-400 font-semibold text-sm">R${(a.price || 0).toFixed(2)}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}