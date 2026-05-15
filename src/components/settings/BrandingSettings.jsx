import { useState } from 'react';
import { motion } from 'framer-motion';
import { Building2, User } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import AvatarUpload from '@/components/shared/AvatarUpload';
import { useAuth } from '@/lib/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { uploadOrganizationLogo, removeOrganizationLogo } from '@/services/logo.service';
import FadelyLogo from '@/components/FadelyLogo';

function LogoUpload({ business, organizationId, currentUrl, onChange }) {
  const [url, setUrl] = useState(currentUrl || '');
  const [loading, setLoading] = useState(false);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    try {
      const publicUrl = await uploadOrganizationLogo(
        organizationId || null,
        business.id,
        file
      );
      setUrl(publicUrl);
      onChange?.(publicUrl);
      toast.success('Logo atualizada!');
    } catch (err) {
      toast.error(err.message || 'Erro ao enviar logo');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async () => {
    setLoading(true);
    try {
      await removeOrganizationLogo(organizationId || null, business.id);
      setUrl('');
      onChange?.('');
      toast.success('Logo removida');
    } catch (err) {
      toast.error(err.message || 'Erro ao remover logo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col sm:flex-row items-center gap-6">
      <div
        className="w-24 h-24 rounded-2xl border border-border bg-muted flex items-center justify-center overflow-hidden flex-shrink-0"
      >
        {url ? (
          <img src={url} alt="Logo" className="w-full h-full object-cover" />
        ) : (
          <FadelyLogo size="sm" />
        )}
      </div>
      <div className="flex flex-col gap-2">
        <label className="cursor-pointer inline-flex items-center justify-center px-4 py-2 rounded-xl text-sm font-medium bg-primary text-primary-foreground hover:opacity-90 transition-opacity">
          {loading ? 'Enviando…' : 'Enviar logo'}
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
            disabled={loading}
            onChange={handleFile}
          />
        </label>
        {url && (
          <button
            type="button"
            onClick={handleRemove}
            disabled={loading}
            className="text-sm text-muted-foreground hover:text-destructive transition-colors"
          >
            Remover logo
          </button>
        )}
        <p className="text-xs text-muted-foreground">PNG, JPG ou WebP · máx. 5MB</p>
      </div>
    </motion.div>
  );
}

export default function BrandingSettings({ business, organizationId }) {
  const { user } = useAuth();
  const { avatarUrl, displayName, invalidate } = useProfile();
  const queryClient = useQueryClient();

  const onAvatarUploaded = () => {
    invalidate();
    queryClient.invalidateQueries({ queryKey: ['my-business'] });
  };

  const onLogoChange = () => {
    queryClient.invalidateQueries({ queryKey: ['my-business'] });
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="dashboard-card p-5 space-y-4"
      >
        <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <User className="w-4 h-4 text-primary" /> Perfil do usuário
        </h2>
        <p className="text-xs text-muted-foreground">
          Sua foto aparece na sidebar, equipe e notificações.
        </p>
        <AvatarUpload
          userId={user?.id}
          currentUrl={avatarUrl}
          name={displayName}
          size={96}
          onUploaded={onAvatarUploaded}
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="dashboard-card p-5 space-y-4"
      >
        <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <Building2 className="w-4 h-4 text-primary" /> Estabelecimento
        </h2>
        <p className="text-xs text-muted-foreground">
          Logo na sidebar, página pública e login.
        </p>
        <LogoUpload
          business={business}
          organizationId={organizationId}
          currentUrl={business?.logo_url}
          onChange={onLogoChange}
        />
      </motion.div>
    </>
  );
}
