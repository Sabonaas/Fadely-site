import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as db from '@/repositories/db';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Pencil, Trash2, Scissors, Clock, DollarSign, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import EmptyState from '@/components/dashboard/EmptyState';

const defaultService = { name: '', description: '', price: '', duration: 30, category: '', is_active: true, color: '#4F8EF7' };

export default function Services() {
  const { business } = useOutletContext();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(defaultService);

  const { data: services = [], isLoading } = useQuery({
    queryKey: ['services', business.id],
    queryFn: () => db.listServicesByBusiness(business.id),
  });

  const createMutation = useMutation({
    mutationFn: (data) => db.createService({ ...data, business_id: business.id }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['services'] }); closeForm(); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => db.updateService(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['services'] }); closeForm(); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => db.deleteService(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['services'] }),
  });

  const openNew = () => { setEditing(null); setForm(defaultService); setShowForm(true); };
  const openEdit = (s) => { setEditing(s); setForm({ name: s.name, description: s.description || '', price: s.price, duration: s.duration, category: s.category || '', is_active: s.is_active !== false, color: s.color || '#4F8EF7' }); setShowForm(true); };
  const closeForm = () => { setShowForm(false); setEditing(null); setForm(defaultService); };

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = { ...form, price: parseFloat(form.price), duration: parseInt(form.duration) };
    if (editing) {
      updateMutation.mutate({ id: editing.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  return (
    <div>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Serviços</h1>
          <p className="text-white/40 mt-1">{services.length} serviço{services.length !== 1 ? 's' : ''}</p>
        </div>
        <Button onClick={openNew} className="bg-blue-500 hover:bg-blue-600 text-white rounded-xl gap-2">
          <Plus className="w-4 h-4" /> Adicionar
        </Button>
      </motion.div>

      {services.length === 0 && !isLoading ? (
        <EmptyState
          icon={Scissors}
          title="Nenhum serviço ainda"
          description="Crie seu primeiro serviço para começar a receber agendamentos."
          actionLabel="Adicionar Serviço"
          onAction={openNew}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {services.map((s, i) => (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.05 }}
                className="rounded-2xl border border-white/5 bg-white/[0.02] p-5 group hover:border-white/10 transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: s.color || '#4F8EF7' }} />
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => openEdit(s)} className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-white">
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => deleteMutation.mutate(s.id)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-white/40 hover:text-red-400">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <h3 className="text-white font-semibold mb-1">{s.name}</h3>
                {s.description && <p className="text-white/30 text-xs mb-3 line-clamp-2">{s.description}</p>}
                <div className="flex items-center gap-4 text-sm">
                  <span className="flex items-center gap-1.5 text-white/50">
                    <DollarSign className="w-3.5 h-3.5" /> R${s.price?.toFixed(2)}
                  </span>
                  <span className="flex items-center gap-1.5 text-white/50">
                    <Clock className="w-3.5 h-3.5" /> {s.duration}min
                  </span>
                </div>
                {s.category && <span className="inline-block mt-3 px-2.5 py-1 rounded-full bg-white/5 text-white/40 text-xs">{s.category}</span>}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Service Form Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="bg-[#111318] border-white/10 text-white max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? 'Editar Serviço' : 'Novo Serviço'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div>
              <Label className="text-white/60 text-sm">Nome</Label>
              <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required className="bg-white/5 border-white/10 text-white mt-1" placeholder="Ex: Corte Feminino" />
            </div>
            <div>
              <Label className="text-white/60 text-sm">Descrição</Label>
              <Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="bg-white/5 border-white/10 text-white mt-1" placeholder="Detalhes do serviço..." rows={2} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-white/60 text-sm">Preço (R$)</Label>
                <Input type="number" step="0.01" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} required className="bg-white/5 border-white/10 text-white mt-1" />
              </div>
              <div>
                <Label className="text-white/60 text-sm">Duração (min)</Label>
                <Input type="number" value={form.duration} onChange={e => setForm(f => ({ ...f, duration: e.target.value }))} required className="bg-white/5 border-white/10 text-white mt-1" />
              </div>
            </div>
            <div>
              <Label className="text-white/60 text-sm">Categoria</Label>
              <Input value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="bg-white/5 border-white/10 text-white mt-1" placeholder="Ex: Cabelo, Unhas, Estética..." />
            </div>
            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" onClick={closeForm} className="flex-1 border-white/10 text-white/60 hover:bg-white/5">Cancelar</Button>
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="flex-1 bg-blue-500 hover:bg-blue-600 text-white">
                {editing ? 'Salvar' : 'Criar'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}