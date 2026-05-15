-- Coupons, multi-service appointments, secure employee invites, avatars storage

-- ── appointment_services (many-to-many) ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.appointment_services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id uuid NOT NULL REFERENCES public.appointments (id) ON DELETE CASCADE,
  service_id uuid NOT NULL REFERENCES public.services (id) ON DELETE RESTRICT,
  service_name text,
  duration int NOT NULL DEFAULT 30,
  price numeric(12,2) NOT NULL DEFAULT 0,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (appointment_id, service_id)
);

CREATE INDEX IF NOT EXISTS idx_appointment_services_appt ON public.appointment_services (appointment_id);

ALTER TABLE public.appointment_services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "appointment_services_access" ON public.appointment_services FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.appointments a
      WHERE a.id = appointment_services.appointment_id
        AND public.has_business_permission(a.business_id, 'appointments:read')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.appointments a
      WHERE a.id = appointment_services.appointment_id
        AND public.has_business_permission(a.business_id, 'appointments:write')
    )
  );

CREATE POLICY "appointment_services_anon_insert" ON public.appointment_services FOR INSERT
  TO anon
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.appointments a
      JOIN public.businesses b ON b.id = a.business_id
      WHERE a.id = appointment_services.appointment_id AND b.booking_page_enabled = true
    )
  );

-- ── Coupons ───────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.coupons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES public.businesses (id) ON DELETE CASCADE,
  organization_id uuid REFERENCES public.organizations (id) ON DELETE CASCADE,
  code text NOT NULL,
  name text NOT NULL,
  discount_percent numeric(5,2) NOT NULL CHECK (discount_percent > 0 AND discount_percent <= 100),
  max_uses int,
  uses_count int NOT NULL DEFAULT 0,
  starts_at timestamptz NOT NULL,
  ends_at timestamptz NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_by uuid REFERENCES auth.users (id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (business_id, code),
  CHECK (ends_at > starts_at)
);

CREATE INDEX IF NOT EXISTS idx_coupons_business ON public.coupons (business_id, is_active);

ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "coupons_owner" ON public.coupons FOR ALL
  TO authenticated
  USING (public.has_business_permission(business_id, 'settings:write'))
  WITH CHECK (public.has_business_permission(business_id, 'settings:write'));

CREATE TABLE IF NOT EXISTS public.coupon_redemptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  coupon_id uuid NOT NULL REFERENCES public.coupons (id) ON DELETE CASCADE,
  business_id uuid NOT NULL REFERENCES public.businesses (id) ON DELETE CASCADE,
  client_id uuid REFERENCES public.clients (id) ON DELETE SET NULL,
  appointment_id uuid REFERENCES public.appointments (id) ON DELETE SET NULL,
  discount_applied numeric(12,2),
  redeemed_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_coupon_redemptions_coupon ON public.coupon_redemptions (coupon_id);

ALTER TABLE public.coupon_redemptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "coupon_redemptions_access" ON public.coupon_redemptions FOR ALL
  TO authenticated
  USING (public.has_business_permission(business_id, 'financial:read'))
  WITH CHECK (public.has_business_permission(business_id, 'financial:write'));

-- Validate coupon RPC
CREATE OR REPLACE FUNCTION public.validate_coupon(
  p_business_id uuid,
  p_code text,
  p_client_id uuid DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
SET row_security = off
AS $$
DECLARE
  c public.coupons%ROWTYPE;
BEGIN
  SELECT * INTO c FROM public.coupons
  WHERE business_id = p_business_id
    AND lower(code) = lower(trim(p_code))
    AND is_active = true;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('valid', false, 'error', 'Cupom inválido');
  END IF;
  IF now() < c.starts_at THEN
    RETURN jsonb_build_object('valid', false, 'error', 'Cupom ainda não está ativo');
  END IF;
  IF now() > c.ends_at THEN
    RETURN jsonb_build_object('valid', false, 'error', 'Cupom expirado');
  END IF;
  IF c.max_uses IS NOT NULL AND c.uses_count >= c.max_uses THEN
    RETURN jsonb_build_object('valid', false, 'error', 'Cupom esgotado');
  END IF;
  RETURN jsonb_build_object(
    'valid', true,
    'coupon_id', c.id,
    'code', c.code,
    'name', c.name,
    'discount_percent', c.discount_percent
  );
END;
$$;

REVOKE ALL ON FUNCTION public.validate_coupon(uuid, text, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.validate_coupon(uuid, text, uuid) TO authenticated, anon;

-- ── Employee invites (secure tokens) ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.employee_invites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES public.businesses (id) ON DELETE CASCADE,
  organization_id uuid REFERENCES public.organizations (id) ON DELETE CASCADE,
  employee_id uuid REFERENCES public.employees (id) ON DELETE CASCADE,
  token text UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
  email text,
  role public.member_role DEFAULT 'employee',
  status text NOT NULL DEFAULT 'pending',
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '7 days'),
  used_at timestamptz,
  used_by uuid REFERENCES auth.users (id) ON DELETE SET NULL,
  created_by uuid REFERENCES auth.users (id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_employee_invites_token ON public.employee_invites (token) WHERE status = 'pending';

ALTER TABLE public.employee_invites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "employee_invites_manage" ON public.employee_invites FOR ALL
  TO authenticated
  USING (public.has_business_permission(business_id, 'employees:write'))
  WITH CHECK (public.has_business_permission(business_id, 'employees:write'));

CREATE OR REPLACE FUNCTION public.create_employee_invite(
  p_business_id uuid,
  p_employee_id uuid DEFAULT NULL,
  p_email text DEFAULT NULL,
  p_days_valid int DEFAULT 7
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  inv public.employee_invites%ROWTYPE;
  org_id uuid;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'unauthorized'; END IF;
  IF NOT public.has_business_permission(p_business_id, 'employees:write') THEN
    RAISE EXCEPTION 'forbidden';
  END IF;
  org_id := public.get_business_organization_id(p_business_id);
  INSERT INTO public.employee_invites (
    business_id, organization_id, employee_id, email, expires_at, created_by, status
  )
  VALUES (
    p_business_id, org_id, p_employee_id, p_email,
    now() + (p_days_valid || ' days')::interval, auth.uid(), 'pending'
  )
  RETURNING * INTO inv;
  RETURN jsonb_build_object(
    'id', inv.id,
    'token', inv.token,
    'expires_at', inv.expires_at
  );
END;
$$;

REVOKE ALL ON FUNCTION public.create_employee_invite(uuid, uuid, text, int) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_employee_invite(uuid, uuid, text, int) TO authenticated;

CREATE OR REPLACE FUNCTION public.accept_employee_invite_token(
  p_token text,
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
  inv public.employee_invites%ROWTYPE;
BEGIN
  IF p_user_id IS NULL OR p_user_id <> auth.uid() THEN RAISE EXCEPTION 'forbidden'; END IF;
  SELECT * INTO inv FROM public.employee_invites
  WHERE token = p_token AND status = 'pending' FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'invalid_invite'; END IF;
  IF inv.expires_at < now() THEN
    UPDATE public.employee_invites SET status = 'expired' WHERE id = inv.id;
    RAISE EXCEPTION 'invite_expired';
  END IF;
  IF inv.used_at IS NOT NULL THEN RAISE EXCEPTION 'invite_used'; END IF;

  IF inv.employee_id IS NOT NULL THEN
    UPDATE public.employees
    SET user_email = p_email, auth_user_id = p_user_id, is_linked = true, updated_at = now()
    WHERE id = inv.employee_id;
  ELSE
    INSERT INTO public.employees (name, email, business_id, user_email, auth_user_id, is_linked, is_active)
    VALUES (COALESCE(NULLIF(trim(p_full_name), ''), p_email), p_email, inv.business_id, p_email, p_user_id, true, true);
  END IF;

  IF inv.organization_id IS NOT NULL THEN
    INSERT INTO public.organization_members (organization_id, user_id, role, email, full_name, employee_id)
    VALUES (inv.organization_id, p_user_id, COALESCE(inv.role, 'employee'), p_email, p_full_name, inv.employee_id)
    ON CONFLICT (organization_id, user_id) DO UPDATE SET is_active = true, role = EXCLUDED.role;
  END IF;

  UPDATE public.employee_invites
  SET status = 'accepted', used_at = now(), used_by = p_user_id
  WHERE id = inv.id;

  RETURN jsonb_build_object('ok', true, 'business_id', inv.business_id);
END;
$$;

REVOKE ALL ON FUNCTION public.accept_employee_invite_token(text, uuid, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.accept_employee_invite_token(text, uuid, text, text) TO authenticated;

-- ── Storage buckets (avatars) ─────────────────────────────────────────────────
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

CREATE POLICY "avatars_public_read" ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "avatars_auth_upload" ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "avatars_auth_update" ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "avatars_auth_delete" ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Create appointment with multiple services
CREATE OR REPLACE FUNCTION public.create_appointment_with_services(
  p_appointment jsonb,
  p_services jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  appt public.appointments%ROWTYPE;
  svc jsonb;
  total_duration int := 0;
  total_price numeric := 0;
  sort_i int := 0;
  biz_id uuid := (p_appointment ->> 'business_id')::uuid;
  emp_id uuid := NULLIF(p_appointment ->> 'employee_id', '')::uuid;
  start_ts timestamptz;
  end_ts timestamptz;
BEGIN
  FOR svc IN SELECT * FROM jsonb_array_elements(p_services) LOOP
    total_duration := total_duration + COALESCE((svc ->> 'duration')::int, 30);
    total_price := total_price + COALESCE((svc ->> 'price')::numeric, 0);
  END LOOP;

  start_ts := COALESCE(
    (p_appointment ->> 'start_at')::timestamptz,
    ((p_appointment ->> 'date') || ' ' || COALESCE(p_appointment ->> 'time', '09:00'))::timestamptz
  );
  end_ts := COALESCE((p_appointment ->> 'end_at')::timestamptz, start_ts + (total_duration || ' minutes')::interval);

  IF public.check_appointment_conflict(biz_id, emp_id, start_ts, end_ts, NULL) THEN
    RAISE EXCEPTION 'appointment_conflict';
  END IF;

  INSERT INTO public.appointments (
    business_id, service_id, service_name, employee_id, employee_name,
    client_id, client_name, client_phone, client_email,
    date, time, start_at, end_at, duration, price, status, notes, source
  )
  VALUES (
    biz_id,
    (p_services -> 0 ->> 'service_id')::uuid,
    p_services -> 0 ->> 'service_name',
    emp_id,
    p_appointment ->> 'employee_name',
    NULLIF(p_appointment ->> 'client_id', '')::uuid,
    p_appointment ->> 'client_name',
    p_appointment ->> 'client_phone',
    p_appointment ->> 'client_email',
    COALESCE(p_appointment ->> 'date', to_char(start_ts, 'YYYY-MM-DD')),
    COALESCE(p_appointment ->> 'time', to_char(start_ts, 'HH24:MI')),
    start_ts, end_ts, total_duration, total_price,
    COALESCE(p_appointment ->> 'status', 'scheduled'),
    p_appointment ->> 'notes',
    COALESCE(p_appointment ->> 'source', 'booking_page')
  )
  RETURNING * INTO appt;

  FOR svc IN SELECT * FROM jsonb_array_elements(p_services) LOOP
    INSERT INTO public.appointment_services (appointment_id, service_id, service_name, duration, price, sort_order)
    VALUES (
      appt.id,
      (svc ->> 'service_id')::uuid,
      svc ->> 'service_name',
      COALESCE((svc ->> 'duration')::int, 30),
      COALESCE((svc ->> 'price')::numeric, 0),
      sort_i
    );
    sort_i := sort_i + 1;
  END LOOP;

  RETURN jsonb_build_object('appointment', row_to_json(appt), 'total_duration', total_duration, 'total_price', total_price);
END;
$$;

REVOKE ALL ON FUNCTION public.create_appointment_with_services(jsonb, jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_appointment_with_services(jsonb, jsonb) TO authenticated, anon;
