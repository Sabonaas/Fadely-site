import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Trash2, Clock, Settings2, Save } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import * as db from '@/repositories/db';
import { toast } from 'sonner';

const DAY_LABELS = [
  { key: 'sunday', label: 'Domingo' },
  { key: 'monday', label: 'Segunda-feira' },
  { key: 'tuesday', label: 'Terça-feira' },
  { key: 'wednesday', label: 'Quarta-feira' },
  { key: 'thursday', label: 'Quinta-feira' },
  { key: 'friday', label: 'Sexta-feira' },
  { key: 'saturday', label: 'Sábado' },
];

const INTERVAL_OPTIONS = [
  { value: 10, label: '10 minutos' },
  { value: 15, label: '15 minutos' },
  { value: 20, label: '20 minutos' },
  { value: 30, label: '30 minutos' },
  { value: 40, label: '40 minutos' },
  { value: 45, label: '45 minutos' },
  { value: 60, label: '1 hora' },
  { value: 120, label: '2 horas' },
  { value: 180, label: '3 horas' },
  { value: 240, label: '4 horas' },
  { value: 0, label: 'Outro valor' },
];

const timeOptions = [];
for (let h = 0; h < 24; h++) {
  for (let m = 0; m < 60; m += 30) {
    timeOptions.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
  }
}

function buildInitialWeekSchedule(existing) {
  const base = {};
  for (const d of DAY_LABELS) {
    base[d.key] = existing?.[d.key] || [];
  }
  return base;
}

export default function ScheduleSettingsModal({ business, onClose }) {
  const queryClient = useQueryClient();
  const existing = business.schedule_settings || {};
  const existingInterval = existing.interval || 30;
  const isCustom = !INTERVAL_OPTIONS.find(o => o.value === existingInterval && o.value !== 0);

  const [intervalValue, setIntervalValue] = useState(isCustom ? 0 : existingInterval);
  const [customInterval, setCustomInterval] = useState(isCustom ? String(existingInterval) : '');
  const [weekSchedule, setWeekSchedule] = useState(buildInitialWeekSchedule(existing.week_schedule));

  const saveMutation = useMutation({
    mutationFn: (data) => db.updateBusiness(business.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-business'] });
      toast.success('Horários salvos com sucesso!');
      onClose();
    },
  });

  const getInterval = () => intervalValue === 0 ? (parseInt(customInterval) || 30) : intervalValue;

  const addPeriod = (dayKey) => {
    setWeekSchedule(ws => ({
      ...ws,
      [dayKey]: [...(ws[dayKey] || []), { start: '08:00', end: '18:00' }],
    }));
  };

  const removePeriod = (dayKey, idx) => {
    setWeekSchedule(ws => ({
      ...ws,
      [dayKey]: ws[dayKey].filter((_, i) => i !== idx),
    }));
  };

  const updatePeriod = (dayKey, idx, field, value) => {
    setWeekSchedule(ws => ({
      ...ws,
      [dayKey]: ws[dayKey].map((p, i) => i === idx ? { ...p, [field]: value } : p),
    }));
  };

  const handleSave = () => {
    saveMutation.mutate({
      schedule_settings: {
        interval: getInterval(),
        week_schedule: weekSchedule,
      },
    });
  };

  const selectStyle = {
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.09)',
    color: 'white',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/70"
        style={{ backdropFilter: 'blur(8px)' }}
        onClick={onClose}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.93, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.93, y: 24 }}
        transition={{ type: 'spring', stiffness: 380, damping: 35 }}
        className="relative w-full max-w-2xl rounded-2xl z-10 overflow-hidden flex flex-col"
        style={{
          background: 'rgba(10,11,18,0.99)',
          border: '1px solid rgba(255,255,255,0.09)',
          boxShadow: '0 40px 80px rgba(0,0,0,0.85)',
          maxHeight: '90vh',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/[0.06]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-500/15 flex items-center justify-center">
              <Settings2 className="w-4.5 h-4.5 text-blue-400" />
            </div>
            <div>
              <h2 className="text-white font-bold text-base">Configuração de Horários</h2>
              <p className="text-white/35 text-xs mt-0.5">Defina o intervalo e os dias de atendimento</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl flex items-center justify-center text-white/30 hover:text-white hover:bg-white/5 transition-all">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-6">

          {/* Interval */}
          <div className="rounded-xl p-4 space-y-3" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="flex items-center gap-2 mb-1">
              <Clock className="w-4 h-4 text-blue-400" />
              <p className="text-white text-sm font-semibold">Intervalo do Calendário</p>
            </div>
            <select
              value={intervalValue}
              onChange={e => setIntervalValue(Number(e.target.value))}
              className="w-full h-10 px-3 rounded-xl text-sm focus:outline-none"
              style={selectStyle}
            >
              {INTERVAL_OPTIONS.map(o => (
                <option key={o.value} value={o.value} style={{ background: '#1a1b20' }}>{o.label}</option>
              ))}
            </select>
            <AnimatePresence>
              {intervalValue === 0 && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                  <input
                    type="number"
                    min="5"
                    max="480"
                    value={customInterval}
                    onChange={e => setCustomInterval(e.target.value)}
                    placeholder="Digite o intervalo em minutos"
                    className="w-full h-10 px-3 rounded-xl text-sm text-white focus:outline-none mt-2"
                    style={selectStyle}
                  />
                </motion.div>
              )}
            </AnimatePresence>
            <p className="text-white/25 text-xs">Define o espaçamento entre horários no calendário e na página de agendamento.</p>
          </div>

          {/* Weekly schedule */}
          <div className="space-y-3">
            <p className="text-white text-sm font-semibold flex items-center gap-2">
              <span className="w-4 h-4 rounded bg-purple-500/20 inline-flex items-center justify-center text-purple-400 text-[10px]">◆</span>
              Horários por Dia da Semana
            </p>

            {DAY_LABELS.map(({ key, label }) => {
              const periods = weekSchedule[key] || [];
              const isOpen = periods.length > 0;
              return (
                <div key={key} className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.02)', border: `1px solid ${isOpen ? 'rgba(79,142,247,0.15)' : 'rgba(255,255,255,0.05)'}` }}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-2 h-2 rounded-full ${isOpen ? 'bg-green-400' : 'bg-white/15'}`} />
                      <span className="text-white text-sm font-medium">{label}</span>
                      {!isOpen && <span className="text-white/25 text-xs">Sem atendimento</span>}
                    </div>
                    <button
                      onClick={() => addPeriod(key)}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium text-blue-400 hover:bg-blue-500/10 transition-all"
                      style={{ border: '1px solid rgba(79,142,247,0.25)' }}
                    >
                      <Plus className="w-3 h-3" /> Adicionar horário
                    </button>
                  </div>

                  <AnimatePresence>
                    {periods.map((period, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, height: 0, marginTop: 0 }}
                        className="flex items-center gap-2 mt-2"
                      >
                        <select
                          value={period.start}
                          onChange={e => updatePeriod(key, idx, 'start', e.target.value)}
                          className="flex-1 h-9 px-2 rounded-lg text-sm focus:outline-none"
                          style={selectStyle}
                        >
                          {timeOptions.map(t => <option key={t} value={t} style={{ background: '#1a1b20' }}>{t}</option>)}
                        </select>
                        <span className="text-white/30 text-xs flex-shrink-0">→</span>
                        <select
                          value={period.end}
                          onChange={e => updatePeriod(key, idx, 'end', e.target.value)}
                          className="flex-1 h-9 px-2 rounded-lg text-sm focus:outline-none"
                          style={selectStyle}
                        >
                          {timeOptions.map(t => <option key={t} value={t} style={{ background: '#1a1b20' }}>{t}</option>)}
                        </select>
                        <button
                          onClick={() => removePeriod(key, idx)}
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-white/25 hover:text-red-400 hover:bg-red-500/10 transition-all flex-shrink-0"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-white/[0.06] flex gap-3">
          <button onClick={onClose} className="flex-1 h-10 rounded-xl text-sm text-white/40 hover:text-white hover:bg-white/5 transition-all border border-white/8">
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={saveMutation.isPending}
            className="flex-1 h-10 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, #4F8EF7, #7B5EEA)', boxShadow: '0 0 20px rgba(79,142,247,0.25)' }}
          >
            {saveMutation.isPending ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <><Save className="w-4 h-4" /> Salvar Horários</>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
}