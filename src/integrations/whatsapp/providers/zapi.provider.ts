import type { WhatsAppProvider, WhatsAppSendParams } from '../types';

export class ZapiWhatsAppProvider implements WhatsAppProvider {
  readonly name = 'zapi';

  constructor(
    private readonly instanceId: string,
    private readonly token: string,
    private readonly clientToken: string
  ) {}

  async send(params: WhatsAppSendParams): Promise<{ messageId: string }> {
    const phone = params.to.replace(/\D/g, '');
    const res = await fetch(
      `https://api.z-api.io/instances/${this.instanceId}/token/${this.token}/send-text`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Client-Token': this.clientToken },
        body: JSON.stringify({ phone, message: params.body }),
      }
    );
    if (!res.ok) throw new Error(`Z-API error: ${res.status}`);
    const data = await res.json();
    return { messageId: data.messageId ?? data.zapiMessageId ?? crypto.randomUUID() };
  }

  async healthCheck(): Promise<boolean> {
    const res = await fetch(
      `https://api.z-api.io/instances/${this.instanceId}/token/${this.token}/status`,
      { headers: { 'Client-Token': this.clientToken } }
    );
    return res.ok;
  }
}
