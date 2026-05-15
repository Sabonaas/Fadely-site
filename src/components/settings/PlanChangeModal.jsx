import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Loader2, ExternalLink, Zap } from 'lucide-react';
import { toast } from 'sonner';
import { stripeClient } from '@/integrations/stripe/stripe.client';
import { DASHBOARD_PLANS, normalizePlanKey } from '@/lib/planConfig';
import * as db from '@/repositories/db';

export default function PlanChangeModal({ open, onClose, business }) {
  const [loadingPlan, setLoadingPlan] = useState(null);
  const [portalLoading, setPortalLoading] = useState(false);

  const currentKey = normalizePlanKey(business?.subscription_plan);

  const resolveOrgId = async () => {
    if (business?.organization_id) return business.organization_id;
    const id = await db.getBusinessOrganizationIdRpc(business.id);
    return id;
  };

  const handleUpgrade = async (plan) => {
    setLoadingPlan(plan.stripeKey);
    try {
      const organizationId = await resolveOrgId();
      if (!organizationId) {
        toast.error('Organização não encontrada. Conclua o onboarding.');
        return;
      }
      const { url } = await stripeClient.createCheckout(plan.stripeKey, organizationId);
      if (url) window.location.href = url;
      else toast.error('Não foi possível abrir o checkout');
    } catch (e) {
      toast.error(e.message || 'Erro ao iniciar checkout');
    } finally {
      setLoadingPlan(null);
    }
  };

  const handlePortal = async () => {
    setPortalLoading(true);
    try {
      const organizationId = await resolveOrgId();
      if (!organizationId) {
        toast.error('Organização não encontrada.');
        return;
      }
      const { url } = await stripeClient.openCustomerPortal(organizationId);
      if (url) window.open(url, '_blank', 'noopener,noreferrer');
    } catch (e) {
      toast.error(e.message || 'Erro ao abrir portal');
    } finally {
      setPortalLoading(false);
    }
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[100] flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="absolute inset-0 bg-background/80 backdrop-blur-sm"
          onClick={onClose}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 16 }}
          className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl border border-border bg-card shadow-2xl p-6 sm:p-8"
        >
          <div className="flex items-start justify-between mb-6">
            <motion.div>
              <motion.div className="flex items-center gap-2 text-primary mb-1">
                <Zap className="w-5 h-5" />
                <span className="text-xs font-semibold uppercase tracking-wider">Assinatura</span>
              </motion.div>
              <h2 className="text-xl font-bold text-foreground">Escolha seu plano</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Upgrade seguro via Stripe. Cancele quando quiser.
              </p>
            </motion.div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              aria-label="Fechar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <motion.div className="grid gap-4 sm:grid-cols-3">
            {DASHBOARD_PLANS.map((plan) => {
              const isCurrent = plan.key === currentKey;
              const isLoading = loadingPlan === plan.stripeKey;
              return (
                <motion.div
                  key={plan.key}
                  className={`relative rounded-2xl border p-5 flex flex-col ${
                    plan.popular ? 'border-primary/40 bg-primary/5' : 'border-border bg-background/50'
                  } ${isCurrent ? 'ring-2 ring-primary/30' : ''}`}
                >
                  {plan.popular && (
                    <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary text-primary-foreground">
                      Popular
                    </span>
                  )}
                  {isCurrent && (
                    <span className="absolute top-3 right-3 text-[10px] font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                      Atual
                    </span>
                  )}
                  <h3 className="font-bold text-foreground">{plan.name}</h3>
                  <p className="text-2xl font-bold text-foreground mt-2">
                    {plan.price}
                    <span className="text-sm font-normal text-muted-foreground">{plan.period}</span>
                  </p>
                  <p className="text-xs text-muted-foreground mt-2 min-h-[2.5rem]">{plan.description}</p>
                  <ul className="mt-4 space-y-2 flex-1">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-xs text-muted-foreground">
                        <Check className="w-3.5 h-3.5 text-primary flex-shrink-0 mt-0.5" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <button
                    type="button"
                    disabled={isCurrent || isLoading}
                    onClick={() => handleUpgrade(plan)}
                    className="mt-5 w-full h-10 rounded-xl text-sm font-semibold transition-all disabled:opacity-50 bg-primary text-primary-foreground hover:opacity-90 flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : isCurrent ? (
                      'Plano atual'
                    ) : (
                      'Fazer upgrade'
                    )}
                  </button>
                </motion.div>
              );
            })}
          </motion.div>

          <motion.div className="mt-6 pt-6 border-t border-border flex flex-wrap gap-3 justify-between items-center">
            <p className="text-xs text-muted-foreground">
              Status: <span className="capitalize text-foreground">{business?.subscription_status || '—'}</span>
            </p>
            <button
              type="button"
              onClick={handlePortal}
              disabled={portalLoading}
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {portalLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ExternalLink className="w-4 h-4" />}
              Gerenciar assinatura no Stripe
            </button>
          </motion.div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
