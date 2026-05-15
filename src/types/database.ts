import type { AppointmentStatus, MemberRole, PaymentStatus, SubscriptionPlan } from './enums';

export interface Organization {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  plan: SubscriptionPlan | string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  subscription_status: string;
  trial_ends_at: string | null;
  settings: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface OrganizationMember {
  id: string;
  organization_id: string;
  user_id: string;
  role: MemberRole;
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
  phone: string | null;
  employee_id: string | null;
  is_active: boolean;
  joined_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Business {
  id: string;
  organization_id: string | null;
  owner_id: string;
  name: string;
  slug: string | null;
  type: string;
  subscription_plan: string;
  subscription_status: string;
  [key: string]: unknown;
}

export interface Appointment {
  id: string;
  business_id: string;
  service_id: string | null;
  employee_id: string | null;
  client_id: string | null;
  date: string;
  time: string;
  start_at: string | null;
  end_at: string | null;
  duration: number;
  price: number;
  status: AppointmentStatus | string;
  notes: string | null;
}

export interface Payment {
  id: string;
  organization_id: string;
  business_id: string;
  appointment_id: string | null;
  amount: number;
  currency: string;
  method: string;
  status: PaymentStatus;
  paid_at: string | null;
  created_at: string;
}

export interface Subscription {
  id: string;
  organization_id: string;
  stripe_subscription_id: string;
  plan: string;
  status: string;
  current_period_end: string | null;
}

export interface UserNotification {
  id: string;
  user_id: string;
  organization_id: string | null;
  business_id: string | null;
  type: string;
  title: string;
  content: string | null;
  read_at: string | null;
  created_at: string;
}

export interface DashboardMetrics {
  revenue: number;
  appointments: number;
  cancelled_appointments: number;
  cancellation_rate: number;
  active_clients: number;
  active_employees: number;
  period: { from: string; to: string };
}

export interface PlanFeatures {
  plan: string;
  max_employees: number;
  max_locations: number;
  whatsapp_enabled: boolean;
  analytics_advanced: boolean;
  multi_unit: boolean;
  features: Record<string, unknown>;
}
