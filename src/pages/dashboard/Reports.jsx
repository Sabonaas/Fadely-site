import { useOutletContext } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import * as db from '@/repositories/db';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Users, Clock } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import StatCard from '@/components/dashboard/StatCard';
import EmptyState from '@/components/dashboard/EmptyState';

export default function Reports() {
  const { business } = useOutletContext();

  const { data: appointments = [] } = useQuery({
    queryKey: ['appointments', business.id],
    queryFn: () => db.listAppointmentsByBusiness(business.id),
  });

  const { data: services = [] } = useQuery({
    queryKey: ['services', business.id],
    queryFn: () => db.listServicesByBusiness(business.id),
  });

  if (appointments.length === 0) {
    return (
      <div>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-8">
          <h1 className="text-2xl font-bold text-white">Relatórios</h1>
        </motion.div>
        <EmptyState icon={BarChart3} title="Sem dados ainda" description="Os relatórios aparecerão assim que você tiver dados de agendamento." />
      </div>
    );
  }

  // Service popularity
  const serviceCount = {};
  appointments.forEach(a => {
    if (a.service_name) serviceCount[a.service_name] = (serviceCount[a.service_name] || 0) + 1;
  });
  const serviceData = Object.entries(serviceCount).map(([name, count]) => ({ name: name.length > 12 ? name.slice(0, 12) + '...' : name, count })).sort((a, b) => b.count - a.count).slice(0, 6);

  const completed = appointments.filter(a => a.status === 'completed').length;
  const cancelled = appointments.filter(a => a.status === 'cancelled').length;
  const noShow = appointments.filter(a => a.status === 'no_show').length;
  const completionRate = appointments.length > 0 ? Math.round((completed / appointments.length) * 100) : 0;

  return (
    <div>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-8">
        <h1 className="text-2xl font-bold text-white">Relatórios</h1>
        <p className="text-white/40 mt-1">Analytics de performance</p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={BarChart3} title="Total Agendamentos" value={appointments.length} delay={0} />
        <StatCard icon={TrendingUp} title="Taxa Conclusão" value={`${completionRate}%`} delay={0.05} />
        <StatCard icon={Users} title="Cancelados" value={cancelled} delay={0.1} />
        <StatCard icon={Clock} title="Não Compareceu" value={noShow} delay={0.15} />
      </div>

      {serviceData.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="rounded-2xl border border-white/5 bg-white/[0.02] p-6">
          <h2 className="text-lg font-semibold text-white mb-6">Serviços Mais Populares</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={serviceData}>
              <XAxis dataKey="name" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: '#1a1d24', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }} />
              <Bar dataKey="count" fill="#4F8EF7" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      )}
    </div>
  );
}