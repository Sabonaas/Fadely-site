import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import * as db from '@/repositories/db';
import { motion, AnimatePresence } from 'framer-motion';
import { format, getMonth, getDate, parseISO } from 'date-fns';
import { Phone, Copy, MessageSquare, ExternalLink, Cake } from 'lucide-react';
import { ClientAvatar } from '@/components/dashboard/ClientSearch';
import EmptyState from '@/components/dashboard/EmptyState';
import WhatsAppModal from '@/components/dashboard/WhatsAppModal';

const today = new Date();
const todayMonth = getMonth(today);
const todayDay = getDate(today);

function isBirthdayToday(birthday) {
  if (!birthday) return false;
  const d = parseISO(birthday);
  return getMonth(d) === todayMonth && getDate(d) === todayDay;
}

function isBirthdayThisWeek(birthday) {
  if (!birthday) return false;
  const d = parseISO(birthday);
  const bMonth = getMonth(d);
  const bDay = getDate(d);
  for (let i = 0; i < 7; i++) {
    const check = new Date(today);
    check.setDate(today.getDate() + i);
    if (getMonth(check) === bMonth && getDate(check) === bDay) return true;
  }
  return false;
}

function isBirthdayThisMonth(birthday) {
  if (!birthday) return false;
  const d = parseISO(birthday);
  return getMonth(d) === todayMonth;
}

function ClientCard({ client, appointments = [] }) {
  const [whatsOpen, setWhatsOpen] = useState(false);
  const clientApts = appointments.filter(a => a.client_id === client.id || a.client_name === client.name);
  const lastApt = clientApts.sort((a, b) => b.date > a.date ? 1 : -1)[0];

  const copyPhone = () => {
    navigator.clipboard.writeText(client.phone || '');
  };

  const bdDate = client.birthday ? parseISO(client.birthday) : null;
  const age = bdDate ? today.getFullYear() - bdDate.getFullYear() : null;
  const isToday = isBirthdayToday(client.birthday);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative group p-4 rounded-2xl border transition-all duration-300"
        style={{
          background: isToday ? 'rgba(251,191,36,0.04)' : 'rgba(255,255,255,0.02)',
          border: isToday ? '1px solid rgba(251,191,36,0.2)' : '1px solid rgba(255,255,255,0.05)',
          boxShadow: isToday ? '0 0 30px rgba(251,191,36,0.06)' : 'none',
        }}
      >
        {isToday && (
          <div className="absolute -top-2 -right-2">
            <span className="text-lg animate-bounce">🎂</span>
          </div>
        )}

        <div className="flex items-start gap-3">
          <div className="relative">
            <ClientAvatar client={client} size={44} />
            {isToday && (
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-yellow-500/90 rounded-full flex items-center justify-center">
                <span className="text-[9px]">🎂</span>
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-white font-semibold text-sm">{client.name}</p>
              {age && <span className="text-xs px-1.5 py-0.5 rounded-full bg-white/5 text-white/40">{age} anos</span>}
            </div>

            {bdDate && (
              <p className="text-xs mt-0.5" style={{ color: isToday ? 'rgba(251,191,36,0.8)' : 'rgba(255,255,255,0.35)' }}>
                🎂 {format(bdDate, "dd 'de' MMMM")}
              </p>
            )}

            {client.phone && (
              <p className="text-white/30 text-xs mt-1 flex items-center gap-1">
                <Phone className="w-2.5 h-2.5" />{client.phone}
              </p>
            )}

            {lastApt && (
              <p className="text-white/25 text-[11px] mt-1">
                Último agendamento: {format(parseISO(lastApt.date), 'dd/MM/yy')} — {lastApt.service_name}
              </p>
            )}
          </div>
        </div>

        {/* Quick actions */}
        <div className="flex gap-1.5 mt-3 pt-3 border-t border-white/5">
          {client.phone && (
            <>
              <button
                onClick={() => setWhatsOpen(true)}
                className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium transition-all text-green-400 hover:bg-green-500/10 border border-green-500/20"
              >
                <MessageSquare className="w-3 h-3" /> WhatsApp
              </button>
              <button
                onClick={copyPhone}
                className="px-2.5 py-1.5 rounded-lg text-xs text-white/40 hover:text-white hover:bg-white/5 transition-all border border-white/5"
              >
                <Copy className="w-3 h-3" />
              </button>
            </>
          )}
        </div>
      </motion.div>

      <WhatsAppModal
        open={whatsOpen}
        onClose={() => setWhatsOpen(false)}
        client={client}
      />
    </>
  );
}

function Section({ title, clients, appointments, icon }) {
  if (clients.length === 0) return null;
  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-lg">{icon}</span>
        <h2 className="text-white font-semibold">{title}</h2>
        <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-white/40">{clients.length}</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {clients.map(c => <ClientCard key={c.id} client={c} appointments={appointments} />)}
      </div>
    </div>
  );
}

export default function Birthdays() {
  const { business } = useOutletContext();

  const { data: clients = [] } = useQuery({
    queryKey: ['clients', business.id],
    queryFn: () => db.listClientsByBusiness(business.id),
  });

  const { data: appointments = [] } = useQuery({
    queryKey: ['appointments', business.id],
    queryFn: () => db.listAppointmentsByBusiness(business.id),
  });

  const withBirthday = clients.filter(c => c.birthday);
  const todayBirthdays = withBirthday.filter(c => isBirthdayToday(c.birthday));
  const weekBirthdays = withBirthday.filter(c => !isBirthdayToday(c.birthday) && isBirthdayThisWeek(c.birthday));
  const monthBirthdays = withBirthday.filter(c => !isBirthdayToday(c.birthday) && !isBirthdayThisWeek(c.birthday) && isBirthdayThisMonth(c.birthday));

  const hasAny = todayBirthdays.length + weekBirthdays.length + monthBirthdays.length > 0;

  return (
    <div>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            🎂 Aniversariantes
          </h1>
          <p className="text-white/40 mt-1">{withBirthday.length} clientes com aniversário cadastrado</p>
        </div>
      </motion.div>

      {!hasAny ? (
        <EmptyState
          icon={Cake}
          title="Nenhum aniversariante"
          description="Cadastre datas de nascimento nos perfis dos clientes para ver aniversariantes aqui."
        />
      ) : (
        <>
          <Section title="Hoje" icon="🎉" clients={todayBirthdays} appointments={appointments} />
          <Section title="Esta semana" icon="📅" clients={weekBirthdays} appointments={appointments} />
          <Section title="Este mês" icon="🗓️" clients={monthBirthdays} appointments={appointments} />
        </>
      )}
    </div>
  );
}