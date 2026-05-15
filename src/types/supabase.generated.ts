/**
 * Database types — replace with `supabase gen types typescript` output in CI.
 */
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

type Row = Record<string, unknown>;
type Insert = Record<string, unknown>;
type Update = Record<string, unknown>;

export interface Database {
  public: {
    Tables: {
      organizations: { Row: Row; Insert: Insert; Update: Update };
      organization_members: { Row: Row; Insert: Insert; Update: Update };
      businesses: { Row: Row; Insert: Insert; Update: Update };
      employees: { Row: Row; Insert: Insert; Update: Update };
      clients: { Row: Row; Insert: Insert; Update: Update };
      services: { Row: Row; Insert: Insert; Update: Update };
      appointments: { Row: Row; Insert: Insert; Update: Update };
      payments: { Row: Row; Insert: Insert; Update: Update };
      subscriptions: { Row: Row; Insert: Insert; Update: Update };
      user_notifications: { Row: Row; Insert: Insert; Update: Update };
      audit_logs: { Row: Row; Insert: Insert; Update: Update };
      blocked_time_slots: { Row: Row; Insert: Insert; Update: Update };
      plan_features: { Row: Row; Insert: Insert; Update: Update };
      whatsapp_messages: { Row: Row; Insert: Insert; Update: Update };
      notifications: { Row: Row; Insert: Insert; Update: Update };
      profiles: { Row: Row; Insert: Insert; Update: Update };
      job_roles: { Row: Row; Insert: Insert; Update: Update };
    };
    Views: Record<string, never>;
    Functions: {
      has_business_permission: {
        Args: { p_business_id: string; p_permission: string };
        Returns: boolean;
      };
      get_dashboard_metrics: {
        Args: { p_business_id: string; p_from?: string; p_to?: string };
        Returns: Json;
      };
      get_employee_dashboard_metrics: {
        Args: { p_employee_id: string; p_from?: string; p_to?: string };
        Returns: Json;
      };
      get_top_services: {
        Args: { p_business_id: string; p_limit?: number };
        Returns: Json;
      };
      get_busiest_hours: {
        Args: { p_business_id: string };
        Returns: Json;
      };
      check_appointment_conflict: {
        Args: {
          p_business_id: string;
          p_employee_id: string | null;
          p_start_at: string;
          p_end_at: string;
          p_exclude_appointment_id?: string | null;
        };
        Returns: boolean;
      };
      create_organization_with_business: {
        Args: {
          p_org_name: string;
          p_business_name: string;
          p_business_type?: string;
          p_slug?: string | null;
        };
        Returns: Json;
      };
      invite_preview: {
        Args: { p_employee_id: string | null; p_invite_code: string | null };
        Returns: Json;
      };
      accept_invite: {
        Args: {
          p_employee_id: string | null;
          p_invite_code: string | null;
          p_user_id: string;
          p_email: string;
          p_full_name: string;
        };
        Returns: Json;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
