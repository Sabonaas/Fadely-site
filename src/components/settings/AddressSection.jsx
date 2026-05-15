import { useState } from 'react';
import { MapPin, Navigation, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const COUNTRIES_LIST = ['Brasil', 'Portugal', 'Estados Unidos', 'Argentina', 'México', 'Espanha', 'Itália', 'França', 'Alemanha', 'Reino Unido', 'Outros'];

const BR_STATES = ['AC','AL','AM','AP','BA','CE','DF','ES','GO','MA','MG','MS','MT','PA','PB','PE','PI','PR','RJ','RN','RO','RR','RS','SC','SE','SP','TO'];

export default function AddressSection({ form, onChange }) {
  const [locating, setLocating] = useState(false); // idle | locating | done
  const [locPhase, setLocPhase] = useState(0);

  const inputCls = "w-full h-9 px-3 rounded-xl text-sm outline-none transition-all placeholder:text-white/20 text-white/85";
  const inputStyle = { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)' };

  const handleLocate = () => {
    if (!navigator.geolocation) return;
    setLocating(true);
    setLocPhase(1);

    // Animate through phases
    setTimeout(() => setLocPhase(2), 2000);
    setTimeout(() => setLocPhase(3), 4000);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        onChange('address_lat', latitude);
        onChange('address_lng', longitude);

        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`);
          const data = await res.json();
          const a = data.address || {};
          onChange('address', a.road || a.street || '');
          onChange('address_neighborhood', a.suburb || a.neighbourhood || a.quarter || '');
          onChange('address_city', a.city || a.town || a.village || '');
          onChange('address_state', a.state_code || a.state || '');
          onChange('address_country', a.country || 'Brasil');
          onChange('address_zip', a.postcode || '');
        } catch {}

        setTimeout(() => setLocating(false), 1200);
      },
      () => setLocating(false)
    );
  };

  const phaseText = ['', 'Localizando estabelecimento…', 'Identificando endereço…', 'Confirmando equipe presente…'];

  return (
    <div className="space-y-4">
      {/* Cinematic location button */}
      <div className="relative">
        <AnimatePresence>
          {locating && (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="absolute inset-0 z-10 rounded-2xl overflow-hidden flex flex-col items-center justify-center gap-3"
              style={{ background: 'rgba(8,10,18,0.97)', border: '1px solid rgba(79,142,247,0.2)', backdropFilter: 'blur(16px)' }}
            >
              {/* Pulsing rings */}
              <div className="relative flex items-center justify-center">
                <motion.div
                  animate={{ scale: [1, 2.2], opacity: [0.35, 0] }}
                  transition={{ duration: 1.8, repeat: Infinity }}
                  className="absolute w-10 h-10 rounded-full"
                  style={{ background: 'rgba(79,142,247,0.3)' }}
                />
                <motion.div
                  animate={{ scale: [1, 1.7], opacity: [0.2, 0] }}
                  transition={{ duration: 1.8, repeat: Infinity, delay: 0.4 }}
                  className="absolute w-10 h-10 rounded-full"
                  style={{ background: 'rgba(79,142,247,0.2)' }}
                />
                <div className="w-10 h-10 rounded-full flex items-center justify-center z-10"
                  style={{ background: 'linear-gradient(135deg, #4F8EF7, #7B5EEA)', boxShadow: '0 0 20px rgba(79,142,247,0.5)' }}>
                  <MapPin className="w-5 h-5 text-white" />
                </div>
              </div>

              <motion.p
                key={locPhase}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-white/70 text-xs font-medium text-center"
              >
                {phaseText[locPhase]}
              </motion.p>

              {/* Progress bar */}
              <div className="w-32 h-0.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: 'linear-gradient(90deg, #4F8EF7, #7B5EEA)' }}
                  initial={{ width: '0%' }}
                  animate={{ width: locPhase === 1 ? '40%' : locPhase === 2 ? '75%' : '100%' }}
                  transition={{ duration: 1.5, ease: 'easeInOut' }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          type="button"
          onClick={handleLocate}
          disabled={locating}
          className="w-full h-10 rounded-xl flex items-center justify-center gap-2 text-sm font-medium transition-all disabled:opacity-60"
          style={{ background: 'rgba(79,142,247,0.1)', border: '1px solid rgba(79,142,247,0.2)', color: '#7BB3FF' }}
        >
          {locating ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Navigation className="w-4 h-4" />
          )}
          Carregar localização automática
        </button>
      </div>

      {/* Country */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-white/35 text-xs uppercase tracking-wide mb-1.5 block font-medium">País</label>
          <select
            value={form.address_country || 'Brasil'}
            onChange={e => onChange('address_country', e.target.value)}
            className={inputCls} style={{ ...inputStyle, height: '36px' }}
          >
            {COUNTRIES_LIST.map(c => <option key={c} value={c} style={{ background: '#1a1b20' }}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="text-white/35 text-xs uppercase tracking-wide mb-1.5 block font-medium">Estado</label>
          {form.address_country === 'Brasil' || !form.address_country ? (
            <select
              value={form.address_state || ''}
              onChange={e => onChange('address_state', e.target.value)}
              className={inputCls} style={{ ...inputStyle, height: '36px' }}
            >
              <option value="" style={{ background: '#1a1b20' }}>Selecione</option>
              {BR_STATES.map(s => <option key={s} value={s} style={{ background: '#1a1b20' }}>{s}</option>)}
            </select>
          ) : (
            <input
              type="text"
              value={form.address_state || ''}
              onChange={e => onChange('address_state', e.target.value)}
              placeholder="Estado"
              className={inputCls} style={inputStyle}
            />
          )}
        </div>
      </div>

      {/* City + ZIP */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-white/35 text-xs uppercase tracking-wide mb-1.5 block font-medium">Cidade</label>
          <input type="text" value={form.address_city || ''} onChange={e => onChange('address_city', e.target.value)}
            placeholder="São Paulo" className={inputCls} style={inputStyle} />
        </div>
        <div>
          <label className="text-white/35 text-xs uppercase tracking-wide mb-1.5 block font-medium">CEP</label>
          <input type="text" value={form.address_zip || ''} onChange={e => onChange('address_zip', e.target.value)}
            placeholder="00000-000" className={inputCls} style={inputStyle} />
        </div>
      </div>

      {/* Street + Number */}
      <div className="grid grid-cols-3 gap-3">
        <div className="col-span-2">
          <label className="text-white/35 text-xs uppercase tracking-wide mb-1.5 block font-medium">Endereço</label>
          <input type="text" value={form.address || ''} onChange={e => onChange('address', e.target.value)}
            placeholder="Rua das Flores" className={inputCls} style={inputStyle} />
        </div>
        <div>
          <label className="text-white/35 text-xs uppercase tracking-wide mb-1.5 block font-medium">Número</label>
          <input type="text" value={form.address_number || ''} onChange={e => onChange('address_number', e.target.value)}
            placeholder="123" className={inputCls} style={inputStyle} />
        </div>
      </div>

      {/* Complement + Neighborhood */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-white/35 text-xs uppercase tracking-wide mb-1.5 block font-medium">Complemento</label>
          <input type="text" value={form.address_complement || ''} onChange={e => onChange('address_complement', e.target.value)}
            placeholder="Apto 12, Sala 3..." className={inputCls} style={inputStyle} />
        </div>
        <div>
          <label className="text-white/35 text-xs uppercase tracking-wide mb-1.5 block font-medium">Bairro</label>
          <input type="text" value={form.address_neighborhood || ''} onChange={e => onChange('address_neighborhood', e.target.value)}
            placeholder="Centro" className={inputCls} style={inputStyle} />
        </div>
      </div>
    </div>
  );
}