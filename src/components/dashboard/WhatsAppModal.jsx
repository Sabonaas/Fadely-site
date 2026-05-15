import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, MessageSquare } from 'lucide-react';

const templates = [
  {
    label: '🎂 Aniversário',
    text: (name) => `Olá ${name}! 🎂🎉 A equipe da ${'{nome do salão}'} deseja a você um feliz aniversário! Que esse dia seja muito especial. Temos um presente especial esperando por você — venha nos visitar!`,
  },
  {
    label: '💫 Promoção',
    text: (name) => `Olá ${name}! Temos uma oferta exclusiva para você esse mês. Entre em contato e saiba mais! ✨`,
  },
  {
    label: '📅 Lembrete',
    text: (name) => `Olá ${name}! Gostaríamos de lembrá-lo(a) de agendar sua próxima visita. Já faz um tempo que não te vemos! 😊`,
  },
  {
    label: '⭐ Casual',
    text: (name) => `Oi ${name}! Tudo bem? Passando para dar um oi e dizer que estamos com horários disponíveis para você esta semana. 🙌`,
  },
];

export default function WhatsAppModal({ open, onClose, client }) {
  const [message, setMessage] = useState('');

  const handleTemplate = (tpl) => {
    setMessage(tpl.text(client?.name || 'cliente'));
  };

  const handleSend = () => {
    if (!client?.phone || !message) return;
    const phone = client.phone.replace(/\D/g, '');
    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/55${phone}?text=${encoded}`, '_blank');
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4" onClick={(e) => e.target === e.currentTarget && onClose()}>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 400, damping: 35 }}
            className="relative w-full max-w-md rounded-2xl z-10"
            style={{
              background: 'rgba(12,13,20,0.98)',
              border: '1px solid rgba(255,255,255,0.09)',
              boxShadow: '0 32px 64px rgba(0,0,0,0.8)',
              backdropFilter: 'blur(24px)',
            }}
          >
            <div className="flex items-center justify-between p-5 border-b border-white/5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-green-500/15 flex items-center justify-center">
                  <MessageSquare className="w-4 h-4 text-green-400" />
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">WhatsApp</p>
                  <p className="text-white/35 text-xs">{client?.name} · {client?.phone}</p>
                </div>
              </div>
              <button onClick={onClose} className="w-7 h-7 rounded-lg hover:bg-white/5 flex items-center justify-center text-white/30 hover:text-white transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {/* Templates */}
              <div>
                <p className="text-white/40 text-xs mb-2.5 font-medium uppercase tracking-wide">Templates rápidos</p>
                <div className="grid grid-cols-2 gap-1.5">
                  {templates.map((tpl, i) => (
                    <button
                      key={i}
                      onClick={() => handleTemplate(tpl)}
                      className="text-left px-3 py-2 rounded-xl text-xs font-medium text-white/60 hover:text-white transition-all"
                      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
                    >
                      {tpl.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Message textarea */}
              <div>
                <p className="text-white/40 text-xs mb-2 font-medium uppercase tracking-wide">Mensagem</p>
                <textarea
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder="Digite sua mensagem personalizada..."
                  rows={5}
                  className="w-full px-3.5 py-3 rounded-xl text-sm text-white placeholder:text-white/25 resize-none focus:outline-none transition-colors"
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                  }}
                  onFocus={e => e.target.style.borderColor = 'rgba(79,142,247,0.4)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
                />
                <p className="text-white/20 text-xs mt-1.5 text-right">{message.length} caracteres</p>
              </div>

              <button
                onClick={handleSend}
                disabled={!message.trim() || !client?.phone}
                className="w-full h-11 rounded-xl flex items-center justify-center gap-2 font-semibold text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                style={{
                  background: message.trim() ? 'linear-gradient(135deg, #25D366, #128C7E)' : 'rgba(255,255,255,0.05)',
                  color: message.trim() ? 'white' : 'rgba(255,255,255,0.3)',
                }}
              >
                <Send className="w-4 h-4" /> Abrir no WhatsApp
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}