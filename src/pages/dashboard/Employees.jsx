import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as db from '@/repositories/db';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, UserCheck, Pencil, Trash2, Phone, Mail, Link2, Check, Briefcase, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import EmptyState from '@/components/dashboard/EmptyState';
import JobRoleManager from '@/components/employees/JobRoleManager';
import { toast } from 'sonner';

const defaultEmployee = { name: '', email: '', phone: '', role: '', job_role_id: '', color: '#4F8EF7' };

export default function Employees() {
  const { business } = useOutletContext();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(defaultEmployee);
  const [showRoles, setShowRoles] = useState(false);

  const { data: employees = [] } = useQuery({
    queryKey: ['employees', business.id],
    queryFn: () => db.listEmployeesByBusinessId(business.id),
  });

  const { data: roles = [] } = useQuery({
    queryKey: ['job-roles', business.id],
    queryFn: () => db.listJobRolesByBusiness(business.id),
  });

  const planLimits = { free_trial: 1, starter: 1, professional: 10, enterprise: Infinity };
  const maxEmployees = planLimits[business.subscription_plan] || 1;
  const canAdd = employees.length < maxEmployees;

  const createMutation = useMutation({
    mutationFn: (data) => db.createEmployee({ ...data, business_id: business.id }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['employees'] }); closeForm(); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => db.updateEmployee(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['employees'] }); closeForm(); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => db.deleteEmployee(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['employees'] }),
  });

  const openNew = () => { setEditing(null); setForm(defaultEmployee); setShowForm(true); };
  const openEdit = (e) => {
    setEditing(e);
    setForm({ name: e.name, email: e.email || '', phone: e.phone || '', role: e.role || '', job_role_id: e.job_role_id || '', color: e.color || '#4F8EF7' });
    setShowForm(true);
  };
  const closeForm = () => { setShowForm(false); setEditing(null); };

  const copyInviteLink = (emp) => {
    const inviteCode = business.invite_code || business.id;
    const url = `${window.location.origin}/employee-invite?code=${inviteCode}&eid=${emp.id}`;
    navigator.clipboard.writeText(url);
    toast.success('Link de convite copiado!');
  };

  const handleSubmit = (ev) => {
    ev.preventDefault();
    // Resolve role text from job_role_id
    const selectedRole = roles.find(r => r.id === form.job_role_id);
    const data = { ...form, role: selectedRole ? selectedRole.name : form.role };
    if (editing) {
      updateMutation.mutate({ id: editing.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const getRoleForEmployee = (emp) => {
    if (emp.job_role_id) {
      const r = roles.find(r => r.id === emp.job_role_id);
      return r || null;
    }
    return null;
  };

  return (
    <div>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Colaboradores</h1>
          <p className="text-white/40 mt-1 text-sm">{employees.length}/{maxEmployees === Infinity ? '∞' : maxEmployees} colaboradores</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowRoles(true)} variant="outline"
            className="border-white/10 text-white/50 hover:bg-white/5 hover:text-white rounded-xl gap-2 text-sm">
            <Briefcase className="w-4 h-4" /> Cargos
          </Button>
          {canAdd ? (
            <Button onClick={openNew} className="bg-blue-500 hover:bg-blue-600 text-white rounded-xl gap-2">
              <Plus className="w-4 h-4" /> Adicionar
            </Button>
          ) : (
            <Button className="bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-xl text-sm" size="sm">
              Fazer Upgrade
            </Button>
          )}
        </div>
      </motion.div>

      {employees.length === 0 ? (
        <EmptyState icon={UserCheck} title="Sem colaboradores ainda"
          description="Adicione membros da equipe para atribuir serviços e gerenciar agendamentos."
          actionLabel={canAdd ? 'Adicionar Colaborador' : undefined} onAction={openNew} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {employees.map((emp, i) => {
              const jobRole = getRoleForEmployee(emp);
              const displayColor = jobRole?.color || emp.color || '#4F8EF7';
              return (
                <motion.div key={emp.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="rounded-2xl border border-white/5 bg-white/[0.02] p-5 group hover:border-white/10 transition-all">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-11 h-11 rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0"
                      style={{ backgroundColor: displayColor + '28', color: displayColor, border: `1.5px solid ${displayColor}35` }}>
                      {emp.name?.[0]?.toUpperCase()}
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => copyInviteLink(emp)} className="p-1.5 rounded-lg hover:bg-blue-500/10 text-white/40 hover:text-blue-400" title="Copiar link de convite">
                        <Link2 className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => openEdit(emp)} className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-white">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => deleteMutation.mutate(emp.id)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-white/40 hover:text-red-400">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-white font-semibold text-sm">{emp.name}</h3>

                  {/* Role badge */}
                  {(jobRole || emp.role) && (
                    <div className="inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium"
                      style={{ background: `${displayColor}15`, color: displayColor, border: `1px solid ${displayColor}25` }}>
                      {jobRole && <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: displayColor }} />}
                      {jobRole ? jobRole.name : emp.role}
                    </div>
                  )}

                  <div className="flex items-center gap-3 mt-3 flex-wrap">
                    {emp.phone && <span className="text-white/30 text-xs flex items-center gap-1"><Phone className="w-3 h-3" />{emp.phone}</span>}
                    {emp.email && <span className="text-white/30 text-xs flex items-center gap-1"><Mail className="w-3 h-3" />{emp.email}</span>}
                  </div>

                  {emp.is_linked ? (
                    <span className="inline-flex items-center gap-1 mt-2.5 text-[10px] text-green-400 px-2 py-0.5 rounded-full"
                      style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)' }}>
                      <Check className="w-2.5 h-2.5" /> Vinculado
                    </span>
                  ) : (
                    <button onClick={() => copyInviteLink(emp)}
                      className="inline-flex items-center gap-1 mt-2.5 text-[10px] text-blue-400 px-2 py-0.5 rounded-full hover:bg-blue-500/15 transition-all"
                      style={{ background: 'rgba(79,142,247,0.07)', border: '1px solid rgba(79,142,247,0.15)' }}>
                      <Link2 className="w-2.5 h-2.5" /> Copiar link de convite
                    </button>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Employee Form */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="bg-[#111318] border-white/10 text-white max-w-md">
          <DialogHeader><DialogTitle>{editing ? 'Editar Colaborador' : 'Novo Colaborador'}</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div>
              <Label className="text-white/60 text-sm">Nome *</Label>
              <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required className="bg-white/5 border-white/10 text-white mt-1" />
            </div>
            <div>
              <Label className="text-white/60 text-sm">Cargo</Label>
              {roles.length > 0 ? (
                <select
                  value={form.job_role_id}
                  onChange={e => setForm(f => ({ ...f, job_role_id: e.target.value }))}
                  className="w-full h-9 px-3 rounded-xl text-white/80 text-sm mt-1 focus:outline-none"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
                >
                  <option value="" style={{ background: '#1a1b20' }}>Selecione um cargo...</option>
                  {roles.map(r => <option key={r.id} value={r.id} style={{ background: '#1a1b20' }}>{r.name}</option>)}
                  <option value="__other__" style={{ background: '#1a1b20' }}>Outro (texto livre)</option>
                </select>
              ) : (
                <Input value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
                  placeholder="Ex: Cabeleireiro, Barbeiro..." className="bg-white/5 border-white/10 text-white mt-1" />
              )}
              {form.job_role_id === '__other__' && (
                <Input value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
                  placeholder="Descreva o cargo..." className="bg-white/5 border-white/10 text-white mt-2" />
              )}
            </div>
            <div>
              <Label className="text-white/60 text-sm">E-mail</Label>
              <Input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className="bg-white/5 border-white/10 text-white mt-1" />
            </div>
            <div>
              <Label className="text-white/60 text-sm">Telefone</Label>
              <Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className="bg-white/5 border-white/10 text-white mt-1" />
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

      {/* Cargos Modal */}
      <Dialog open={showRoles} onOpenChange={setShowRoles}>
        <DialogContent className="bg-[#111318] border-white/10 text-white max-w-md">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><Briefcase className="w-4 h-4 text-blue-400" /> Gerenciar Cargos</DialogTitle></DialogHeader>
          <div className="mt-2">
            <p className="text-white/35 text-sm mb-4">Cargos são usados para organizar serviços e calcular comissões automaticamente.</p>
            <JobRoleManager businessId={business.id} />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}