-- Fadely SaaS core: organizations, RBAC, billing, audit, scheduling extensions
-- Run after 001–003. Safe to re-run guarded sections via IF NOT EXISTS.
-- ── Extensions & enums ─────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS btree_gist;
DO $$ BEGIN CREATE TYPE public.member_role AS ENUM (
  'owner',
  'admin',
  'manager',
  'employee',
  'receptionist'
);
EXCEPTION
WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN CREATE TYPE public.appointment_status AS ENUM (
  'scheduled',
  'confirmed',
  'in_progress',
  'completed',
  'cancelled',
  'no_show'
);
EXCEPTION
WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN CREATE TYPE public.payment_status AS ENUM (
  'pending',
  'paid',
  'failed',
  'refunded',
  'cancelled'
);
EXCEPTION
WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN CREATE TYPE public.subscription_status AS ENUM (
  'trialing',
  'active',
  'past_due',
  'canceled',
  'unpaid',
  'incomplete'
);
EXCEPTION
WHEN duplicate_object THEN NULL;
END $$;
-- ── Organizations (tenant / billing root) ───────────────────────────────────
CREATE TABLE IF NOT EXISTS public.organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  logo_url text,
  plan text NOT NULL DEFAULT 'free_trial',
  stripe_customer_id text UNIQUE,
  stripe_subscription_id text,
  subscription_status text DEFAULT 'trial',
  trial_ends_at timestamptz,
  settings jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_organizations_slug ON public.organizations (slug);
CREATE INDEX IF NOT EXISTS idx_organizations_stripe_customer ON public.organizations (stripe_customer_id)
WHERE stripe_customer_id IS NOT NULL;
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
-- ── Organization members (RBAC; auth in auth.users) ─────────────────────────
CREATE TABLE IF NOT EXISTS public.organization_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations (id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  role public.member_role NOT NULL DEFAULT 'employee',
  full_name text,
  email text,
  avatar_url text,
  phone text,
  employee_id uuid REFERENCES public.employees (id) ON DELETE
  SET NULL,
    is_active boolean NOT NULL DEFAULT true,
    invited_at timestamptz,
    joined_at timestamptz DEFAULT now(),
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE (organization_id, user_id)
);
CREATE INDEX IF NOT EXISTS idx_org_members_user ON public.organization_members (user_id);
CREATE INDEX IF NOT EXISTS idx_org_members_org ON public.organization_members (organization_id);
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;
-- ── Role → permission grants (static config) ────────────────────────────────
CREATE TABLE IF NOT EXISTS public.role_permission_grants (
  role public.member_role PRIMARY KEY,
  permissions text [] NOT NULL
);
INSERT INTO public.role_permission_grants (role, permissions)
VALUES (
    'owner',
    ARRAY [
    'business:*', 'billing:*', 'members:*', 'employees:*', 'clients:*',
    'appointments:*', 'services:*', 'financial:*', 'analytics:*', 'settings:*', 'audit:read'
  ]
  ),
  (
    'admin',
    ARRAY [
    'business:read', 'business:write', 'billing:read', 'members:read', 'members:write',
    'employees:*', 'clients:*', 'appointments:*', 'services:*', 'financial:read',
    'analytics:*', 'settings:write', 'audit:read'
  ]
  ),
  (
    'manager',
    ARRAY [
    'business:read', 'employees:read', 'employees:write', 'clients:*', 'appointments:*',
    'services:*', 'analytics:read', 'settings:read'
  ]
  ),
  (
    'employee',
    ARRAY [
    'business:read', 'clients:read', 'clients:write', 'appointments:read', 'appointments:write:own',
    'services:read'
  ]
  ),
  (
    'receptionist',
    ARRAY [
    'business:read', 'clients:*', 'appointments:*', 'services:read'
  ]
  ) ON CONFLICT (role) DO
UPDATE
SET permissions = EXCLUDED.permissions;
-- ── Plan feature gates ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.plan_features (
  plan text PRIMARY KEY,
  max_employees int,
  max_locations int,
  whatsapp_enabled boolean NOT NULL DEFAULT false,
  analytics_advanced boolean NOT NULL DEFAULT false,
  multi_unit boolean NOT NULL DEFAULT false,
  features jsonb NOT NULL DEFAULT '{}'::jsonb
);
INSERT INTO public.plan_features (
    plan,
    max_employees,
    max_locations,
    whatsapp_enabled,
    analytics_advanced,
    multi_unit
  )
VALUES ('free_trial', 3, 1, false, false, false),
  ('essential', 5, 1, true, false, false),
  ('professional', 15, 3, true, true, true),
  ('premium', 999, 999, true, true, true) ON CONFLICT (plan) DO
UPDATE
SET max_employees = EXCLUDED.max_employees,
  max_locations = EXCLUDED.max_locations,
  whatsapp_enabled = EXCLUDED.whatsapp_enabled,
  analytics_advanced = EXCLUDED.analytics_advanced,
  multi_unit = EXCLUDED.multi_unit;
-- ── Link businesses → organizations ─────────────────────────────────────────
ALTER TABLE public.businesses
ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES public.organizations (id) ON DELETE
SET NULL;
CREATE INDEX IF NOT EXISTS idx_businesses_organization ON public.businesses (organization_id);
-- Extend employees for SaaS fields
ALTER TABLE public.employees
ADD COLUMN IF NOT EXISTS specialty text,
  ADD COLUMN IF NOT EXISTS commission_percentage numeric(5, 2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS bio text,
  ADD COLUMN IF NOT EXISTS organization_member_id uuid REFERENCES public.organization_members (id) ON DELETE
SET NULL;
-- ── Payments (in-establishment, not Stripe subscription) ────────────────────
CREATE TABLE IF NOT EXISTS public.payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations (id) ON DELETE CASCADE,
  business_id uuid NOT NULL REFERENCES public.businesses (id) ON DELETE CASCADE,
  appointment_id uuid REFERENCES public.appointments (id) ON DELETE
  SET NULL,
    amount numeric(12, 2) NOT NULL CHECK (amount >= 0),
    currency text NOT NULL DEFAULT 'BRL',
    method text NOT NULL DEFAULT 'cash',
    status public.payment_status NOT NULL DEFAULT 'pending',
    stripe_payment_intent_id text,
    metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
    paid_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_payments_business ON public.payments (business_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_payments_org ON public.payments (organization_id, created_at DESC);
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
-- ── Subscriptions (Stripe SaaS billing) ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations (id) ON DELETE CASCADE,
  stripe_subscription_id text UNIQUE NOT NULL,
  stripe_price_id text,
  plan text NOT NULL DEFAULT 'essential',
  status public.subscription_status NOT NULL DEFAULT 'trialing',
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean NOT NULL DEFAULT false,
  trial_end timestamptz,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_subscriptions_org ON public.subscriptions (organization_id);
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
-- ── In-app user notifications ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.user_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  organization_id uuid REFERENCES public.organizations (id) ON DELETE CASCADE,
  business_id uuid REFERENCES public.businesses (id) ON DELETE CASCADE,
  type text NOT NULL,
  title text NOT NULL,
  content text,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_user_notifications_user ON public.user_notifications (user_id, created_at DESC);
ALTER TABLE public.user_notifications ENABLE ROW LEVEL SECURITY;
-- ── Audit logs ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations (id) ON DELETE CASCADE,
  business_id uuid REFERENCES public.businesses (id) ON DELETE
  SET NULL,
    user_id uuid REFERENCES auth.users (id) ON DELETE
  SET NULL,
    action text NOT NULL,
    entity_type text NOT NULL,
    entity_id uuid,
    old_data jsonb,
    new_data jsonb,
    ip_address inet,
    user_agent text,
    created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_audit_logs_org ON public.audit_logs (organization_id, created_at DESC);
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
-- ── Blocked time slots ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.blocked_time_slots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES public.businesses (id) ON DELETE CASCADE,
  employee_id uuid REFERENCES public.employees (id) ON DELETE CASCADE,
  start_at timestamptz NOT NULL,
  end_at timestamptz NOT NULL,
  reason text,
  created_by uuid REFERENCES auth.users (id) ON DELETE
  SET NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    CHECK (end_at > start_at)
);
CREATE INDEX IF NOT EXISTS idx_blocked_slots_business ON public.blocked_time_slots (business_id, start_at);
ALTER TABLE public.blocked_time_slots ENABLE ROW LEVEL SECURITY;
-- ── Appointment recurrence ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.appointment_recurrence (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES public.businesses (id) ON DELETE CASCADE,
  parent_appointment_id uuid REFERENCES public.appointments (id) ON DELETE CASCADE,
  rrule text NOT NULL,
  until_date date,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.appointment_recurrence ENABLE ROW LEVEL SECURITY;
-- Extend appointments (timestamptz + status enum compat)
ALTER TABLE public.appointments
ADD COLUMN IF NOT EXISTS start_at timestamptz,
  ADD COLUMN IF NOT EXISTS end_at timestamptz,
  ADD COLUMN IF NOT EXISTS recurrence_id uuid REFERENCES public.appointment_recurrence (id) ON DELETE
SET NULL,
  ADD COLUMN IF NOT EXISTS confirmed_at timestamptz,
  ADD COLUMN IF NOT EXISTS cancelled_at timestamptz,
  ADD COLUMN IF NOT EXISTS cancellation_reason text;
-- ── WhatsApp outbound queue ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.whatsapp_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES public.businesses (id) ON DELETE CASCADE,
  appointment_id uuid REFERENCES public.appointments (id) ON DELETE
  SET NULL,
    provider text NOT NULL DEFAULT 'evolution',
    recipient_phone text NOT NULL,
    template_key text,
    body text NOT NULL,
    status text NOT NULL DEFAULT 'queued',
    scheduled_for timestamptz,
    sent_at timestamptz,
    error_message text,
    metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
    created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_status ON public.whatsapp_messages (status, scheduled_for);
ALTER TABLE public.whatsapp_messages ENABLE ROW LEVEL SECURITY;
-- ── SECURITY DEFINER helpers (no RLS recursion) ─────────────────────────────
CREATE OR REPLACE FUNCTION public.slugify(text) RETURNS text LANGUAGE sql IMMUTABLE AS $$
SELECT lower(
    regexp_replace(
      regexp_replace(trim($1), '[^a-zA-Z0-9]+', '-', 'g'),
      '(^-|-$)',
      '',
      'g'
    )
  );
$$;
CREATE OR REPLACE FUNCTION public.get_business_organization_id(p_business_id uuid) RETURNS uuid LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
SET row_security = off AS $$
SELECT organization_id
FROM public.businesses
WHERE id = p_business_id;
$$;
REVOKE ALL ON FUNCTION public.get_business_organization_id(uuid)
FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_business_organization_id(uuid) TO authenticated,
  anon;
CREATE OR REPLACE FUNCTION public.get_member_role(p_organization_id uuid, p_user_id uuid) RETURNS public.member_role LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
SET row_security = off AS $$
SELECT om.role
FROM public.organization_members om
WHERE om.organization_id = p_organization_id
  AND om.user_id = p_user_id
  AND om.is_active = true
LIMIT 1;
$$;
REVOKE ALL ON FUNCTION public.get_member_role(uuid, uuid)
FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_member_role(uuid, uuid) TO authenticated;
CREATE OR REPLACE FUNCTION public.role_has_permission(p_role public.member_role, p_permission text) RETURNS boolean LANGUAGE plpgsql STABLE SECURITY DEFINER
SET search_path = public
SET row_security = off AS $$
DECLARE grants text [];
g text;
perm_prefix text;
BEGIN
SELECT permissions INTO grants
FROM public.role_permission_grants
WHERE role = p_role;
IF grants IS NULL THEN RETURN false;
END IF;
FOREACH g IN ARRAY grants LOOP IF g = p_permission THEN RETURN true;
END IF;
IF right(g, 2) = ':*' THEN perm_prefix := left(g, length(g) - 1);
IF left(p_permission, length(perm_prefix)) = perm_prefix THEN RETURN true;
END IF;
END IF;
END LOOP;
RETURN false;
END;
$$;
REVOKE ALL ON FUNCTION public.role_has_permission(public.member_role, text)
FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.role_has_permission(public.member_role, text) TO authenticated;
CREATE OR REPLACE FUNCTION public.has_org_permission(p_organization_id uuid, p_permission text) RETURNS boolean LANGUAGE plpgsql STABLE SECURITY DEFINER
SET search_path = public
SET row_security = off AS $$
DECLARE r public.member_role;
BEGIN IF p_organization_id IS NULL
OR auth.uid() IS NULL THEN RETURN false;
END IF;
r := public.get_member_role(p_organization_id, auth.uid());
IF r IS NULL THEN RETURN false;
END IF;
RETURN public.role_has_permission(r, p_permission);
END;
$$;
REVOKE ALL ON FUNCTION public.has_org_permission(uuid, text)
FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.has_org_permission(uuid, text) TO authenticated;
CREATE OR REPLACE FUNCTION public.has_business_permission(p_business_id uuid, p_permission text) RETURNS boolean LANGUAGE plpgsql STABLE SECURITY DEFINER
SET search_path = public
SET row_security = off AS $$
DECLARE org_id uuid;
BEGIN IF p_business_id IS NULL
OR auth.uid() IS NULL THEN RETURN false;
END IF;
IF public.is_business_owner(p_business_id, auth.uid()) THEN RETURN true;
END IF;
org_id := public.get_business_organization_id(p_business_id);
IF org_id IS NOT NULL
AND public.has_org_permission(org_id, p_permission) THEN RETURN true;
END IF;
-- Linked employee: limited appointment/client access
IF p_permission IN (
  'appointments:read',
  'appointments:write',
  'appointments:write:own',
  'clients:read',
  'clients:write',
  'business:read',
  'services:read'
) THEN IF EXISTS (
  SELECT 1
  FROM public.employees e
  WHERE e.business_id = p_business_id
    AND e.is_linked = true
    AND e.is_active = true
    AND (
      e.auth_user_id = auth.uid()
      OR lower(e.user_email) = lower(auth.jwt()->>'email')
    )
) THEN RETURN true;
END IF;
END IF;
RETURN false;
END;
$$;
REVOKE ALL ON FUNCTION public.has_business_permission(uuid, text)
FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.has_business_permission(uuid, text) TO authenticated;
-- ── Audit RPC ───────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.log_audit(
    p_organization_id uuid,
    p_business_id uuid,
    p_action text,
    p_entity_type text,
    p_entity_id uuid DEFAULT NULL,
    p_old_data jsonb DEFAULT NULL,
    p_new_data jsonb DEFAULT NULL
  ) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public AS $$
DECLARE new_id uuid;
BEGIN IF auth.uid() IS NULL THEN RAISE EXCEPTION 'unauthorized';
END IF;
IF NOT public.has_org_permission(p_organization_id, 'audit:read')
AND NOT public.is_business_owner(
  COALESCE(
    p_business_id,
    '00000000-0000-0000-0000-000000000000'::uuid
  ),
  auth.uid()
) THEN -- allow write for any member with business access
IF p_business_id IS NOT NULL
AND NOT public.has_business_permission(p_business_id, 'business:read') THEN RAISE EXCEPTION 'forbidden';
END IF;
END IF;
INSERT INTO public.audit_logs (
    organization_id,
    business_id,
    user_id,
    action,
    entity_type,
    entity_id,
    old_data,
    new_data
  )
VALUES (
    p_organization_id,
    p_business_id,
    auth.uid(),
    p_action,
    p_entity_type,
    p_entity_id,
    p_old_data,
    p_new_data
  )
RETURNING id INTO new_id;
RETURN new_id;
END;
$$;
REVOKE ALL ON FUNCTION public.log_audit(uuid, uuid, text, text, uuid, jsonb, jsonb)
FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.log_audit(uuid, uuid, text, text, uuid, jsonb, jsonb) TO authenticated;
-- ── Appointment conflict check ────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.check_appointment_conflict(
    p_business_id uuid,
    p_employee_id uuid,
    p_start_at timestamptz,
    p_end_at timestamptz,
    p_exclude_appointment_id uuid DEFAULT NULL
  ) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
SET row_security = off AS $$
SELECT EXISTS (
    SELECT 1
    FROM public.appointments a
    WHERE a.business_id = p_business_id
      AND (
        p_employee_id IS NULL
        OR a.employee_id = p_employee_id
      )
      AND a.status NOT IN ('cancelled', 'no_show')
      AND (
        p_exclude_appointment_id IS NULL
        OR a.id <> p_exclude_appointment_id
      )
      AND (
        (
          a.start_at IS NOT NULL
          AND a.end_at IS NOT NULL
          AND a.start_at < p_end_at
          AND a.end_at > p_start_at
        )
        OR (
          a.date IS NOT NULL
          AND a.time IS NOT NULL
          AND (a.date::text || ' ' || a.time)::timestamptz < p_end_at
          AND (a.date::text || ' ' || a.time)::timestamptz + (COALESCE(a.duration, 30) || ' minutes')::interval > p_start_at
        )
      )
  )
  OR EXISTS (
    SELECT 1
    FROM public.blocked_time_slots b
    WHERE b.business_id = p_business_id
      AND (
        p_employee_id IS NULL
        OR b.employee_id IS NULL
        OR b.employee_id = p_employee_id
      )
      AND b.start_at < p_end_at
      AND b.end_at > p_start_at
  );
$$;
REVOKE ALL ON FUNCTION public.check_appointment_conflict(uuid, uuid, timestamptz, timestamptz, uuid)
FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.check_appointment_conflict(uuid, uuid, timestamptz, timestamptz, uuid) TO authenticated,
  anon;
-- ── Backfill organizations from existing businesses ───────────────────────────
INSERT INTO public.organizations (
    id,
    name,
    slug,
    plan,
    subscription_status,
    trial_ends_at,
    stripe_customer_id
  )
SELECT gen_random_uuid(),
  b.name,
  COALESCE(
    b.slug,
    public.slugify(b.name) || '-' || left(b.id::text, 8)
  ),
  COALESCE(b.subscription_plan, 'free_trial'),
  COALESCE(b.subscription_status, 'trial'),
  b.trial_end_date::timestamptz,
  NULL
FROM public.businesses b
WHERE b.organization_id IS NULL ON CONFLICT (slug) DO NOTHING;
UPDATE public.businesses b
SET organization_id = o.id
FROM public.organizations o
WHERE b.organization_id IS NULL
  AND o.slug = COALESCE(
    b.slug,
    public.slugify(b.name) || '-' || left(b.id::text, 8)
  );
INSERT INTO public.organization_members (organization_id, user_id, role, full_name, email)
SELECT DISTINCT ON (b.organization_id, b.owner_id) b.organization_id,
  b.owner_id,
  'owner'::public.member_role,
  p.full_name,
  b.owner_email
FROM public.businesses b
  LEFT JOIN public.profiles p ON p.id = b.owner_id
WHERE b.organization_id IS NOT NULL
  AND b.owner_id IS NOT NULL ON CONFLICT (organization_id, user_id) DO NOTHING;
-- Sync org plan from business subscription_plan
UPDATE public.organizations o
SET plan = b.subscription_plan,
  subscription_status = b.subscription_status
FROM public.businesses b
WHERE b.organization_id = o.id
  AND b.owner_id IS NOT NULL;