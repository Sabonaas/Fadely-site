import type { WhatsAppProvider, WhatsAppSendParams } from '../types';

export class TwilioWhatsAppProvider implements WhatsAppProvider {
  readonly name = 'twilio';

  constructor(
    private readonly accountSid: string,
    private readonly authToken: string,
    private readonly fromNumber: string
  ) {}

  async send(params: WhatsAppSendParams): Promise<{ messageId: string }> {
    const body = new URLSearchParams({
      To: `whatsapp:${params.to}`,
      From: this.fromNumber,
      Body: params.body,
    });
    const auth = btoa(`${this.accountSid}:${this.authToken}`);
    const res = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${this.accountSid}/Messages.json`,
      { method: 'POST', headers: { Authorization: `Basic ${auth}` }, body }
    );
    if (!res.ok) throw new Error(`Twilio error: ${res.status}`);
    const data = await res.json();
    return { messageId: data.sid };
  }

  async healthCheck(): Promise<boolean> {
    const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${this.accountSid}.json`, {
      headers: { Authorization: `Basic ${btoa(`${this.accountSid}:${this.authToken}`)}` },
    });
    return res.ok;
  }
}
