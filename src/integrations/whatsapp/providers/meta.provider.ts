import type { WhatsAppProvider, WhatsAppSendParams } from '../types';

/** Meta Cloud API (WhatsApp Business Platform) */
export class MetaWhatsAppProvider implements WhatsAppProvider {
  readonly name = 'meta';

  constructor(
    private readonly phoneNumberId: string,
    private readonly accessToken: string,
    private readonly apiVersion = 'v21.0'
  ) {}

  async send(params: WhatsAppSendParams): Promise<{ messageId: string }> {
    const to = params.to.replace(/\D/g, '');
    const res = await fetch(
      `https://graph.facebook.com/${this.apiVersion}/${this.phoneNumberId}/messages`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to,
          type: 'text',
          text: { body: params.body },
        }),
      }
    );
    if (!res.ok) throw new Error(`Meta API error: ${res.status}`);
    const data = await res.json();
    return { messageId: data.messages?.[0]?.id ?? crypto.randomUUID() };
  }

  async healthCheck(): Promise<boolean> {
    const res = await fetch(
      `https://graph.facebook.com/${this.apiVersion}/${this.phoneNumberId}`,
      { headers: { Authorization: `Bearer ${this.accessToken}` } }
    );
    return res.ok;
  }
}
