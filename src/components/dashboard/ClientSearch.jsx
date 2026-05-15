import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, Phone, Clock, User } from 'lucide-react';
import { format, parseISO } from 'date-fns';

function ClientAvatar({ client, size = 32 }) {
  const initials = (client?.name || 'C').split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase();
  if (client?.avatar_url) {
    return <img src={client.avatar_url} alt={client.name} className="rounded-full object-cover flex-shrink-0" style={{ width: size, height: size }} />;
  }
  return (
    <div className="rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0"
      style={{ width: size, height: size, fontSize: size * 0.35, background: 'linear-gradient(135deg, #4F8EF7 0%, #7B5EEA 100%)' }}>
      {initials}
    </div>
  );
}

export default function ClientSearch({ clients = [], value, onChange, onNewClient }) {
  const [query, setQuery] = useState(value || '');
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const inputRef = useRef(null);
  const containerRef = useRef(null);

  const filtered = query.length >= 1
    ? clients.filter(c =>
        c.name?.toLowerCase().includes(query.toLowerCase()) ||
        c.phone?.includes(query) ||
        c.email?.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 6)
    : [];

  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const selectClient = (client) => {
    setSelected(client);
    setQuery(client.name);
    setOpen(false);
    onChange(client);
  };

  const handleInput = (e) => {
    const val = e.target.value;
    setQuery(val);
    setSelected(null);
    onChange(null, val);
    setOpen(val.length >= 1);
  };

  const handleClear = () => {
    setQuery('');
    setSelected(null);
    onChange(null, '');
    inputRef.current?.focus();
    setOpen(false);
  };

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        {selected ? (
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl border bg-white/5 border-white/10 cursor-pointer" onClick={handleClear}>
            <ClientAvatar client={selected} size={22} />
            <span className="text-white text-sm flex-1">{selected.name}</span>
            <span className="text-white/30 text-xs">×</span>
          </div>
        ) : (
          <>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30 pointer-events-none" />
            <input
              ref={inputRef}
              value={query}
              onChange={handleInput}
              onFocus={() => query.length >= 1 && setOpen(true)}
              placeholder="Buscar cliente..."
              className="w-full pl-9 pr-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-blue-500/50 transition-colors"
            />
          </>
        )}
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 top-full mt-1.5 w-full rounded-xl overflow-hidden"
            style={{
              background: 'rgba(14,15,22,0.98)',
              border: '1px solid rgba(255,255,255,0.09)',
              boxShadow: '0 20px 40px rgba(0,0,0,0.7)',
              backdropFilter: 'blur(24px)',
            }}
          >
            {filtered.length > 0 ? (
              <div className="p-1.5 space-y-0.5">
                {filtered.map(client => (
                  <button
                    key={client.id}
                    onMouseDown={() => selectClient(client)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/5 transition-colors text-left"
                  >
                    <ClientAvatar client={client} size={32} />
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate">{client.name}</p>
                      <div className="flex items-center gap-3 mt-0.5">
                        {client.phone && (
                          <span className="text-white/35 text-xs flex items-center gap-1">
                            <Phone className="w-2.5 h-2.5" />{client.phone}
                          </span>
                        )}
                        {client.last_visit && (
                          <span className="text-white/35 text-xs flex items-center gap-1">
                            <Clock className="w-2.5 h-2.5" />
                            {format(parseISO(client.last_visit), 'dd/MM/yy')}
                          </span>
                        )}
                      </div>
                    </div>
                    {client.total_visits > 0 && (
                      <span className="text-xs px-2 py-0.5 rounded-full text-blue-400 bg-blue-500/10 flex-shrink-0">
                        {client.total_visits}x
                      </span>
                    )}
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-2" />
            )}

            <div
              className="border-t p-1.5"
              style={{ borderColor: 'rgba(255,255,255,0.06)' }}
            >
              <button
                onMouseDown={() => { setOpen(false); onNewClient && onNewClient(query); }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors text-left"
              >
                <div className="w-8 h-8 rounded-full bg-blue-500/15 flex items-center justify-center flex-shrink-0">
                  <Plus className="w-3.5 h-3.5 text-blue-400" />
                </div>
                <div>
                  <p className="text-blue-400 text-sm font-medium">Novo cliente</p>
                  {query && <p className="text-white/30 text-xs">Criar "{query}"</p>}
                </div>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export { ClientAvatar };