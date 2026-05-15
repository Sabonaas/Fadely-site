/** SaaS roles — mirrored in Postgres `member_role` enum */
export const MemberRole = {
  Owner: 'owner',
  Admin: 'admin',
  Manager: 'manager',
  Employee: 'employee',
  Receptionist: 'receptionist',
} as const;

export type MemberRole = (typeof MemberRole)[keyof typeof MemberRole];

export const SubscriptionPlan = {
  FreeTrial: 'free_trial',
  Essential: 'essential',
  Professional: 'professional',
  Premium: 'premium',
} as const;

export type SubscriptionPlan = (typeof SubscriptionPlan)[keyof typeof SubscriptionPlan];

export const AppointmentStatus = {
  Scheduled: 'scheduled',
  Confirmed: 'confirmed',
  InProgress: 'in_progress',
  Completed: 'completed',
  Cancelled: 'cancelled',
  NoShow: 'no_show',
} as const;

export type AppointmentStatus = (typeof AppointmentStatus)[keyof typeof AppointmentStatus];

export const PaymentStatus = {
  Pending: 'pending',
  Paid: 'paid',
  Failed: 'failed',
  Refunded: 'refunded',
  Cancelled: 'cancelled',
} as const;

export type PaymentStatus = (typeof PaymentStatus)[keyof typeof PaymentStatus];

export const WhatsAppProvider = {
  Evolution: 'evolution',
  Twilio: 'twilio',
  Zapi: 'zapi',
  Meta: 'meta',
} as const;

export type WhatsAppProvider = (typeof WhatsAppProvider)[keyof typeof WhatsAppProvider];
