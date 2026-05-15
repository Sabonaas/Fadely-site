import type { WhatsAppProvider, WhatsAppSendParams } from '../types';

/** Evolution API — self-hosted WhatsApp gateway */
export class EvolutionWhatsAppProvider implements WhatsAppProvider {
  readonly name = 'evolution';

  constructor(
    private readonly baseUrl: string,
    private readonly apiKey: string,
    private readonly instance: string
  ) {}

  async send(params: WhatsAppSendParams): Promise<{ messageId: string }> {
    const phone = params.to.replace(/\D/g, '');
    const res = await fetch(`${this.baseUrl}/message/sendText/${this.instance}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', apikey: this.apiKey },
      body: JSON.stringify({ number: phone, text: params.body }),
    });
    if (!res.ok) throw new Error(`Evolution API error: ${res.status}`);
    const data = await res.json();
    return { messageId: data.key?.id ?? crypto.randomUUID() };
  }

  async healthCheck(): Promise<boolean> {
    try {
      const res = await fetch(`${this.baseUrl}/instance/connectionState/${this.instance}`, {
        headers: { apikey: this.apiKey },
      });
      return res.ok;
    } catch {
      return false;
    }
  }
}
