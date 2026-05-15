import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search } from 'lucide-react';

const COUNTRIES = [
  { code: 'BR', name: 'Brasil', dial: '+55', flag: '🇧🇷' },
  { code: 'US', name: 'Estados Unidos', dial: '+1', flag: '🇺🇸' },
  { code: 'PT', name: 'Portugal', dial: '+351', flag: '🇵🇹' },
  { code: 'AR', name: 'Argentina', dial: '+54', flag: '🇦🇷' },
  { code: 'MX', name: 'México', dial: '+52', flag: '🇲🇽' },
  { code: 'CO', name: 'Colômbia', dial: '+57', flag: '🇨🇴' },
  { code: 'CL', name: 'Chile', dial: '+56', flag: '🇨🇱' },
  { code: 'PE', name: 'Peru', dial: '+51', flag: '🇵🇪' },
  { code: 'UY', name: 'Uruguai', dial: '+598', flag: '🇺🇾' },
  { code: 'PY', name: 'Paraguai', dial: '+595', flag: '🇵🇾' },
  { code: 'BO', name: 'Bolívia', dial: '+591', flag: '🇧🇴' },
  { code: 'VE', name: 'Venezuela', dial: '+58', flag: '🇻🇪' },
  { code: 'EC', name: 'Equador', dial: '+593', flag: '🇪🇨' },
  { code: 'ES', name: 'Espanha', dial: '+34', flag: '🇪🇸' },
  { code: 'IT', name: 'Itália', dial: '+39', flag: '🇮🇹' },
  { code: 'FR', name: 'França', dial: '+33', flag: '🇫🇷' },
  { code: 'DE', name: 'Alemanha', dial: '+49', flag: '🇩🇪' },
  { code: 'GB', name: 'Reino Unido', dial: '+44', flag: '🇬🇧' },
  { code: 'JP', name: 'Japão', dial: '+81', flag: '🇯🇵' },
  { code: 'CN', name: 'China', dial: '+86', flag: '🇨🇳' },
  { code: 'AU', name: 'Austrália', dial: '+61', flag: '🇦🇺' },
  { code: 'CA', name: 'Canadá', dial: '+1', flag: '🇨🇦' },
  { code: 'ZA', name: 'África do Sul', dial: '+27', flag: '🇿🇦' },
  { code: 'NG', name: 'Nigéria', dial: '+234', flag: '🇳🇬' },
  { code: 'AO', name: 'Angola', dial: '+244', flag: '🇦🇴' },
  { code: 'MZ', name: 'Moçambique', dial: '+258', flag: '🇲🇿' },
];

export default function PhoneInput({ ddi = '+55', number = '', onChangeDdi, onChangeNumber, placeholder = '(11) 99999-9999' }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef(null);

  const selected = COUNTRIES.find(c => c.dial === ddi) || COUNTRIES[0];
  const filtered = COUNTRIES.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.dial.includes(search) ||
    c.code.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="flex gap-2" ref={ref}>
      {/* DDI Dropdown */}
      <div className="relative flex-shrink-0">
        <button
          type="button"
          onClick={() => { setOpen(!open); setSearch(''); }}
          className="h-9 px-3 rounded-xl flex items-center gap-1.5 text-sm transition-all hover:opacity-80"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)', color: 'rgba(255,255,255,0.85)' }}
        >
          <span className="text-base leading-none">{selected.flag}</span>
          <span className="text-xs text-white/50">{selected.dial}</span>
          <ChevronDown className="w-3 h-3 text-white/30" />
        </button>

        {open && (
          <div className="absolute left-0 top-full mt-1 w-64 rounded-2xl overflow-hidden z-50 shadow-2xl"
            style={{ background: '#141720', border: '1px solid rgba(255,255,255,0.08)' }}>
            {/* Search */}
            <div className="p-2 border-b border-white/[0.06]">
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{ background: 'rgba(255,255,255,0.05)' }}>
                <Search className="w-3.5 h-3.5 text-white/30 flex-shrink-0" />
                <input
                  autoFocus
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Buscar país..."
                  className="bg-transparent text-white/80 text-sm outline-none w-full placeholder:text-white/20"
                />
              </div>
            </div>
            {/* List */}
            <div className="max-h-52 overflow-y-auto">
              {filtered.map(c => (
                <button
                  key={c.code}
                  type="button"
                  onClick={() => { onChangeDdi(c.dial); setOpen(false); }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-white/5 transition-all"
                >
                  <span className="text-base">{c.flag}</span>
                  <span className="text-white/70 text-sm flex-1 truncate">{c.name}</span>
                  <span className="text-white/30 text-xs font-mono">{c.dial}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Number input */}
      <input
        type="tel"
        value={number}
        onChange={e => onChangeNumber(e.target.value)}
        placeholder={placeholder}
        className="flex-1 h-9 px-3 rounded-xl text-sm outline-none transition-all"
        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)', color: 'rgba(255,255,255,0.85)' }}
      />
    </div>
  );
}