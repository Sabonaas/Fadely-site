import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import * as db from '@/repositories/db';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Check, ArrowLeft, MapPin, Phone, Calendar, User, Star, Sparkles, ChevronRight } from 'lucide-react';
import { format, addDays, startOfToday } from 'date-fns';
import { getSlotsForDay, isDayOpen } from '@/lib/scheduleUtils';

function Avatar({ src, name, size = 48 }) {
  const initials = (name || 'A').split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase();
  if (src) return <img src={src} alt={name} className="rounded-full object-cover flex-shrink-0" style={{ width: size, height: size }} />;
  return (
    <div className="rounded-full flex items-center justify-center text-white font-bold flex-shrink-0"
      style={{ width: size, height: size, fontSize: size * 0.35, background: 'linear-gradient(135deg, #4F8EF7 0%, #7B5EEA 100%)' }}>
      {initials}
    </div>
  );
}

function StepDots({ total, current }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {Array.from({ length: total }).map((_, i) => (
        <motion.div
          key={i}
          animate={{ width: i === current ? 24 : 6, background: i <= current ? '#4F8EF7' : 'rgba(255,255,255,0.15)' }}
          transition={{ duration: 0.3 }}
          className="h-1.5 rounded-full"
        />
      ))}
    </div>
  );
}

export default function PublicBooking() {
  const { slug } = useParams();
  const [business, setBusiness] = useState(null);
  const [services, setServices] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(0);
  const [booked, setBooked] = useState(false);
  const [booking, setBooking] = useState({
    service_id: '', employee_id: '', date: '', time: '',
    client_name: '', client_phone: '', client_email: '', notes: ''
  });

  useEffect(() => {
    const load = async () => {
      const businesses = [];
      const b = await db.getBusinessBySlugForPublic(slug);
      if (b) businesses.push(b);
      if (businesses.length > 0) {
        const biz = businesses[0];
        setBusiness(biz);
        const [svcs, emps] = await Promise.all([
          db.listServicesByBusiness(biz.id, { activeOnly: true }),
          db.listEmployeesByBusinessId(biz.id).then((list) => list.filter((e) => e.is_active !== false)),
        ]);
        setServices(svcs);
        setEmployees(emps);
      }
      setLoading(false);
    };
    load();
  }, [slug]);

  const selectedService = services.find(s => s.id === booking.service_id);
  const selectedEmployee = employees.find(e => e.id === booking.employee_id);
  // Generate next 14 days, filtering out closed days if schedule is configured
  const next14Days = Array.from({ length: 21 }, (_, i) => addDays(startOfToday(), i + 1))
    .filter(d => isDayOpen(business?.schedule_settings, d))
    .slice(0, 14);
  const totalSteps = 5;

  const getTimeSlotsForDate = (dateStr) => {
    if (!dateStr || !business) return [];
    const d = new Date(dateStr + 'T00:00:00');
    const fallbackOpen = business.working_hours?.open || '08:00';
    const fallbackClose = business.working_hours?.close || '20:00';
    return getSlotsForDay(business.schedule_settings, d, fallbackOpen, fallbackClose);
  };

  const handleBook = async () => {
    const service = services.find(s => s.id === booking.service_id);
    const employee = employees.find(e => e.id === booking.employee_id);

    let clientId = null;
    if (booking.client_name && business) {
      const existingClients = await db.listClientsByBusiness(business.id);
      const existing = existingClients.find(c => c.phone === booking.client_phone || c.email === booking.client_email);
      if (existing) {
        clientId = existing.id;
      } else {
        const newClient = await db.createClient({
          name: booking.client_name, phone: booking.client_phone,
          email: booking.client_email, business_id: business.id, notes: booking.notes,
        });
        clientId = newClient.id;
      }
    }

    await db.createAppointment({
      business_id: business.id, service_id: booking.service_id,
      service_name: service?.name || '', employee_id: booking.employee_id,
      employee_name: employee?.name || '', client_id: clientId,
      client_name: booking.client_name, client_phone: booking.client_phone,
      client_email: booking.client_email, date: booking.date, time: booking.time,
      duration: service?.duration || 30, price: service?.price || 0,
      status: 'scheduled', notes: booking.notes, source: 'booking_page',
    });

    await db.createNotification({
      business_id: business.id, type: 'confirmation', channel: 'whatsapp',
      recipient_phone: booking.client_phone, recipient_name: booking.client_name,
      message: `Olá ${booking.client_name}! Seu agendamento para ${service?.name} em ${format(new Date(booking.date), 'dd/MM')} às ${booking.time} foi confirmado.`,
      status: 'pending',
    });

    setBooked(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#06070D] flex items-center justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
          className="w-8 h-8 border-2 border-white/10 border-t-blue-500 rounded-full" />
      </div>
    );
  }

  if (!business) {
    return (
      <div className="min-h-screen bg-[#06070D] flex items-center justify-center text-center p-6">
        <div>
          <p className="text-6xl mb-4">🔍</p>
          <h1 className="text-2xl font-bold text-white mb-2">Página não encontrada</h1>
          <p className="text-white/40">Este link de agendamento não existe.</p>
        </div>
      </div>
    );
  }

  // SUCCESS screen
  if (booked) {
    return (
      <div className="min-h-screen bg-[#06070D] flex items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-green-500/4 rounded-full blur-3xl" />
        </div>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-sm w-full text-center relative z-10">
          {/* Check animation */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.1 }}
            className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{ background: 'rgba(34,197,94,0.12)', border: '2px solid rgba(34,197,94,0.25)', boxShadow: '0 0 40px rgba(34,197,94,0.15)' }}
          >
            <Check className="w-12 h-12 text-green-400" strokeWidth={2.5} />
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <h2 className="text-3xl font-bold text-white mb-2">Confirmado! 🎉</h2>
            <p className="text-white/40 mb-8">Seu agendamento foi realizado com sucesso.</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="rounded-2xl p-5 text-left mb-6"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
          >
            <div className="space-y-3">
              <Row label="Estabelecimento" value={business.name} />
              <Row label="Serviço" value={selectedService?.name} />
              {selectedEmployee && <Row label="Profissional" value={selectedEmployee.name} />}
              <Row label="Data" value={booking.date && format(new Date(booking.date + 'T00:00:00'), "dd/MM/yyyy")} />
              <Row label="Horário" value={booking.time} />
              {selectedService?.price > 0 && <Row label="Valor" value={`R$ ${selectedService.price.toFixed(2)}`} highlight />}
              {business.address && <Row label="Endereço" value={business.address} />}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="flex gap-2">
            {business.phone && (
              <a
                href={`https://wa.me/55${business.phone.replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 h-12 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold transition-all"
                style={{ background: 'rgba(37,211,102,0.15)', border: '1px solid rgba(37,211,102,0.25)', color: '#25D366' }}
              >
                <Phone className="w-4 h-4" /> WhatsApp
              </a>
            )}
            <button
              onClick={() => { setBooked(false); setStep(0); setBooking({ service_id: '', employee_id: '', date: '', time: '', client_name: '', client_phone: '', client_email: '', notes: '' }); }}
              className="flex-1 h-12 rounded-xl flex items-center justify-center gap-2 text-sm font-medium text-white/50 hover:text-white border border-white/8 hover:border-white/15 transition-all"
            >
              Novo agendamento
            </button>
          </motion.div>

          <p className="text-white/15 text-xs mt-8">Powered by <span className="text-white/25">Fadely</span></p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#06070D] relative overflow-hidden">
      {/* Ambient background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-blue-600/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-purple-600/4 rounded-full blur-3xl" />
      </div>

      <div className="max-w-lg mx-auto relative z-10 px-5 py-10">
        {/* Business Hero */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          {business.logo_url ? (
            <img src={business.logo_url} alt={business.name} className="w-20 h-20 rounded-2xl object-cover mx-auto mb-4 border border-white/10" />
          ) : (
            <div className="w-20 h-20 rounded-2xl mx-auto mb-4 flex items-center justify-center text-3xl font-bold text-white"
              style={{ background: 'linear-gradient(135deg, #4F8EF7, #7B5EEA)', boxShadow: '0 0 40px rgba(79,142,247,0.25)' }}>
              {business.name?.[0]}
            </div>
          )}
          <h1 className="text-2xl font-bold text-white mb-1">{business.name}</h1>
          {business.address && (
            <p className="text-white/35 text-sm flex items-center justify-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" />{business.address}
            </p>
          )}
          {business.phone && (
            <p className="text-white/25 text-xs flex items-center justify-center gap-1.5 mt-1">
              <Phone className="w-3 h-3" />{business.phone}
            </p>
          )}
        </motion.div>

        {/* Step dots */}
        <StepDots total={totalSteps} current={step} />

        {/* Steps */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* STEP 0 — Service */}
            {step === 0 && (
              <div>
                <StepHeader icon={<Sparkles className="w-4 h-4" />} title="Escolha o serviço" subtitle="Selecione o serviço desejado" />
                <div className="space-y-2.5">
                  {services.map(s => (
                    <motion.button
                      key={s.id}
                      whileHover={{ scale: 1.01, y: -1 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => { setBooking(b => ({ ...b, service_id: s.id })); setStep(1); }}
                      className="w-full text-left p-4 rounded-2xl border transition-all duration-200"
                      style={{
                        background: booking.service_id === s.id ? 'rgba(79,142,247,0.1)' : 'rgba(255,255,255,0.025)',
                        border: booking.service_id === s.id ? '1px solid rgba(79,142,247,0.4)' : '1px solid rgba(255,255,255,0.06)',
                        boxShadow: booking.service_id === s.id ? '0 0 20px rgba(79,142,247,0.1)' : 'none',
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-white font-semibold text-sm">{s.name}</p>
                          {s.description && <p className="text-white/35 text-xs mt-0.5 line-clamp-1">{s.description}</p>}
                          <div className="flex items-center gap-3 mt-2">
                            <span className="text-white/40 text-xs flex items-center gap-1.5">
                              <Clock className="w-3 h-3" />{s.duration} min
                            </span>
                            <span className="text-blue-400 font-semibold text-sm">R$ {s.price?.toFixed(2)}</span>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-white/20 flex-shrink-0 ml-3" />
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 1 — Professional */}
            {step === 1 && (
              <div>
                <StepHeader icon={<User className="w-4 h-4" />} title="Escolha o profissional" subtitle="Selecione quem vai te atender" />
                <div className="space-y-2.5">
                  {employees.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-white/40 text-sm mb-4">Sem preferência — qualquer disponível</p>
                      <PrimaryButton onClick={() => { setBooking(b => ({ ...b, employee_id: '' })); setStep(2); }}>Continuar</PrimaryButton>
                    </div>
                  ) : (
                    employees.map(emp => (
                      <motion.button
                        key={emp.id}
                        whileHover={{ scale: 1.01, y: -1 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={() => { setBooking(b => ({ ...b, employee_id: emp.id })); setStep(2); }}
                        className="w-full text-left p-4 rounded-2xl border transition-all duration-200"
                        style={{
                          background: booking.employee_id === emp.id ? 'rgba(79,142,247,0.1)' : 'rgba(255,255,255,0.025)',
                          border: booking.employee_id === emp.id ? '1px solid rgba(79,142,247,0.4)' : '1px solid rgba(255,255,255,0.06)',
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <Avatar src={emp.avatar_url} name={emp.name} size={44} />
                          <div className="flex-1">
                            <p className="text-white font-semibold text-sm">{emp.name}</p>
                            {emp.role && <p className="text-white/40 text-xs mt-0.5">{emp.role}</p>}
                          </div>
                          <ChevronRight className="w-4 h-4 text-white/20" />
                        </div>
                      </motion.button>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* STEP 2 — Date & Time */}
            {step === 2 && (
              <div>
                <StepHeader icon={<Calendar className="w-4 h-4" />} title="Data e horário" subtitle="Quando você prefere?" />
                <div className="mb-6">
                  <p className="text-white/35 text-xs font-medium uppercase tracking-wide mb-3">Selecione a data</p>
                  <div className="grid grid-cols-7 gap-1.5">
                    {next14Days.slice(0, 14).map(day => {
                      const dayStr = format(day, 'yyyy-MM-dd');
                      const selected = booking.date === dayStr;
                      return (
                        <motion.button
                          key={dayStr}
                          whileTap={{ scale: 0.93 }}
                          onClick={() => setBooking(b => ({ ...b, date: dayStr, time: '' }))}
                          className="flex flex-col items-center p-2 rounded-xl transition-all duration-200"
                          style={{
                            background: selected ? 'rgba(79,142,247,0.15)' : 'rgba(255,255,255,0.03)',
                            border: selected ? '1px solid rgba(79,142,247,0.45)' : '1px solid rgba(255,255,255,0.06)',
                            boxShadow: selected ? '0 0 16px rgba(79,142,247,0.15)' : 'none',
                          }}
                        >
                          <span className="text-white/30 text-[9px] uppercase font-semibold">{format(day, 'EEE')}</span>
                          <span className={`text-base font-bold mt-0.5 ${selected ? 'text-blue-400' : 'text-white/70'}`}>{format(day, 'd')}</span>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>

                {booking.date && (
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                    <p className="text-white/35 text-xs font-medium uppercase tracking-wide mb-3">Selecione o horário</p>
                    <div className="grid grid-cols-4 gap-2">
                      {getTimeSlotsForDate(booking.date).map(t => {
                        const selected = booking.time === t;
                        return (
                          <motion.button
                            key={t}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => { setBooking(b => ({ ...b, time: t })); setStep(3); }}
                            className="py-2.5 rounded-xl text-sm font-medium transition-all duration-200"
                            style={{
                              background: selected ? 'rgba(79,142,247,0.15)' : 'rgba(255,255,255,0.035)',
                              border: selected ? '1px solid rgba(79,142,247,0.45)' : '1px solid rgba(255,255,255,0.06)',
                              color: selected ? '#7BB3FF' : 'rgba(255,255,255,0.55)',
                            }}
                          >
                            {t}
                          </motion.button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </div>
            )}

            {/* STEP 3 — Client info */}
            {step === 3 && (
              <div>
                <StepHeader icon={<User className="w-4 h-4" />} title="Seus dados" subtitle="Para confirmar seu agendamento" />
                <div className="space-y-3">
                  <FloatingInput label="Seu nome *" value={booking.client_name} onChange={v => setBooking(b => ({ ...b, client_name: v }))} placeholder="Nome completo" />
                  <FloatingInput label="Telefone / WhatsApp *" value={booking.client_phone} onChange={v => setBooking(b => ({ ...b, client_phone: v }))} placeholder="(11) 99999-9999" />
                  <FloatingInput label="Email (opcional)" value={booking.client_email} onChange={v => setBooking(b => ({ ...b, client_email: v }))} placeholder="email@exemplo.com" type="email" />
                  <div>
                    <label className="text-white/40 text-xs font-medium uppercase tracking-wide mb-1.5 block">
                      Observações (alergias, preferências...)
                    </label>
                    <textarea
                      value={booking.notes}
                      onChange={e => setBooking(b => ({ ...b, notes: e.target.value }))}
                      placeholder="Ex: pele sensível, alergia a amônia..."
                      rows={3}
                      className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder:text-white/20 resize-none focus:outline-none transition-colors"
                      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                      onFocus={e => e.target.style.borderColor = 'rgba(79,142,247,0.4)'}
                      onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
                    />
                  </div>
                  <PrimaryButton onClick={() => setStep(4)} disabled={!booking.client_name || !booking.client_phone}>
                    Revisar agendamento
                  </PrimaryButton>
                </div>
              </div>
            )}

            {/* STEP 4 — Confirm */}
            {step === 4 && (
              <div>
                <StepHeader icon={<Check className="w-4 h-4" />} title="Confirmar agendamento" subtitle="Revise os detalhes antes de confirmar" />
                <div className="rounded-2xl p-5 mb-5 space-y-3" style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)' }}>
                  <Row label="Serviço" value={selectedService?.name} />
                  {selectedEmployee && <Row label="Profissional" value={selectedEmployee.name} />}
                  <Row label="Data" value={booking.date && format(new Date(booking.date + 'T00:00:00'), "dd/MM/yyyy")} />
                  <Row label="Horário" value={booking.time} />
                  <Row label="Duração" value={`${selectedService?.duration} min`} />
                  {selectedService?.price > 0 && <Row label="Valor" value={`R$ ${selectedService.price.toFixed(2)}`} highlight />}
                  <div className="border-t border-white/5 pt-3">
                    <Row label="Nome" value={booking.client_name} />
                    <Row label="Telefone" value={booking.client_phone} />
                  </div>
                </div>

                <p className="text-white/25 text-xs text-center mb-4">Pagamento realizado presencialmente no estabelecimento.</p>

                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleBook}
                  className="w-full h-14 rounded-2xl font-semibold text-base text-white flex items-center justify-center gap-2 transition-all"
                  style={{
                    background: 'linear-gradient(135deg, #4F8EF7 0%, #7B5EEA 100%)',
                    boxShadow: '0 0 40px rgba(79,142,247,0.3), 0 8px 32px rgba(0,0,0,0.4)',
                  }}
                >
                  <Sparkles className="w-4 h-4" /> Confirmar agendamento
                </motion.button>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Back button */}
        {step > 0 && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={() => setStep(s => s - 1)}
            className="flex items-center gap-1.5 text-white/25 text-sm mt-6 hover:text-white/50 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Voltar
          </motion.button>
        )}

        <p className="text-center text-white/15 text-xs mt-10">
          Powered by <span className="text-white/25 font-medium">Fadely</span>
        </p>
      </div>
    </div>
  );
}

// Helper components
function StepHeader({ icon, title, subtitle }) {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-7 h-7 rounded-lg bg-blue-500/15 flex items-center justify-center text-blue-400">{icon}</div>
        <h2 className="text-white font-bold text-xl">{title}</h2>
      </div>
      <p className="text-white/35 text-sm">{subtitle}</p>
    </div>
  );
}

function Row({ label, value, highlight }) {
  return (
    <div className="flex items-center justify-between py-0.5">
      <span className="text-white/35 text-sm">{label}</span>
      <span className={`text-sm font-medium ${highlight ? 'text-green-400 font-semibold' : 'text-white'}`}>{value}</span>
    </div>
  );
}

function PrimaryButton({ onClick, disabled, children }) {
  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.01 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      onClick={onClick}
      disabled={disabled}
      className="w-full h-12 rounded-xl font-semibold text-white text-sm mt-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
      style={{ background: 'linear-gradient(135deg, #4F8EF7, #7B5EEA)', boxShadow: disabled ? 'none' : '0 0 24px rgba(79,142,247,0.25)' }}
    >
      {children}
    </motion.button>
  );
}

function FloatingInput({ label, value, onChange, placeholder, type = 'text' }) {
  return (
    <div>
      <label className="text-white/40 text-xs font-medium uppercase tracking-wide mb-1.5 block">{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder:text-white/20 focus:outline-none transition-colors"
        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
        onFocus={e => e.target.style.borderColor = 'rgba(79,142,247,0.4)'}
        onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
      />
    </div>
  );
}