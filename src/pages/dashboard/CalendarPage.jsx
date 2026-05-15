import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as db from '@/repositories/db';
import { motion, AnimatePresence } from 'framer-motion';
import { format, addDays, startOfWeek, isSameDay, subDays, parseISO, getMonth, getDate } from 'date-fns';
import { Plus, ChevronLeft, ChevronRight, Clock, Check, X, Cake, User, Scissors, Settings2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import ClientSearch from '@/components/dashboard/ClientSearch';
import ScheduleSettingsModal from '@/components/dashboard/ScheduleSettingsModal';
import { getAllSlots, getSlotsForDay, isDayOpen } from '@/lib/scheduleUtils';

const statusColors = {
  scheduled: { bg: 'rgba(79,142,247,0.15)', border: 'rgba(79,142,247,0.35)', text: '#7BB3FF', dot: '#4F8EF7', label: 'Agendado' },
  confirmed: { bg: 'rgba(34,197,94,0.12)', border: 'rgba(34,197,94,0.35)', text: '#4ade80', dot: '#22c55e', label: 'Confirmado' },
  completed: { bg: 'rgba(168,85,247,0.12)', border: 'rgba(168,85,247,0.35)', text: '#c084fc', dot: '#a855f7', label: 'Concluído' },
  in_progress: { bg: 'rgba(251,191,36,0.12)', border: 'rgba(251,191,36,0.35)', text: '#fbbf24', dot: '#f59e0b', label: 'Em andamento' },
  cancelled: { bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.2)', text: '#f87171', dot: '#ef4444', label: 'Cancelado' },
};

function isBirthdayToday(birthday, day) {
  if (!birthday) return false;
  try {
    const d = parseISO(birthday);
    return getMonth(d) === getMonth(day) && getDate(d) === getDate(day);
  } catch { return false; }
}

function CurrentTimeLine({ slots }) {
  const now = new Date();
  const nowMins = now.getHours() * 60 + now.getMinutes();
  if (!slots.length) return null;
  const [fH, fM] = slots[0].split(':').map(Number);
  const [lH, lM] = slots[slots.length - 1].split(':').map(Number);
  const startMins = fH * 60 + fM;
  const totalMins = lH * 60 + lM + 50 - startMins;
  const pct = ((nowMins - startMins) / totalMins) * 100;
  if (pct < 0 || pct > 100) return null;
  return (
    <div className="absolute left-0 right-0 pointer-events-none z-20" style={{ top: `${pct}%` }}>
      <div className="flex items-center">
        <div className="w-2 h-2 rounded-full bg-red-400 flex-shrink-0 -ml-1" />
        <div className="flex-1 h-px bg-red-400/50" />
      </div>
    </div>
  );
}

export default function CalendarPage() {
  const { business } = useOutletContext();
  const queryClient = useQueryClient();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showForm, setShowForm] = useState(false);
  const [selectedApt, setSelectedApt] = useState(null);
  const [viewMode, setViewMode] = useState('week'); // 'week' | 'day'
  const [form, setForm] = useState({
    client_name: '', client_phone: '', client_email: '',
    service_id: '', employee_id: '',
    date: format(new Date(), 'yyyy-MM-dd'), time: '09:00', notes: ''
  });

  const [showScheduleSettings, setShowScheduleSettings] = useState(false);
  const openTime = business?.working_hours?.open || '08:00';
  const closeTime = business?.working_hours?.close || '20:00';
  // Use new schedule_settings if available, else fallback to legacy open/close
  const timeSlots = getAllSlots(business?.schedule_settings, openTime, closeTime);

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekDays = viewMode === 'week'
    ? Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))
    : [currentDate];

  const { data: appointments = [] } = useQuery({
    queryKey: ['appointments', business.id],
    queryFn: () => db.listAppointmentsByBusiness(business.id),
    refetchInterval: 30000,
  });
  const { data: services = [] } = useQuery({
    queryKey: ['services', business.id],
    queryFn: () => db.listServicesByBusiness(business.id),
  });
  const { data: employees = [] } = useQuery({
    queryKey: ['employees', business.id],
    queryFn: () => db.listEmployeesByBusinessId(business.id),
  });
  const { data: clients = [] } = useQuery({
    queryKey: ['clients', business.id],
    queryFn: () => db.listClientsByBusiness(business.id),
  });
  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications', business.id],
    queryFn: () => db.listNotificationsByBusiness(business.id),
  });

  const createMutation = useMutation({
    mutationFn: (data) => db.createAppointment(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['appointments'] }); setShowForm(false); resetForm(); },
  });
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status, apt }) => {
      await db.updateAppointment(id, { status });
      if (status === 'confirmed' && apt) {
        const reminderExists = notifications.some(n => n.appointment_id === id && n.type === 'reminder');
        if (!reminderExists) {
          const reminderDate = subDays(parseISO(apt.date), 1);
          await db.createNotification({
            business_id: business.id, appointment_id: id,
            type: 'reminder', channel: 'whatsapp',
            recipient_phone: apt.client_phone || '', recipient_name: apt.client_name,
            message: `Olá ${apt.client_name}! Lembrando do agendamento amanhã (${format(parseISO(apt.date), 'dd/MM')}) às ${apt.time} para ${apt.service_name}. 💫`,
            status: 'pending', scheduled_for: `${format(reminderDate, 'yyyy-MM-dd')}T09:00:00`,
          });
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      setSelectedApt(null);
    },
  });

  const resetForm = () => setForm({
    client_name: '', client_phone: '', client_email: '',
    service_id: '', employee_id: '',
    date: format(new Date(), 'yyyy-MM-dd'), time: timeSlots[0] || '09:00', notes: ''
  });

  const handleClientSelect = (client, rawName) => {
    if (client) {
      setForm(f => ({ ...f, client_name: client.name, client_phone: client.phone || '', client_email: client.email || '', notes: client.notes || f.notes }));
    } else {
      setForm(f => ({ ...f, client_name: rawName || '' }));
    }
  };

  const handleCreate = (e) => {
    e.preventDefault();
    const service = services.find(s => s.id === form.service_id);
    const employee = employees.find(emp => emp.id === form.employee_id);
    createMutation.mutate({
      ...form, business_id: business.id,
      service_name: service?.name || '', employee_name: employee?.name || '',
      duration: service?.duration || 50, price: service?.price || 0,
      status: 'scheduled', source: 'manual',
    });
  };

  const navigate = (dir) => {
    const days = viewMode === 'week' ? 7 : 1;
    setCurrentDate(d => addDays(d, dir * days));
  };

  const dayNames = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

  return (
    <div className="space-y-4 min-h-0">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white">Calendário</h1>
          <p className="text-white/35 text-sm mt-0.5">
            {viewMode === 'week'
              ? `${format(weekStart, "d 'de' MMM")} — ${format(addDays(weekStart, 6), "d 'de' MMM, yyyy")}`
              : format(currentDate, "EEEE, d 'de' MMMM")
            }
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* View toggle */}
          <div className="flex rounded-xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)' }}>
            {['week', 'day'].map(v => (
              <button key={v} onClick={() => setViewMode(v)}
                className="px-3 py-1.5 text-xs font-medium transition-all"
                style={{
                  background: viewMode === v ? 'rgba(79,142,247,0.2)' : 'transparent',
                  color: viewMode === v ? '#7BB3FF' : 'rgba(255,255,255,0.4)',
                  borderRight: v === 'week' ? '1px solid rgba(255,255,255,0.06)' : 'none',
                }}>
                {v === 'week' ? 'Semana' : 'Dia'}
              </button>
            ))}
          </div>
          <button onClick={() => setCurrentDate(new Date())}
            className="px-3 py-1.5 rounded-xl text-xs font-medium text-white/50 hover:text-white transition-all"
            style={{ border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)' }}>
            Hoje
          </button>
          <div className="flex gap-1">
            <button onClick={() => navigate(-1)} className="w-8 h-8 rounded-xl flex items-center justify-center text-white/40 hover:text-white hover:bg-white/[0.05] transition-all"
              style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button onClick={() => navigate(1)} className="w-8 h-8 rounded-xl flex items-center justify-center text-white/40 hover:text-white hover:bg-white/[0.05] transition-all"
              style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <button
            onClick={() => setShowScheduleSettings(true)}
            className="flex items-center gap-1.5 h-8 px-3 rounded-xl text-white/50 hover:text-white text-xs font-medium transition-all"
            style={{ border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)' }}
          >
            <Settings2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Horários</span>
          </button>
          <button
            onClick={() => { resetForm(); setShowForm(true); }}
            className="flex items-center gap-1.5 h-8 px-4 rounded-xl text-white text-sm font-medium transition-all"
            style={{ background: 'linear-gradient(135deg, #4F8EF7, #7B5EEA)', boxShadow: '0 0 16px rgba(79,142,247,0.25)' }}
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Novo</span>
          </button>
        </div>
      </motion.div>

      {/* Calendar grid */}
      <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.015)', border: '1px solid rgba(255,255,255,0.06)' }}>
        {/* Day headers */}
        <div className={`grid border-b border-white/[0.06]`} style={{ gridTemplateColumns: `60px repeat(${weekDays.length}, 1fr)` }}>
          <div className="px-2 py-3" />
          {weekDays.map((day, i) => {
            const isToday = isSameDay(day, new Date());
            const dayBirthdays = clients.filter(c => isBirthdayToday(c.birthday, day));
            return (
              <div key={i} className={`p-2 text-center border-l border-white/[0.05] ${isToday ? 'bg-blue-500/[0.05]' : ''}`}>
                <p className="text-white/30 text-[10px] uppercase font-semibold tracking-wider">
                  {dayNames[i % 7]}
                </p>
                <div className={`text-lg font-bold mt-0.5 mx-auto w-8 h-8 flex items-center justify-center rounded-full transition-all ${
                  isToday ? 'bg-blue-500 text-white' : 'text-white/60'
                }`}>
                  {format(day, 'd')}
                </div>
                {dayBirthdays.length > 0 && (
                  <div className="mt-1 flex justify-center">
                    <span className="text-xs" title={dayBirthdays.map(c => c.name).join(', ')}>🎂</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Time grid */}
        <div className="relative overflow-y-auto" style={{ maxHeight: 'calc(100vh - 280px)', minHeight: '400px' }}>
          <div className={`grid relative`} style={{ gridTemplateColumns: `60px repeat(${weekDays.length}, 1fr)` }}>
            {/* Time labels */}
            <div className="relative">
              {timeSlots.map((slot, i) => (
                <div key={slot} className="h-16 flex items-start justify-end pr-3 pt-1">
                  <span className="text-white/20 text-[10px] font-medium">{slot}</span>
                </div>
              ))}
            </div>

            {/* Day columns */}
            {weekDays.map((day, dayIdx) => {
              const dayStr = format(day, 'yyyy-MM-dd');
              const dayAppts = appointments.filter(a => a.date === dayStr && a.status !== 'cancelled');
              const isToday = isSameDay(day, new Date());
              const daySlots = business?.schedule_settings?.week_schedule
                ? getSlotsForDay(business.schedule_settings, day, openTime, closeTime)
                : timeSlots;
              const closed = business?.schedule_settings?.week_schedule && daySlots.length === 0;

              return (
                <div key={dayIdx} className={`relative border-l border-white/[0.04] ${isToday ? 'bg-blue-500/[0.015]' : ''} ${closed ? 'bg-white/[0.008]' : ''}`}>
                  {/* Closed overlay */}
                  {closed && (
                    <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                      <span className="text-white/10 text-xs font-medium rotate-[-30deg] select-none">Fechado</span>
                    </div>
                  )}

                  {/* Current time line (only on today column) */}
                  {isToday && <CurrentTimeLine slots={timeSlots} />}

                  {/* Slot rows */}
                  {timeSlots.map((slot, slotIdx) => {
                    const slotAvailable = daySlots.includes(slot);
                    return (
                    <div key={slot}
                      className={`h-16 border-b border-white/[0.03] relative group transition-colors ${
                        slotAvailable && !closed
                          ? 'hover:bg-white/[0.01] cursor-pointer'
                          : 'opacity-30 cursor-not-allowed'
                      }`}
                      onClick={() => {
                        if (slotAvailable && !closed) {
                          setForm(f => ({ ...f, date: dayStr, time: slot }));
                          setShowForm(true);
                        }
                      }}
                    >
                      {slotAvailable && !closed && (
                        <div className="absolute inset-x-1 top-1 bottom-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                          style={{ background: 'rgba(79,142,247,0.04)', border: '1px dashed rgba(79,142,247,0.15)' }}>
                          <Plus className="w-3 h-3 text-blue-400/40" />
                        </div>
                      )}
                    </div>
                    );
                  })}

                  {/* Appointment overlays */}
                  {dayAppts.map(apt => {
                    const slotIdx = timeSlots.indexOf(apt.time);
                    if (slotIdx === -1) return null;
                    const colors = statusColors[apt.status] || statusColors.scheduled;
                    const durationSlots = Math.max(1, Math.ceil((apt.duration || 50) / 50));

                    return (
                      <motion.button
                        key={apt.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        whileHover={{ scale: 1.02, zIndex: 30 }}
                        onClick={e => { e.stopPropagation(); setSelectedApt(apt); }}
                        className="absolute left-1 right-1 rounded-xl text-left overflow-hidden z-10 transition-shadow"
                        style={{
                          top: `${slotIdx * 64 + 4}px`,
                          height: `${durationSlots * 64 - 8}px`,
                          background: colors.bg,
                          border: `1px solid ${colors.border}`,
                          boxShadow: `0 2px 8px ${colors.dot}20`,
                        }}
                      >
                        <div className="p-2 h-full flex flex-col">
                          <div className="flex items-center gap-1 mb-0.5">
                            <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: colors.dot }} />
                            <p className="text-[9px] font-bold" style={{ color: colors.text }}>{apt.time}</p>
                          </div>
                          <p className="text-white text-[10px] font-semibold truncate leading-tight">{apt.client_name}</p>
                          {durationSlots > 1 && (
                            <p className="text-white/35 text-[9px] truncate mt-0.5">{apt.service_name}</p>
                          )}
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Schedule Settings Modal */}
      <AnimatePresence>
        {showScheduleSettings && (
          <ScheduleSettingsModal
            business={business}
            onClose={() => setShowScheduleSettings(false)}
          />
        )}
      </AnimatePresence>

      {/* Appointment detail modal */}
      <AnimatePresence>
        {selectedApt && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/70" style={{ backdropFilter: 'blur(6px)' }}
              onClick={() => setSelectedApt(null)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 24 }}
              transition={{ type: 'spring', stiffness: 380, damping: 35 }}
              className="relative w-full max-w-sm rounded-2xl z-10 p-6"
              style={{ background: 'rgba(10,11,18,0.99)', border: '1px solid rgba(255,255,255,0.09)', boxShadow: '0 40px 80px rgba(0,0,0,0.8)', backdropFilter: 'blur(24px)' }}
            >
              {/* Status accent bar */}
              <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl"
                style={{ background: (statusColors[selectedApt.status] || statusColors.scheduled).dot }} />

              <div className="flex items-start justify-between mb-4">
                <div className="flex-1 min-w-0">
                  <p className="text-white font-bold text-lg truncate">{selectedApt.client_name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                      style={{
                        background: (statusColors[selectedApt.status] || statusColors.scheduled).bg,
                        color: (statusColors[selectedApt.status] || statusColors.scheduled).text,
                        border: `1px solid ${(statusColors[selectedApt.status] || statusColors.scheduled).border}`,
                      }}>
                      {(statusColors[selectedApt.status] || statusColors.scheduled).label}
                    </span>
                    {selectedApt.price > 0 && (
                      <span className="text-green-400 text-sm font-semibold">R$ {selectedApt.price?.toFixed(2)}</span>
                    )}
                  </div>
                </div>
                <button onClick={() => setSelectedApt(null)} className="w-7 h-7 rounded-lg flex items-center justify-center text-white/25 hover:text-white hover:bg-white/5 transition-all flex-shrink-0">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2.5 mb-5">
                <InfoRow icon={Scissors} label={selectedApt.service_name} />
                <InfoRow icon={Clock} label={`${format(parseISO(selectedApt.date), 'dd/MM/yyyy')} às ${selectedApt.time}`} />
                {selectedApt.employee_name && <InfoRow icon={User} label={selectedApt.employee_name} sub="Profissional" />}
                {selectedApt.client_phone && (
                  <a href={`https://wa.me/55${selectedApt.client_phone.replace(/\D/g, '')}`} target="_blank" rel="noreferrer"
                    className="flex items-center gap-2 text-green-400 hover:text-green-300 text-sm transition-colors">
                    <span className="text-lg">📱</span> {selectedApt.client_phone}
                  </a>
                )}
                {selectedApt.notes && (
                  <div className="p-3 rounded-xl text-xs text-white/40" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                    {selectedApt.notes}
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                {selectedApt.status === 'scheduled' && (
                  <button
                    onClick={() => updateStatusMutation.mutate({ id: selectedApt.id, status: 'confirmed', apt: selectedApt })}
                    className="flex-1 h-9 rounded-xl text-sm font-medium flex items-center justify-center gap-1.5 transition-all hover:opacity-90"
                    style={{ background: 'rgba(34,197,94,0.15)', color: '#4ade80', border: '1px solid rgba(34,197,94,0.25)' }}
                  >
                    <Check className="w-3.5 h-3.5" /> Confirmar
                  </button>
                )}
                {['scheduled', 'confirmed'].includes(selectedApt.status) && (
                  <button
                    onClick={() => updateStatusMutation.mutate({ id: selectedApt.id, status: 'completed', apt: selectedApt })}
                    className="flex-1 h-9 rounded-xl text-sm font-medium flex items-center justify-center gap-1.5 transition-all hover:opacity-90"
                    style={{ background: 'rgba(79,142,247,0.15)', color: '#7BB3FF', border: '1px solid rgba(79,142,247,0.25)' }}
                  >
                    Concluído
                  </button>
                )}
                <button
                  onClick={() => updateStatusMutation.mutate({ id: selectedApt.id, status: 'cancelled', apt: selectedApt })}
                  className="h-9 px-3 rounded-xl text-sm flex items-center justify-center transition-all hover:opacity-90"
                  style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)' }}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* New Appointment Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="border-white/10 text-white max-w-md" style={{ background: 'rgba(10,11,18,0.99)', backdropFilter: 'blur(24px)' }}>
          <DialogHeader>
            <DialogTitle className="text-white text-lg">Novo Agendamento</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4 mt-2">
            <div>
              <Label className="text-white/40 text-xs font-medium uppercase tracking-wide mb-1.5 block">Cliente</Label>
              <ClientSearch clients={clients} value={form.client_name} onChange={handleClientSelect} onNewClient={(name) => setForm(f => ({ ...f, client_name: name || '' }))} />
            </div>
            <div>
              <Label className="text-white/40 text-xs font-medium uppercase tracking-wide mb-1.5 block">Telefone / WhatsApp</Label>
              <Input value={form.client_phone} onChange={e => setForm(f => ({ ...f, client_phone: e.target.value }))} className="bg-white/5 border-white/10 text-white placeholder:text-white/25" placeholder="(11) 99999-9999" />
            </div>
            <div>
              <Label className="text-white/40 text-xs font-medium uppercase tracking-wide mb-1.5 block">Serviço</Label>
              <Select value={form.service_id} onValueChange={v => setForm(f => ({ ...f, service_id: v }))}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white"><SelectValue placeholder="Selecionar serviço" /></SelectTrigger>
                <SelectContent style={{ background: 'rgba(14,15,22,0.98)', border: '1px solid rgba(255,255,255,0.09)' }}>
                  {services.map(s => (
                    <SelectItem key={s.id} value={s.id} className="text-white focus:bg-white/5">
                      {s.name} — R${s.price?.toFixed(2)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {employees.length > 0 && (
              <div>
                <Label className="text-white/40 text-xs font-medium uppercase tracking-wide mb-1.5 block">Profissional</Label>
                <Select value={form.employee_id} onValueChange={v => setForm(f => ({ ...f, employee_id: v }))}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white"><SelectValue placeholder="Selecionar profissional" /></SelectTrigger>
                  <SelectContent style={{ background: 'rgba(14,15,22,0.98)', border: '1px solid rgba(255,255,255,0.09)' }}>
                    {employees.map(emp => <SelectItem key={emp.id} value={emp.id} className="text-white focus:bg-white/5">{emp.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-white/40 text-xs font-medium uppercase tracking-wide mb-1.5 block">Data</Label>
                <Input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} required className="bg-white/5 border-white/10 text-white" />
              </div>
              <div>
                <Label className="text-white/40 text-xs font-medium uppercase tracking-wide mb-1.5 block">Horário</Label>
                <Select value={form.time} onValueChange={v => setForm(f => ({ ...f, time: v }))}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white"><SelectValue /></SelectTrigger>
                  <SelectContent style={{ background: 'rgba(14,15,22,0.98)', border: '1px solid rgba(255,255,255,0.09)' }} className="max-h-48">
                    {timeSlots.map(t => <SelectItem key={t} value={t} className="text-white focus:bg-white/5">{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label className="text-white/40 text-xs font-medium uppercase tracking-wide mb-1.5 block">Observações</Label>
              <Textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} className="bg-white/5 border-white/10 text-white placeholder:text-white/25" placeholder="Alergias, preferências..." rows={2} />
            </div>
            <div className="flex gap-3 pt-1">
              <button type="button" onClick={() => setShowForm(false)}
                className="flex-1 h-10 rounded-xl text-sm text-white/40 hover:text-white hover:bg-white/5 transition-all border border-white/8">
                Cancelar
              </button>
              <button type="submit" disabled={createMutation.isPending}
                className="flex-1 h-10 rounded-xl text-sm font-medium text-white transition-all disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg, #4F8EF7, #7B5EEA)' }}>
                {createMutation.isPending ? 'Criando...' : 'Criar Agendamento'}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// eslint-disable-next-line no-unused-vars
function InfoRow({ icon: Icon, label, sub }) {
  return (
    <div className="flex items-center gap-2.5">
      <Icon className="w-3.5 h-3.5 text-white/25 flex-shrink-0" />
      <div className="min-w-0">
        {sub && <p className="text-white/25 text-[10px]">{sub}</p>}
        <p className="text-white/60 text-sm truncate">{label}</p>
      </div>
    </div>
  );
}