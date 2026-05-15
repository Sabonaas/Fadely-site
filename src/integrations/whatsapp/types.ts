export interface WhatsAppSendParams {
  to: string;
  body: string;
  templateKey?: string;
  metadata?: Record<string, unknown>;
}

export interface WhatsAppProvider {
  readonly name: string;
  send(params: WhatsAppSendParams): Promise<{ messageId: string }>;
  healthCheck(): Promise<boolean>;
}

export type WhatsAppTemplate =
  | 'appointment_reminder'
  | 'appointment_confirmation'
  | 'appointment_cancelled'
  | 'post_visit_thanks';
