import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as db from '@/repositories/db';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Briefcase } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

const ROLE_COLORS = ['#4F8EF7', '#7B5EEA', '#22c55e', '#f59e0b', '#ef4444', '#ec4899', '#14b8a6', '#f97316'];

export default function JobRoleManager({ businessId }) {
  const queryClient = useQueryClient();
  const [newName, setNewName] = useState('');
  const [selectedColor, setSelectedColor] = useState(ROLE_COLORS[0]);

  const { data: roles = [] } = useQuery({
    queryKey: ['job-roles', businessId],
    queryFn: () => db.listJobRolesByBusiness(businessId),
  });

  const createMutation = useMutation({
    mutationFn: (data) => db.createJobRole({ ...data, business_id: businessId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-roles', businessId] });
      setNewName('');
      toast.success('Cargo criado!');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => db.deleteJobRole(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['job-roles', businessId] }),
  });

  const handleCreate = (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    createMutation.mutate({ name: newName.trim(), color: selectedColor });
  };

  return (
    <div className="space-y-4">
      {/* Existing roles */}
      <div className="flex flex-wrap gap-2">
        <AnimatePresence>
          {roles.map(r => (
            <motion.div key={r.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full group"
              style={{ background: `${r.color || '#4F8EF7'}15`, border: `1px solid ${r.color || '#4F8EF7'}30` }}>
              <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: r.color || '#4F8EF7' }} />
              <span className="text-sm font-medium" style={{ color: r.color || '#4F8EF7' }}>{r.name}</span>
              <button
                onClick={() => deleteMutation.mutate(r.id)}
                className="opacity-0 group-hover:opacity-60 hover:!opacity-100 transition-all text-white/40 hover:text-red-400 ml-1"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
        {roles.length === 0 && (
          <p className="text-white/25 text-xs py-1">Nenhum cargo criado ainda</p>
        )}
      </div>

      {/* Create form */}
      <form onSubmit={handleCreate} className="flex items-center gap-2">
        <div className="flex gap-1">
          {ROLE_COLORS.map(c => (
            <button key={c} type="button" onClick={() => setSelectedColor(c)}
              className="w-5 h-5 rounded-full transition-all flex-shrink-0"
              style={{ background: c, outline: selectedColor === c ? `2px solid ${c}` : 'none', outlineOffset: '2px', transform: selectedColor === c ? 'scale(1.15)' : 'scale(1)' }}
            />
          ))}
        </div>
        <Input
          value={newName}
          onChange={e => setNewName(e.target.value)}
          placeholder="Nome do cargo..."
          className="bg-white/5 border-white/10 text-white flex-1 h-8 text-sm"
        />
        <button type="submit" disabled={!newName.trim() || createMutation.isPending}
          className="h-8 px-3 rounded-xl text-white text-sm font-medium transition-all disabled:opacity-40 flex items-center gap-1.5"
          style={{ background: 'rgba(79,142,247,0.15)', border: '1px solid rgba(79,142,247,0.25)' }}>
          <Plus className="w-3.5 h-3.5 text-blue-400" />
          <span className="text-blue-300 text-xs">Criar</span>
        </button>
      </form>
    </div>
  );
}