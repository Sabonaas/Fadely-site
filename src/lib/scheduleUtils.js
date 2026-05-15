/**
 * Fadely Schedule Utilities
 * Gera slots de horário baseado no schedule_settings do Business.
 */

const DAY_KEYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

/**
 * Dado um schedule_settings e um Date, retorna os slots disponíveis para aquele dia.
 * Fallback para open/close se não tiver week_schedule configurado.
 */
export function getSlotsForDay(scheduleSettings, date, fallbackOpen = '08:00', fallbackClose = '20:00') {
  const interval = scheduleSettings?.interval || 30;
  const weekSchedule = scheduleSettings?.week_schedule;
  const dayKey = DAY_KEYS[date.getDay()];

  let periods = [];

  if (weekSchedule && weekSchedule[dayKey] !== undefined) {
    periods = weekSchedule[dayKey] || [];
  } else if (weekSchedule) {
    // Dia não configurado = sem atendimento
    periods = [];
  } else {
    // Fallback: usar open/close antigo
    periods = [{ start: fallbackOpen, end: fallbackClose }];
  }

  if (periods.length === 0) return [];

  const slots = [];
  for (const period of periods) {
    const [sh, sm] = period.start.split(':').map(Number);
    const [eh, em] = period.end.split(':').map(Number);
    let cur = sh * 60 + sm;
    const end = eh * 60 + em;
    while (cur < end) {
      const h = Math.floor(cur / 60);
      const m = cur % 60;
      slots.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
      cur += interval;
    }
  }
  return slots;
}

/**
 * Retorna todos os slots únicos do estabelecimento (para o calendário sem data específica).
 * Usa todos os dias configurados para calcular o range total.
 */
export function getAllSlots(scheduleSettings, fallbackOpen = '08:00', fallbackClose = '20:00') {
  const interval = scheduleSettings?.interval || 30;
  const weekSchedule = scheduleSettings?.week_schedule;

  if (!weekSchedule) {
    return generateRange(fallbackOpen, fallbackClose, interval);
  }

  // Coletar todos os horários de início e fim para determinar o range total
  let minMins = 24 * 60;
  let maxMins = 0;
  let hasPeriods = false;

  for (const dayKey of DAY_KEYS) {
    const periods = weekSchedule[dayKey] || [];
    for (const p of periods) {
      hasPeriods = true;
      const [sh, sm] = p.start.split(':').map(Number);
      const [eh, em] = p.end.split(':').map(Number);
      minMins = Math.min(minMins, sh * 60 + sm);
      maxMins = Math.max(maxMins, eh * 60 + em);
    }
  }

  if (!hasPeriods) return generateRange(fallbackOpen, fallbackClose, interval);

  const startH = String(Math.floor(minMins / 60)).padStart(2, '0');
  const startM = String(minMins % 60).padStart(2, '0');
  const endH = String(Math.floor(maxMins / 60)).padStart(2, '0');
  const endM = String(maxMins % 60).padStart(2, '0');
  return generateRange(`${startH}:${startM}`, `${endH}:${endM}`, interval);
}

function generateRange(open, close, interval) {
  const [oh, om] = open.split(':').map(Number);
  const [ch, cm] = close.split(':').map(Number);
  let cur = oh * 60 + om;
  const end = ch * 60 + cm;
  const slots = [];
  while (cur < end) {
    slots.push(`${String(Math.floor(cur / 60)).padStart(2, '0')}:${String(cur % 60).padStart(2, '0')}`);
    cur += interval;
  }
  return slots;
}

export function isDayOpen(scheduleSettings, date) {
  const weekSchedule = scheduleSettings?.week_schedule;
  if (!weekSchedule) return true;
  const dayKey = DAY_KEYS[date.getDay()];
  return (weekSchedule[dayKey]?.length || 0) > 0;
}

export { DAY_KEYS };