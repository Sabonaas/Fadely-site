import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import * as db from '@/repositories/db';
import { motion } from 'framer-motion';
import {
  Settings as SettingsIcon, Save, Globe, Phone, MapPin,
  Clock, Zap, Building2, Instagram, Tag, Share2, Mail
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import PhoneInput from '@/components/settings/PhoneInput';
import CategorySelect from '@/components/settings/CategorySelect';
import SocialInput from '@/components/settings/SocialInput';
import AddressSection from '@/components/settings/AddressSection';
import BrandingSettings from '@/components/settings/BrandingSettings';
import PlanChangeModal from '@/components/settings/PlanChangeModal';
import { planDisplayName } from '@/lib/planConfig';

const timeOptions = [];
for (let h = 6; h <= 23; h++) {
  timeOptions.push(`${String(h).padStart(2, '0')}:00`);
  if (h < 23) timeOptions.push(`${String(h).padStart(2, '0')}:30`);
}

function Section({ title, icon: Icon, children, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="dashboard-card p-5 space-y-4"
    >
      <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
        <Icon className="w-4 h-4 text-primary" /> {title}
      </h2>
      {children}
    </motion.div>
  );
}

function FieldGroup({ label, children }) {
  return (
    <div>
      <Label className="text-muted-foreground text-xs font-medium uppercase tracking-wide mb-1.5 block">{label}</Label>
      {children}
    </div>
  );
}

const inputStyle = { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)' };

export default function Settings() {
  const { business } = useOutletContext();
  const queryClient = useQueryClient();
  const [planModalOpen, setPlanModalOpen] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('checkout') === 'success') {
      toast.success('Assinatura atualizada com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['my-business'] });
      window.history.replaceState({}, '', '/dashboard/settings');
    }
  }, [queryClient]);

  const [form, setForm] = useState({
    name: business.name || '',
    email: business.email || '',
    phone: business.phone || '',
    phone_ddi: business.phone_ddi || '+55',
    phone2: business.phone2 || '',
    phone2_ddi: business.phone2_ddi || '+55',
    categories: business.categories || [],
    social_instagram: business.social_instagram || '',
    social_youtube: business.social_youtube || '',
    social_tiktok: business.social_tiktok || '',
    social_facebook: business.social_facebook || '',
    address: business.address || '',
    address_number: business.address_number || '',
    address_complement: business.address_complement || '',
    address_neighborhood: business.address_neighborhood || '',
    address_city: business.address_city || '',
    address_state: business.address_state || '',
    address_country: business.address_country || 'Brasil',
    address_zip: business.address_zip || '',
    address_lat: business.address_lat || null,
    address_lng: business.address_lng || null,
    booking_page_enabled: business.booking_page_enabled !== false,
    open_time: business.working_hours?.open || '08:00',
    close_time: business.working_hours?.close || '18:00',
  });

  const setField = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const updateMutation = useMutation({
    mutationFn: (data) => db.updateBusiness(business.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-business'] });
      toast.success('Configurações salvas com sucesso!');
    },
  });

  const handleSave = (e) => {
    e.preventDefault();
    const { open_time, close_time, ...rest } = form;
    updateMutation.mutate({
      ...rest,
      working_hours: { open: open_time, close: close_time },
    });
  };

  const planLabel = planDisplayName(business.subscription_plan);

  return (
    <div className="space-y-6 max-w-2xl">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="dashboard-page-title">Configurações</h1>
        <p className="dashboard-muted mt-0.5">Gerencie as informações do seu estabelecimento</p>
      </motion.div>

      <BrandingSettings business={business} organizationId={business.organization_id} />

      <form onSubmit={handleSave} className="space-y-4">

        {/* ── Informações Básicas ── */}
        <Section title="Informações do Estabelecimento" icon={Building2} delay={0.05}>
          <FieldGroup label="Nome da empresa">
            <Input value={form.name} onChange={e => setField('name', e.target.value)} required
              className="bg-white/5 border-white/10 text-white" style={inputStyle} />
          </FieldGroup>
          <FieldGroup label="E-mail">
            <div className="flex items-center gap-2 rounded-xl overflow-hidden" style={inputStyle}>
              <Mail className="w-4 h-4 text-white/25 ml-3 flex-shrink-0" />
              <input type="email" value={form.email} onChange={e => setField('email', e.target.value)}
                placeholder="contato@meuestablecimento.com"
                className="flex-1 h-9 bg-transparent text-white/85 text-sm outline-none placeholder:text-white/20 pr-3" />
            </div>
          </FieldGroup>
        </Section>

        {/* ── Telefones ── */}
        <Section title="Telefones" icon={Phone} delay={0.1}>
          <FieldGroup label="Telefone principal">
            <PhoneInput
              ddi={form.phone_ddi}
              number={form.phone}
              onChangeDdi={v => setField('phone_ddi', v)}
              onChangeNumber={v => setField('phone', v)}
            />
          </FieldGroup>
          <FieldGroup label="Telefone secundário">
            <PhoneInput
              ddi={form.phone2_ddi}
              number={form.phone2}
              onChangeDdi={v => setField('phone2_ddi', v)}
              onChangeNumber={v => setField('phone2', v)}
              placeholder="Opcional"
            />
          </FieldGroup>
        </Section>

        {/* ── Categorias ── */}
        <Section title="Categorias de Serviço" icon={Tag} delay={0.15}>
          <p className="text-white/30 text-xs -mt-1">Selecione todos os serviços que seu estabelecimento oferece.</p>
          <CategorySelect value={form.categories} onChange={v => setField('categories', v)} />
        </Section>

        {/* ── Redes Sociais ── */}
        <Section title="Redes Sociais" icon={Share2} delay={0.2}>
          <SocialInput form={form} onChange={(key, val) => setField(key, val)} />
        </Section>

        {/* ── Endereço ── */}
        <Section title="Endereço" icon={MapPin} delay={0.25}>
          <AddressSection form={form} onChange={setField} />
        </Section>

        {/* ── Horário ── */}
        <Section title="Horário de Funcionamento" icon={Clock} delay={0.3}>
          <div className="grid grid-cols-2 gap-3">
            <FieldGroup label="Abertura">
              <select value={form.open_time} onChange={e => setField('open_time', e.target.value)}
                className="w-full h-9 px-3 rounded-xl text-white/85 text-sm focus:outline-none transition-all"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)' }}>
                {timeOptions.map(t => <option key={t} value={t} style={{ background: '#1a1b20' }}>{t}</option>)}
              </select>
            </FieldGroup>
            <FieldGroup label="Fechamento">
              <select value={form.close_time} onChange={e => setField('close_time', e.target.value)}
                className="w-full h-9 px-3 rounded-xl text-white/85 text-sm focus:outline-none transition-all"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)' }}>
                {timeOptions.map(t => <option key={t} value={t} style={{ background: '#1a1b20' }}>{t}</option>)}
              </select>
            </FieldGroup>
          </div>
          <p className="text-white/25 text-xs">Clientes só poderão agendar dentro deste horário na página de agendamento.</p>
        </Section>

        {/* ── Página de Agendamento ── */}
        <Section title="Página de Agendamento" icon={Globe} delay={0.35}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white text-sm font-medium">Ativar página pública</p>
              <p className="text-white/35 text-xs mt-0.5">Permite que clientes agendem online</p>
            </div>
            <Switch checked={form.booking_page_enabled} onCheckedChange={v => setField('booking_page_enabled', v)} />
          </div>
          {business.slug && (
            <div className="flex items-center gap-2 p-3 rounded-xl"
              style={{ background: 'rgba(79,142,247,0.06)', border: '1px solid rgba(79,142,247,0.12)' }}>
              <Globe className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
              <a href={`/book/${business.slug}`} target="_blank" rel="noopener noreferrer"
                className="text-blue-400 text-sm font-mono hover:text-blue-300 transition-colors truncate">
                fadely.app/book/{business.slug}
              </a>
            </div>
          )}
        </Section>

        {/* ── Plano ── */}
        <Section title="Plano & Assinatura" icon={Zap} delay={0.4}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white text-sm font-semibold">{planLabel}</p>
              <p className="text-white/35 text-xs mt-0.5 capitalize">
                {business.subscription_status === 'trial' ? '14 dias gratuitos' :
                  business.subscription_status === 'active' ? 'Ativo' : business.subscription_status}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setPlanModalOpen(true)}
              className="px-4 py-2 rounded-xl text-xs font-medium text-foreground border border-border bg-accent/50 hover:bg-accent transition-all"
            >
              Trocar Plano
            </button>
          </div>
        </Section>

        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.45 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={updateMutation.isPending}
          className="w-full h-11 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          style={{ background: 'linear-gradient(135deg, #4F8EF7, #7B5EEA)', boxShadow: '0 0 24px rgba(79,142,247,0.25)' }}
        >
          {updateMutation.isPending ? (
            <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Salvando...</>
          ) : (
            <><Save className="w-4 h-4" /> Salvar Configurações</>
          )}
        </motion.button>
      </form>

      <PlanChangeModal open={planModalOpen} onClose={() => setPlanModalOpen(false)} business={business} />
    </div>
  );
}