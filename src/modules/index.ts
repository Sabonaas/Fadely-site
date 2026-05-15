/**
 * Fadely backend modules — public API surface for the React app.
 * Import from `@/modules` instead of deep paths when possible.
 */
export * from '@/services';
export * from '@/repositories';
export * from '@/middleware';
export * from '@/policies/permissions';
export * from '@/policies/planFeatures';
export * from '@/validations';
export * from '@/types';
export * from '@/integrations/stripe';
export { whatsappService, WhatsAppService, createWhatsAppProvider } from '@/integrations/whatsapp';
export type { WhatsAppSendParams, WhatsAppTemplate } from '@/integrations/whatsapp/types';
