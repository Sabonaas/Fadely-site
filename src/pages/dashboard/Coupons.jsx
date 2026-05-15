import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Ticket, ToggleLeft, ToggleRight } from 'lucide-react';
import * as db from '@/repositories/db';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';

export default function Coupons() {
  const { business } = useOutletContext();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    code: '',
    name: '',
    discount_percent: 10,
    max_uses: '',
    starts_at: '',
    ends_at: '',
  });

  const { data: coupons = [] } = useQuery({
    queryKey: ['coupons', business.id],
    queryFn: () => db.listCouponsByBusiness(business.id),
  });

  const createMutation = useMutation({
    mutationFn: (row) => db.createCoupon(row),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['coupons'] });
      setOpen(false);
      toast.success('Cupom criado');
    },
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, is_active }) => db.updateCoupon(id, { is_active }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['coupons'] }),
  });

  const submit = (e) => {
    e.preventDefault();
    createMutation.mutate({
      business_id: business.id,
      code: form.code.trim().toUpperCase(),
      name: form.name.trim(),
      discount_percent: Number(form.discount_percent),
      max_uses: form.max_uses ? Number(form.max_uses) : null,
      starts_at: new Date(form.starts_at).toISOString(),
      ends_at: new Date(form.ends_at).toISOString(),
      is_active: true,
    });
  };

  return (
    <div className="min-w-0">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="dashboard-page-title">Cupons</h1>
          <p className="dashboard-muted mt-1">Promoções com validade e limite de uso</p>
        </div>
        <Button onClick={() => setOpen(true)} className="rounded-xl gap-2">
          <Plus className="w-4 h-4" /> Novo cupom
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {coupons.map((c) => (
          <div key={c.id} className="dashboard-card p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <Ticket className="w-5 h-5 text-primary shrink-0" />
                <div className="min-w-0">
                  <p className="font-semibold text-foreground truncate">{c.name}</p>
                  <p className="text-xs text-muted-foreground font-mono">{c.code}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => toggleMutation.mutate({ id: c.id, is_active: !c.is_active })}
                className="text-muted-foreground hover:text-foreground shrink-0"
              >
                {c.is_active ? <ToggleRight className="w-6 h-6 text-primary" /> : <ToggleLeft className="w-6 h-6" />}
              </button>
            </div>
            <p className="text-2xl font-bold text-primary mt-3">{c.discount_percent}% off</p>
            <p className="text-xs text-muted-foreground mt-2">
              {c.uses_count || 0}
              {c.max_uses ? ` / ${c.max_uses}` : ''} usos · até{' '}
              {new Date(c.ends_at).toLocaleDateString('pt-BR')}
            </p>
          </div>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-card border-border text-card-foreground max-w-md">
          <DialogHeader>
            <DialogTitle>Novo cupom</DialogTitle>
          </DialogHeader>
          <form onSubmit={submit} className="space-y-3">
            <div><Label>Nome</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
            <div><Label>Código</Label><Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} required /></div>
            <div><Label>Desconto (%)</Label><Input type="number" min={1} max={100} value={form.discount_percent} onChange={(e) => setForm({ ...form, discount_percent: e.target.value })} /></div>
            <div><Label>Máx. usos</Label><Input type="number" value={form.max_uses} onChange={(e) => setForm({ ...form, max_uses: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Início</Label><Input type="date" value={form.starts_at} onChange={(e) => setForm({ ...form, starts_at: e.target.value })} required /></div>
              <div><Label>Fim</Label><Input type="date" value={form.ends_at} onChange={(e) => setForm({ ...form, ends_at: e.target.value })} required /></div>
            </div>
            <Button type="submit" className="w-full rounded-xl" disabled={createMutation.isPending}>
              Criar
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
