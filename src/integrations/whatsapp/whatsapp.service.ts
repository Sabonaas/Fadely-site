import { getSupabase } from '@/lib/supabase/client';
import { planHasFeature } from '@/policies/planFeatures';
import type { WhatsAppTemplate } from './types';

const TEMPLATES: Record<WhatsAppTemplate, (ctx: Record<string, string>) => string> = {
  appointment_reminder: (c) =>
    `Olá ${c.clientName}! Lembrete: seu horário na ${c.businessName} é ${c.date} às ${c.time}.`,
  appointment_confirmation: (c) =>
    `✅ Agendamento confirmado — ${c.businessName}, ${c.date} às ${c.time}.`,
  appointment_cancelled: (c) =>
    `Seu agendamento em ${c.businessName} (${c.date} ${c.time}) foi cancelado.`,
  post_visit_thanks: (c) =>
    `Obrigado pela visita, ${c.clientName}! Esperamos você em breve na ${c.businessName}.`,
};

/**
 * Queues WhatsApp messages in DB for Edge Function / cron worker delivery.
 * Actual send uses provider layer server-side.
 */
export class WhatsAppService {
  async queueMessage(params: {
    businessId: string;
    appointmentId?: string;
    recipientPhone: string;
    template: WhatsAppTemplate;
    context: Record<string, string>;
    plan: string;
    scheduledFor?: Date;
    provider?: string;
  }) {
    if (!planHasFeature(params.plan, 'whatsapp')) {
      throw new Error('WhatsApp não disponível no seu plano');
    }
    const body = TEMPLATES[params.template](params.context);
    const { data, error } = await getSupabase()
      .from('whatsapp_messages')
      .insert({
        business_id: params.businessId,
        appointment_id: params.appointmentId ?? null,
        recipient_phone: params.recipientPhone,
        template_key: params.template,
        body,
        provider: params.provider ?? 'evolution',
        status: 'queued',
        scheduled_for: params.scheduledFor?.toISOString() ?? new Date().toISOString(),
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  }
}

export const whatsappService = new WhatsAppService();
