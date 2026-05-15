import { useOutletContext } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import * as db from '@/repositories/db';
import { motion } from 'framer-motion';
import { Bell, MessageSquare, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import EmptyState from '@/components/dashboard/EmptyState';
import { format } from 'date-fns';

const typeIcons = {
  confirmation: CheckCircle,
  reminder: Clock,
  reschedule: Bell,
  cancellation: AlertCircle,
  follow_up: MessageSquare,
};

const statusColors = {
  pending: 'bg-yellow-500/10 text-yellow-400',
  sent: 'bg-green-500/10 text-green-400',
  delivered: 'bg-blue-500/10 text-blue-400',
  failed: 'bg-red-500/10 text-red-400',
};

export default function Notifications() {
  const { business } = useOutletContext();

  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications', business.id],
    queryFn: () => db.listNotificationsByBusiness(business.id),
  });

  return (
    <div>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-8">
        <h1 className="text-2xl font-bold text-white">Notificações</h1>
        <p className="text-white/40 mt-1">Histórico de mensagens WhatsApp</p>
      </motion.div>

      {notifications.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="Sem notificações ainda"
          description="As notificações aparecerão aqui quando mensagens e lembretes forem enviados via WhatsApp."
        />
      ) : (
        <div className="space-y-2">
          {notifications.map((n, i) => {
            const Icon = typeIcons[n.type] || Bell;
            return (
              <motion.div
                key={n.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="flex items-start gap-4 p-4 rounded-xl border border-white/5 bg-white/[0.02]"
              >
                <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4 text-white/50" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-white text-sm font-medium capitalize">{n.type?.replace('_', ' ')}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[n.status] || 'bg-white/5 text-white/40'}`}>
                      {n.status}
                    </span>
                  </div>
                  <p className="text-white/40 text-xs">{n.recipient_name} — {n.recipient_phone}</p>
                  {n.message && <p className="text-white/30 text-xs mt-1 line-clamp-2">{n.message}</p>}
                </div>
                <span className="text-white/20 text-xs shrink-0">
                  {n.created_at ? format(new Date(n.created_at), 'MMM d, HH:mm') : ''}
                </span>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}