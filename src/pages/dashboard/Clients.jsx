import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as db from '@/repositories/db';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Users, Phone, Mail, Pencil, Trash2, X, Calendar, DollarSign, Clock, ChevronRight, Cake } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import EmptyState from '@/components/dashboard/EmptyState';
import { ClientAvatar } from '@/components/dashboard/ClientSearch';
import { format, parseISO } from 'date-fns';

const defaultClient = { name: '', email: '', phone: '', notes: '', birthday: '' };

function ClientProfile({ client, appointments = [], onClose, onEdit }) {
  const clientApts = appointments
    .filter(a => (a.client_id === client.id || a.client_name === client.name) && a.status !== 'cancelled')
    .sort((a, b) => b.date > a.date ? 1 : -1);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 40, scale: 0.97 }}
        transition={{ type: 'spring', stiffness: 400, damping: 35 }}
        className="relative w-full max-w-md rounded-2xl z-10 overflow-hidden"
        style={{
          background: 'rgba(10,11,18,0.99)',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 40px 80px rgba(0,0,0,0.9)',
          backdropFilter: 'blur(24px)',
          maxHeight: '85vh',
        }}
      >
        {/* Header */}
        <div className="p-5 border-b border-white/5">
          <div className="flex items-start gap-3">
            <ClientAvatar client={client} size={52} />
            <div className="flex-1">
              <h2 className="text-white font-bold text-lg leading-tight">{client.name}</h2>
              {client.phone && <p className="text-white/40 text-sm flex items-center gap-1.5 mt-0.5"><Phone className="w-3 h-3" />{client.phone}</p>}
              {client.email && <p className="text-white/30 text-xs flex items-center gap-1.5 mt-0.5"><Mail className="w-3 h-3" />{client.email}</p>}
              {client.birthday && (
                <p className="text-yellow-400/60 text-xs flex items-center gap-1.5 mt-0.5">
                  <Cake className="w-3 h-3" />
                  {format(parseISO(client.birthday), "dd 'de' MMMM")}
                </p>
              )}
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => { onEdit(client); onClose(); }} className="w-8 h-8 rounded-lg hover:bg-white/5 flex items-center justify-center text-white/30 hover:text-white transition-colors">
                <Pencil className="w-3.5 h-3.5" />
              </button>
              <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-white/5 flex items-center justify-center text-white/30 hover:text-white transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2 mt-4">
            <div className="p-2.5 rounded-xl" style={{ background: 'rgba(79,142,247,0.08)', border: '1px solid rgba(79,142,247,0.15)' }}>
              <p className="text-blue-400 text-xs font-medium mb-0.5">Visitas</p>
              <p className="text-white font-bold text-lg">{clientApts.length}</p>
            </div>
            <div className="p-2.5 rounded-xl" style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.15)' }}>
              <p className="text-green-400 text-xs font-medium mb-0.5">Gasto</p>
              <p className="text-white font-bold text-lg">R${(client.total_spent || 0).toFixed(0)}</p>
            </div>
            <div className="p-2.5 rounded-xl" style={{ background: 'rgba(168,85,247,0.08)', border: '1px solid rgba(168,85,247,0.15)' }}>
              <p className="text-purple-400 text-xs font-medium mb-0.5">Última</p>
              <p className="text-white font-bold text-sm">{client.last_visit ? format(parseISO(client.last_visit), 'dd/MM') : '—'}</p>
            </div>
          </div>
        </div>

        {/* Appointment history */}
        <div className="overflow-y-auto" style={{ maxHeight: 320 }}>
          <div className="p-4">
            <p className="text-white/30 text-xs font-medium uppercase tracking-wide mb-3">Histórico</p>
            {clientApts.length === 0 ? (
              <p className="text-white/20 text-sm text-center py-6">Nenhum agendamento</p>
            ) : (
              <div className="space-y-2">
                {clientApts.map(apt => (
                  <div key={apt.id} className="flex items-center gap-3 p-2.5 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                      <Calendar className="w-3.5 h-3.5 text-blue-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-xs font-medium truncate">{apt.service_name}</p>
                      <p className="text-white/35 text-[11px]">
                        {format(parseISO(apt.date), 'dd/MM/yy')} às {apt.time}
                        {apt.employee_name && ` · ${apt.employee_name}`}
                      </p>
                    </div>
                    {apt.price > 0 && (
                      <span className="text-green-400 text-xs font-semibold flex-shrink-0">R${apt.price}</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {client.notes && (
            <div className="px-4 pb-4">
              <p className="text-white/30 text-xs font-medium uppercase tracking-wide mb-2">Observações</p>
              <p className="text-white/50 text-sm p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                {client.notes}
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

export default function Clients() {
  const { business } = useOutletContext();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(defaultClient);
  const [search, setSearch] = useState('');
  const [viewClient, setViewClient] = useState(null);

  const { data: clients = [] } = useQuery({
    queryKey: ['clients', business.id],
    queryFn: () => db.listClientsByBusiness(business.id),
  });

  const { data: appointments = [] } = useQuery({
    queryKey: ['appointments', business.id],
    queryFn: () => db.listAppointmentsByBusiness(business.id),
  });

  const createMutation = useMutation({
    mutationFn: (data) => db.createClient({ ...data, business_id: business.id }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['clients'] }); closeForm(); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => db.updateClient(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['clients'] }); closeForm(); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => db.deleteClient(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['clients'] }),
  });

  const openNew = () => { setEditing(null); setForm(defaultClient); setShowForm(true); };
  const openEdit = (c) => {
    setEditing(c);
    setForm({ name: c.name, email: c.email || '', phone: c.phone || '', notes: c.notes || '', birthday: c.birthday || '' });
    setShowForm(true);
  };
  const closeForm = () => { setShowForm(false); setEditing(null); };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editing) updateMutation.mutate({ id: editing.id, data: form });
    else createMutation.mutate(form);
  };

  const filtered = clients.filter(c =>
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase()) ||
    c.phone?.includes(search)
  );

  return (
    <div>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Clientes</h1>
          <p className="text-white/40 mt-1 text-sm">{clients.length} cliente{clients.length !== 1 ? 's' : ''} cadastrado{clients.length !== 1 ? 's' : ''}</p>
        </div>
        <Button onClick={openNew} className="gap-2 text-white rounded-xl h-9 px-4 font-medium" style={{ background: 'linear-gradient(135deg, #4F8EF7, #7B5EEA)' }}>
          <Plus className="w-4 h-4" /> Novo cliente
        </Button>
      </motion.div>

      {clients.length === 0 ? (
        <EmptyState icon={Users} title="Nenhum cliente" description="Adicione seu primeiro cliente para começar." actionLabel="Adicionar cliente" onAction={openNew} />
      ) : (
        <>
          <div className="relative mb-5">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25" />
            <Input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar por nome, telefone ou email..."
              className="pl-10 bg-white/[0.03] border-white/[0.07] text-white placeholder:text-white/25 rounded-xl h-10"
            />
          </div>

          <div className="space-y-1.5">
            <AnimatePresence>
              {filtered.map((c, i) => (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="flex items-center gap-3 p-3.5 rounded-xl border transition-all duration-200 group cursor-pointer hover:border-white/10"
                  style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}
                  onClick={() => setViewClient(c)}
                >
                  <ClientAvatar client={c} size={40} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-white font-medium text-sm">{c.name}</p>
                      {c.total_visits > 0 && (
                        <span className="text-xs px-1.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400">{c.total_visits}x</span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-0.5">
                      {c.phone && <span className="text-white/30 text-xs flex items-center gap-1"><Phone className="w-2.5 h-2.5" />{c.phone}</span>}
                      {c.email && <span className="text-white/25 text-xs truncate max-w-[140px]">{c.email}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={e => { e.stopPropagation(); openEdit(c); }} className="p-2 rounded-lg hover:bg-white/8 text-white/30 hover:text-white transition-colors">
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={e => { e.stopPropagation(); deleteMutation.mutate(c.id); }} className="p-2 rounded-lg hover:bg-red-500/10 text-white/30 hover:text-red-400 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <ChevronRight className="w-4 h-4 text-white/20 ml-1" />
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </>
      )}

      {/* Client profile modal */}
      <AnimatePresence>
        {viewClient && (
          <ClientProfile
            client={viewClient}
            appointments={appointments}
            onClose={() => setViewClient(null)}
            onEdit={openEdit}
          />
        )}
      </AnimatePresence>

      {/* Create / Edit dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="border-white/10 text-white max-w-md" style={{ background: 'rgba(10,11,18,0.99)', backdropFilter: 'blur(24px)' }}>
          <DialogHeader>
            <DialogTitle className="text-white">{editing ? 'Editar cliente' : 'Novo cliente'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            <div>
              <Label className="text-white/50 text-xs uppercase tracking-wide mb-1.5 block">Nome *</Label>
              <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required className="bg-white/5 border-white/10 text-white" placeholder="Nome completo" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-white/50 text-xs uppercase tracking-wide mb-1.5 block">Telefone / WhatsApp</Label>
                <Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className="bg-white/5 border-white/10 text-white" placeholder="(11) 99999-9999" />
              </div>
              <div>
                <Label className="text-white/50 text-xs uppercase tracking-wide mb-1.5 block">Aniversário</Label>
                <Input type="date" value={form.birthday} onChange={e => setForm(f => ({ ...f, birthday: e.target.value }))} className="bg-white/5 border-white/10 text-white" />
              </div>
            </div>
            <div>
              <Label className="text-white/50 text-xs uppercase tracking-wide mb-1.5 block">Email</Label>
              <Input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className="bg-white/5 border-white/10 text-white" placeholder="email@exemplo.com" />
            </div>
            <div>
              <Label className="text-white/50 text-xs uppercase tracking-wide mb-1.5 block">Observações</Label>
              <Textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} className="bg-white/5 border-white/10 text-white" placeholder="Alergias, preferências, pele sensível..." rows={3} />
            </div>
            <div className="flex gap-3 pt-1">
              <Button type="button" variant="outline" onClick={closeForm} className="flex-1 border-white/10 text-white/50 hover:bg-white/5 hover:text-white">Cancelar</Button>
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="flex-1 text-white font-medium" style={{ background: 'linear-gradient(135deg, #4F8EF7, #7B5EEA)' }}>
                {editing ? 'Salvar' : 'Criar cliente'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}