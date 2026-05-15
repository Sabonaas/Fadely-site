-- Fadely: schema + RLS for Supabase (run in SQL Editor or `supabase db push`)
-- Requires: extensions pgcrypto (gen_random_uuid) — enabled by default on Supabase

-- ── Profiles (mirror auth user metadata) ───────────────────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  full_name text,
  avatar_url text,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT USING (id = auth.uid());
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (id = auth.uid()) WITH CHECK (id = auth.uid());
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT WITH CHECK (id = auth.uid());

-- ── Businesses ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.businesses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  owner_email text,
  name text NOT NULL,
  email text,
  type text NOT NULL DEFAULT 'salon',
  categories text[] DEFAULT '{}',
  slug text UNIQUE,
  employee_count int DEFAULT 1,
  phone text,
  phone_ddi text DEFAULT '+55',
  phone2 text,
  phone2_ddi text DEFAULT '+55',
  address text,
  address_number text,
  address_complement text,
  address_neighborhood text,
  address_city text,
  address_state text,
  address_country text DEFAULT 'Brasil',
  address_zip text,
  address_lat double precision,
  address_lng double precision,
  social_instagram text,
  social_youtube text,
  social_tiktok text,
  social_facebook text,
  logo_url text,
  onboarding_completed boolean DEFAULT false,
  subscription_plan text DEFAULT 'free_trial',
  subscription_status text DEFAULT 'trial',
  trial_end_date date,
  whatsapp_connected boolean DEFAULT false,
  booking_page_enabled boolean DEFAULT true,
  working_hours jsonb DEFAULT '{"open":"08:00","close":"18:00"}'::jsonb,
  schedule_settings jsonb,
  invite_code text UNIQUE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_businesses_owner ON public.businesses (owner_id);
CREATE INDEX IF NOT EXISTS idx_businesses_slug ON public.businesses (slug);

ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;

-- Owner check without RLS recursion: SELECT businesses → businesses_employee_read → employees →
-- employees_owner_all used to re-query businesses (42P17 infinite recursion).
CREATE OR REPLACE FUNCTION public.is_business_owner(p_business_id uuid, p_uid uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
SET row_security = off
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.businesses b
    WHERE b.id = p_business_id AND b.owner_id IS NOT DISTINCT FROM p_uid
  );
$$;

REVOKE ALL ON FUNCTION public.is_business_owner(uuid, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_business_owner(uuid, uuid) TO authenticated;

-- Owner full access
CREATE POLICY "businesses_owner_all" ON public.businesses FOR ALL
  USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());

-- Public booking: anon can read enabled businesses (by slug in app query)
CREATE POLICY "businesses_anon_public_read" ON public.businesses FOR SELECT TO anon
  USING (booking_page_enabled = true);

-- ── Job roles ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.job_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES public.businesses (id) ON DELETE CASCADE,
  name text NOT NULL,
  color text DEFAULT '#4F8EF7',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.job_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "job_roles_owner" ON public.job_roles FOR ALL
  USING (public.is_business_owner(job_roles.business_id, auth.uid()))
  WITH CHECK (public.is_business_owner(job_roles.business_id, auth.uid()));

-- ── Employees (created after job_roles for FK ordering — reorder: employees refs job_roles optional)
CREATE TABLE IF NOT EXISTS public.employees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES public.businesses (id) ON DELETE CASCADE,
  name text NOT NULL,
  email text,
  phone text,
  role text,
  job_role_id uuid REFERENCES public.job_roles (id) ON DELETE SET NULL,
  avatar_url text,
  service_ids uuid[] DEFAULT '{}',
  is_active boolean DEFAULT true,
  working_hours jsonb,
  color text DEFAULT '#4F8EF7',
  user_email text,
  is_linked boolean DEFAULT false,
  auth_user_id uuid REFERENCES auth.users (id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_employees_business ON public.employees (business_id);
CREATE INDEX IF NOT EXISTS idx_employees_auth ON public.employees (auth_user_id);

ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;

CREATE POLICY "employees_owner_all" ON public.employees FOR ALL
  USING (public.is_business_owner(employees.business_id, auth.uid()))
  WITH CHECK (public.is_business_owner(employees.business_id, auth.uid()));

CREATE POLICY "employees_self_read" ON public.employees FOR SELECT
  USING (
    auth_user_id = auth.uid()
    OR (is_linked = true AND lower(user_email) = lower(auth.jwt() ->> 'email'))
  );

-- Employees of a business with public booking (for /book/:slug)
CREATE POLICY "employees_anon_public_read" ON public.employees FOR SELECT TO anon
  USING (
    is_active = true
    AND EXISTS (
      SELECT 1 FROM public.businesses b
      WHERE b.id = employees.business_id AND b.booking_page_enabled = true
    )
  );

-- Linked employees: read their business (requires employees table)
CREATE POLICY "businesses_employee_read" ON public.businesses FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.employees e
      WHERE e.business_id = businesses.id
        AND e.is_linked = true
        AND (e.auth_user_id = auth.uid() OR lower(e.user_email) = lower(auth.jwt() ->> 'email'))
    )
  );

-- ── Services ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES public.businesses (id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  price numeric NOT NULL DEFAULT 0,
  duration int NOT NULL DEFAULT 30,
  category text,
  employee_ids uuid[] DEFAULT '{}',
  is_active boolean DEFAULT true,
  color text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "services_owner" ON public.services FOR ALL
  USING (public.is_business_owner(services.business_id, auth.uid()))
  WITH CHECK (public.is_business_owner(services.business_id, auth.uid()));

CREATE POLICY "services_employee_read" ON public.services FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.employees e
      WHERE e.business_id = services.business_id AND e.is_linked = true
        AND (e.auth_user_id = auth.uid() OR lower(e.user_email) = lower(auth.jwt() ->> 'email'))
    )
  );

CREATE POLICY "services_anon_public_read" ON public.services FOR SELECT TO anon
  USING (
    is_active = true
    AND EXISTS (SELECT 1 FROM public.businesses b WHERE b.id = services.business_id AND b.booking_page_enabled = true)
  );

-- ── Clients ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES public.businesses (id) ON DELETE CASCADE,
  name text NOT NULL,
  email text,
  phone text,
  notes text,
  birthday date,
  avatar_url text,
  total_visits int DEFAULT 0,
  total_spent numeric DEFAULT 0,
  last_visit date,
  tags text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "clients_owner" ON public.clients FOR ALL
  USING (public.is_business_owner(clients.business_id, auth.uid()))
  WITH CHECK (public.is_business_owner(clients.business_id, auth.uid()));

CREATE POLICY "clients_employee" ON public.clients FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.employees e
      WHERE e.business_id = clients.business_id AND e.is_linked = true
        AND (e.auth_user_id = auth.uid() OR lower(e.user_email) = lower(auth.jwt() ->> 'email'))
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.employees e
      WHERE e.business_id = clients.business_id AND e.is_linked = true
        AND (e.auth_user_id = auth.uid() OR lower(e.user_email) = lower(auth.jwt() ->> 'email'))
    )
  );

CREATE POLICY "clients_anon_insert" ON public.clients FOR INSERT TO anon
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.businesses b WHERE b.id = clients.business_id AND b.booking_page_enabled = true)
  );

-- ── Appointments ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES public.businesses (id) ON DELETE CASCADE,
  service_id uuid REFERENCES public.services (id) ON DELETE SET NULL,
  service_name text,
  employee_id uuid REFERENCES public.employees (id) ON DELETE SET NULL,
  employee_name text,
  client_id uuid REFERENCES public.clients (id) ON DELETE SET NULL,
  client_name text,
  client_phone text,
  client_email text,
  date date NOT NULL,
  time text NOT NULL,
  duration int DEFAULT 50,
  price numeric DEFAULT 0,
  status text DEFAULT 'scheduled',
  notes text,
  source text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_appointments_business_date ON public.appointments (business_id, date);

ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "appointments_owner" ON public.appointments FOR ALL
  USING (public.is_business_owner(appointments.business_id, auth.uid()))
  WITH CHECK (public.is_business_owner(appointments.business_id, auth.uid()));

CREATE POLICY "appointments_employee" ON public.appointments FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.employees e
      WHERE e.business_id = appointments.business_id AND e.is_linked = true
        AND (e.auth_user_id = auth.uid() OR lower(e.user_email) = lower(auth.jwt() ->> 'email'))
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.employees e
      WHERE e.business_id = appointments.business_id AND e.is_linked = true
        AND (e.auth_user_id = auth.uid() OR lower(e.user_email) = lower(auth.jwt() ->> 'email'))
    )
  );

CREATE POLICY "appointments_anon_insert" ON public.appointments FOR INSERT TO anon
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.businesses b WHERE b.id = appointments.business_id AND b.booking_page_enabled = true)
  );

-- ── Notifications ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES public.businesses (id) ON DELETE CASCADE,
  appointment_id uuid REFERENCES public.appointments (id) ON DELETE SET NULL,
  type text NOT NULL,
  channel text DEFAULT 'whatsapp',
  recipient_phone text,
  recipient_name text,
  message text,
  status text DEFAULT 'pending',
  scheduled_for timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "notifications_owner" ON public.notifications FOR ALL
  USING (public.is_business_owner(notifications.business_id, auth.uid()))
  WITH CHECK (public.is_business_owner(notifications.business_id, auth.uid()));

CREATE POLICY "notifications_employee" ON public.notifications FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.employees e
      WHERE e.business_id = notifications.business_id AND e.is_linked = true
        AND (e.auth_user_id = auth.uid() OR lower(e.user_email) = lower(auth.jwt() ->> 'email'))
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.employees e
      WHERE e.business_id = notifications.business_id AND e.is_linked = true
        AND (e.auth_user_id = auth.uid() OR lower(e.user_email) = lower(auth.jwt() ->> 'email'))
    )
  );

CREATE POLICY "notifications_anon_insert" ON public.notifications FOR INSERT TO anon
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.businesses b WHERE b.id = notifications.business_id AND b.booking_page_enabled = true)
  );

-- ── Invite RPCs (SECURITY DEFINER) ───────────────────────────────────────
CREATE OR REPLACE FUNCTION public.invite_preview(p_employee_id uuid, p_invite_code text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  r jsonb;
BEGIN
  IF p_employee_id IS NOT NULL THEN
    SELECT jsonb_build_object(
      'employee', row_to_json(e.*)::jsonb,
      'business', row_to_json(b.*)::jsonb
    ) INTO r
    FROM employees e
    JOIN businesses b ON b.id = e.business_id
    WHERE e.id = p_employee_id;
    RETURN COALESCE(r, '{}'::jsonb);
  ELSIF p_invite_code IS NOT NULL AND length(trim(p_invite_code)) > 0 THEN
    SELECT jsonb_build_object('employee', NULL, 'business', row_to_json(b.*)::jsonb)
    INTO r
    FROM businesses b
    WHERE b.invite_code = p_invite_code;
    RETURN COALESCE(r, '{}'::jsonb);
  END IF;
  RETURN '{}'::jsonb;
END;
$$;

REVOKE ALL ON FUNCTION public.invite_preview(uuid, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.invite_preview(uuid, text) TO authenticated;

CREATE OR REPLACE FUNCTION public.accept_invite(
  p_employee_id uuid,
  p_invite_code text,
  p_user_id uuid,
  p_email text,
  p_full_name text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  b businesses%ROWTYPE;
  e employees%ROWTYPE;
BEGIN
  IF p_user_id IS NULL OR p_user_id <> auth.uid() THEN
    RAISE EXCEPTION 'forbidden';
  END IF;

  IF p_employee_id IS NOT NULL THEN
    SELECT * INTO e FROM employees WHERE id = p_employee_id FOR UPDATE;
    IF NOT FOUND THEN RAISE EXCEPTION 'not_found'; END IF;
    IF e.is_linked THEN RAISE EXCEPTION 'already_linked'; END IF;
    UPDATE employees
    SET user_email = p_email, auth_user_id = p_user_id, is_linked = true, updated_at = now()
    WHERE id = p_employee_id;
    RETURN jsonb_build_object('ok', true);
  ELSIF p_invite_code IS NOT NULL AND length(trim(p_invite_code)) > 0 THEN
    SELECT * INTO b FROM businesses WHERE invite_code = p_invite_code;
    IF NOT FOUND THEN RAISE EXCEPTION 'not_found'; END IF;
    INSERT INTO employees (name, email, business_id, user_email, auth_user_id, is_linked, is_active)
    VALUES (
      COALESCE(NULLIF(trim(p_full_name), ''), p_email),
      p_email,
      b.id,
      p_email,
      p_user_id,
      true,
      true
    );
    RETURN jsonb_build_object('ok', true);
  END IF;
  RAISE EXCEPTION 'bad_request';
END;
$$;

REVOKE ALL ON FUNCTION public.accept_invite(uuid, text, uuid, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.accept_invite(uuid, text, uuid, text, text) TO authenticated;

-- ── New user → profile ─────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (new.id, COALESCE(new.raw_user_meta_data ->> 'full_name', ''))
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
