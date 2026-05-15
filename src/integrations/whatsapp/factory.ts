import { WhatsAppProvider as ProviderEnum } from '@/types/enums';
import type { WhatsAppProvider } from './types';
import { EvolutionWhatsAppProvider } from './providers/evolution.provider';
import { TwilioWhatsAppProvider } from './providers/twilio.provider';
import { ZapiWhatsAppProvider } from './providers/zapi.provider';
import { MetaWhatsAppProvider } from './providers/meta.provider';

export type WhatsAppProviderName = (typeof ProviderEnum)[keyof typeof ProviderEnum];

export interface WhatsAppConfig {
  provider: WhatsAppProviderName;
  evolution?: { baseUrl: string; apiKey: string; instance: string };
  twilio?: { accountSid: string; authToken: string; from: string };
  zapi?: { instanceId: string; token: string; clientToken: string };
  meta?: { phoneNumberId: string; accessToken: string };
}

export function createWhatsAppProvider(config: WhatsAppConfig): WhatsAppProvider {
  switch (config.provider) {
    case ProviderEnum.Evolution:
      if (!config.evolution) throw new Error('Evolution config missing');
      return new EvolutionWhatsAppProvider(
        config.evolution.baseUrl,
        config.evolution.apiKey,
        config.evolution.instance
      );
    case ProviderEnum.Twilio:
      if (!config.twilio) throw new Error('Twilio config missing');
      return new TwilioWhatsAppProvider(
        config.twilio.accountSid,
        config.twilio.authToken,
        config.twilio.from
      );
    case ProviderEnum.Zapi:
      if (!config.zapi) throw new Error('Z-API config missing');
      return new ZapiWhatsAppProvider(
        config.zapi.instanceId,
        config.zapi.token,
        config.zapi.clientToken
      );
    case ProviderEnum.Meta:
      if (!config.meta) throw new Error('Meta config missing');
      return new MetaWhatsAppProvider(config.meta.phoneNumberId, config.meta.accessToken);
    default:
      throw new Error(`Unknown WhatsApp provider: ${config.provider}`);
  }
}
