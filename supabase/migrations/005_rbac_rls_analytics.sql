-- Fadely: RLS for SaaS tables + analytics views/RPCs
-- ── Organizations RLS ─────────────────────────────────────────────────────────
CREATE POLICY "organizations_member_select" ON public.organizations FOR
SELECT TO authenticated USING (
    EXISTS (
      SELECT 1
      FROM public.organization_members om
      WHERE om.organization_id = organizations.id
        AND om.user_id = auth.uid()
        AND om.is_active = true
    )
    OR EXISTS (
      SELECT 1
      FROM public.businesses b
      WHERE b.organization_id = organizations.id
        AND b.owner_id = auth.uid()
    )
  );
CREATE POLICY "organizations_owner_update" ON public.organizations FOR
UPDATE TO authenticated USING (public.has_org_permission(id, 'settings:write')) WITH CHECK (public.has_org_permission(id, 'settings:write'));
-- ── Organization members RLS ────────────────────────────────────────────────
CREATE POLICY "org_members_select" ON public.organization_members FOR
SELECT TO authenticated USING (
    user_id = auth.uid()
    OR public.has_org_permission(organization_id, 'members:read')
    OR public.has_org_permission(organization_id, 'members:write')
  );
CREATE POLICY "org_members_manage" ON public.organization_members FOR ALL TO authenticated USING (
  public.has_org_permission(organization_id, 'members:write')
) WITH CHECK (
  public.has_org_permission(organization_id, 'members:write')
);
-- ── Payments RLS ──────────────────────────────────────────────────────────────
CREATE POLICY "payments_select" ON public.payments FOR
SELECT TO authenticated USING (
    public.has_business_permission(business_id, 'financial:read')
  );
CREATE POLICY "payments_insert" ON public.payments FOR
INSERT TO authenticated WITH CHECK (
    public.has_business_permission(business_id, 'financial:write')
  );
CREATE POLICY "payments_update" ON public.payments FOR
UPDATE TO authenticated USING (
    public.has_business_permission(business_id, 'financial:write')
  ) WITH CHECK (
    public.has_business_permission(business_id, 'financial:write')
  );
-- ── Subscriptions RLS (billing only) ─────────────────────────────────────────
CREATE POLICY "subscriptions_select" ON public.subscriptions FOR
SELECT TO authenticated USING (
    public.has_org_permission(organization_id, 'billing:read')
  );
CREATE POLICY "subscriptions_service_role" ON public.subscriptions FOR ALL TO service_role USING (true) WITH CHECK (true);
-- ── User notifications RLS ────────────────────────────────────────────────────
CREATE POLICY "user_notifications_own" ON public.user_notifications FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
-- ── Audit logs RLS ────────────────────────────────────────────────────────────
CREATE POLICY "audit_logs_read" ON public.audit_logs FOR
SELECT TO authenticated USING (
    public.has_org_permission(organization_id, 'audit:read')
  );
-- ── Blocked slots RLS ─────────────────────────────────────────────────────────
CREATE POLICY "blocked_slots_read" ON public.blocked_time_slots FOR
SELECT TO authenticated USING (
    public.has_business_permission(business_id, 'appointments:read')
  );
CREATE POLICY "blocked_slots_write" ON public.blocked_time_slots FOR ALL TO authenticated USING (
  public.has_business_permission(business_id, 'appointments:write')
) WITH CHECK (
  public.has_business_permission(business_id, 'appointments:write')
);
-- ── Recurrence RLS ────────────────────────────────────────────────────────────
CREATE POLICY "recurrence_access" ON public.appointment_recurrence FOR ALL TO authenticated USING (
  public.has_business_permission(business_id, 'appointments:read')
) WITH CHECK (
  public.has_business_permission(business_id, 'appointments:write')
);
-- ── WhatsApp messages RLS ─────────────────────────────────────────────────────
CREATE POLICY "whatsapp_messages_access" ON public.whatsapp_messages FOR ALL TO authenticated USING (
  public.has_business_permission(business_id, 'settings:write')
) WITH CHECK (
  public.has_business_permission(business_id, 'settings:write')
);
-- plan_features: read-only for authenticated
ALTER TABLE public.plan_features ENABLE ROW LEVEL SECURITY;
CREATE POLICY "plan_features_read" ON public.plan_features FOR
SELECT TO authenticated USING (true);
CREATE POLICY "plan_features_read_anon" ON public.plan_features FOR
SELECT TO anon USING (true);
-- role_permission_grants: read for authenticated
ALTER TABLE public.role_permission_grants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "role_permissions_read" ON public.role_permission_grants FOR
SELECT TO authenticated USING (true);
-- ── Analytics: dashboard metrics RPC ────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.get_dashboard_metrics(
    p_business_id uuid,
    p_from date DEFAULT (current_date - interval '30 days')::date,
    p_to date DEFAULT current_date
  ) RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER
SET search_path = public AS $$
DECLARE result jsonb;
rev numeric;
appt_count int;
client_count int;
emp_count int;
cancelled int;
BEGIN IF NOT public.has_business_permission(p_business_id, 'analytics:read')
AND NOT public.is_business_owner(p_business_id, auth.uid()) THEN RAISE EXCEPTION 'forbidden';
END IF;
SELECT COALESCE(SUM(amount), 0) INTO rev
FROM public.payments
WHERE business_id = p_business_id
  AND status = 'paid'
  AND created_at::date BETWEEN p_from AND p_to;
SELECT COUNT(*) INTO appt_count
FROM public.appointments
WHERE business_id = p_business_id
  AND date BETWEEN p_from AND p_to
  AND status NOT IN ('cancelled');
SELECT COUNT(*) INTO cancelled
FROM public.appointments
WHERE business_id = p_business_id
  AND date BETWEEN p_from AND p_to
  AND status = 'cancelled';
SELECT COUNT(*) INTO client_count
FROM public.clients
WHERE business_id = p_business_id;
SELECT COUNT(*) INTO emp_count
FROM public.employees
WHERE business_id = p_business_id
  AND is_active = true;
result := jsonb_build_object(
  'revenue',
  rev,
  'appointments',
  appt_count,
  'cancelled_appointments',
  cancelled,
  'cancellation_rate',
  CASE
    WHEN appt_count + cancelled > 0 THEN round(
      cancelled::numeric / (appt_count + cancelled) * 100,
      2
    )
    ELSE 0
  END,
  'active_clients',
  client_count,
  'active_employees',
  emp_count,
  'period',
  jsonb_build_object('from', p_from, 'to', p_to)
);
RETURN result;
END;
$$;
REVOKE ALL ON FUNCTION public.get_dashboard_metrics(uuid, date, date)
FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_dashboard_metrics(uuid, date, date) TO authenticated;
-- Employee dashboard metrics
CREATE OR REPLACE FUNCTION public.get_employee_dashboard_metrics(
    p_employee_id uuid,
    p_from date DEFAULT current_date,
    p_to date DEFAULT current_date
  ) RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER
SET search_path = public AS $$
DECLARE e public.employees %ROWTYPE;
today_count int;
upcoming jsonb;
commission numeric;
BEGIN
SELECT * INTO e
FROM public.employees
WHERE id = p_employee_id;
IF NOT FOUND THEN RAISE EXCEPTION 'not_found';
END IF;
IF NOT (
  public.is_business_owner(e.business_id, auth.uid())
  OR (e.auth_user_id = auth.uid())
  OR (
    e.is_linked
    AND lower(e.user_email) = lower(auth.jwt()->>'email')
  )
) THEN RAISE EXCEPTION 'forbidden';
END IF;
SELECT COUNT(*) INTO today_count
FROM public.appointments a
WHERE a.employee_id = p_employee_id
  AND a.date BETWEEN p_from AND p_to
  AND a.status NOT IN ('cancelled', 'no_show');
SELECT COALESCE(jsonb_agg(row_to_json(x.*)), '[]'::jsonb) INTO upcoming
FROM (
    SELECT id,
      client_name,
      service_name,
      date,
      time,
      status
    FROM public.appointments
    WHERE employee_id = p_employee_id
      AND date >= current_date
      AND status IN ('scheduled', 'confirmed')
    ORDER BY date,
      time
    LIMIT 10
  ) x;
SELECT COALESCE(
    SUM(
      a.price * COALESCE(e.commission_percentage, 0) / 100
    ),
    0
  ) INTO commission
FROM public.appointments a
WHERE a.employee_id = p_employee_id
  AND a.status = 'completed'
  AND a.date BETWEEN p_from AND p_to;
RETURN jsonb_build_object(
  'appointments_today',
  today_count,
  'upcoming',
  upcoming,
  'commission_estimate',
  commission,
  'commission_percentage',
  e.commission_percentage
);
END;
$$;
REVOKE ALL ON FUNCTION public.get_employee_dashboard_metrics(uuid, date, date)
FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_employee_dashboard_metrics(uuid, date, date) TO authenticated;
-- Top services analytics
CREATE OR REPLACE FUNCTION public.get_top_services(p_business_id uuid, p_limit int DEFAULT 5) RETURNS TABLE (
    service_id uuid,
    service_name text,
    booking_count bigint,
    revenue numeric
  ) LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public AS $$
SELECT a.service_id,
  COALESCE(a.service_name, s.name, 'Sem nome') AS service_name,
  COUNT(*)::bigint AS booking_count,
  COALESCE(SUM(a.price), 0)::numeric AS revenue
FROM public.appointments a
  LEFT JOIN public.services s ON s.id = a.service_id
WHERE a.business_id = p_business_id
  AND a.status = 'completed'
  AND public.has_business_permission(p_business_id, 'analytics:read')
GROUP BY a.service_id,
  COALESCE(a.service_name, s.name, 'Sem nome')
ORDER BY booking_count DESC
LIMIT p_limit;
$$;
REVOKE ALL ON FUNCTION public.get_top_services(uuid, int)
FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_top_services(uuid, int) TO authenticated;
-- Busiest hours
CREATE OR REPLACE FUNCTION public.get_busiest_hours(p_business_id uuid) RETURNS TABLE (hour_slot int, appointment_count bigint) LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public AS $$
SELECT EXTRACT(
    HOUR
    FROM (a.date::text || ' ' || COALESCE(a.time, '12:00'))::timestamptz
  )::int AS hour_slot,
  COUNT(*)::bigint AS appointment_count
FROM public.appointments a
WHERE a.business_id = p_business_id
  AND a.status NOT IN ('cancelled', 'no_show')
  AND public.has_business_permission(p_business_id, 'analytics:read')
GROUP BY 1
ORDER BY appointment_count DESC;
$$;
REVOKE ALL ON FUNCTION public.get_busiest_hours(uuid)
FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_busiest_hours(uuid) TO authenticated;
-- Create organization + first business (onboarding)
CREATE OR REPLACE FUNCTION public.create_organization_with_business(
    p_org_name text,
    p_business_name text,
    p_business_type text DEFAULT 'salon',
    p_slug text DEFAULT NULL
  ) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public AS $$
DECLARE v_org public.organizations %ROWTYPE;
v_business public.businesses %ROWTYPE;
v_slug text;
v_user_id uuid := auth.uid();
v_email text := auth.jwt()->>'email';
BEGIN IF v_user_id IS NULL THEN RAISE EXCEPTION 'unauthorized';
END IF;
v_slug := COALESCE(
  NULLIF(trim(p_slug), ''),
  public.slugify(p_org_name)
);
IF EXISTS (
  SELECT 1
  FROM public.organizations
  WHERE slug = v_slug
) THEN v_slug := v_slug || '-' || left(gen_random_uuid()::text, 8);
END IF;
INSERT INTO public.organizations (
    name,
    slug,
    plan,
    subscription_status,
    trial_ends_at
  )
VALUES (
    p_org_name,
    v_slug,
    'free_trial',
    'trial',
    (current_date + interval '14 days')::timestamptz
  )
RETURNING * INTO v_org;
INSERT INTO public.organization_members (organization_id, user_id, role, email)
VALUES (v_org.id, v_user_id, 'owner', v_email) ON CONFLICT (organization_id, user_id) DO
UPDATE
SET role = 'owner',
  is_active = true;
INSERT INTO public.businesses (
    owner_id,
    owner_email,
    name,
    type,
    slug,
    organization_id,
    subscription_plan,
    subscription_status,
    trial_end_date,
    onboarding_completed
  )
VALUES (
    v_user_id,
    v_email,
    p_business_name,
    p_business_type,
    v_slug,
    v_org.id,
    'free_trial',
    'trial',
    (current_date + 14),
    false
  )
RETURNING * INTO v_business;
RETURN jsonb_build_object(
  'organization',
  row_to_json(v_org),
  'business',
  row_to_json(v_business)
);
END;
$$;
REVOKE ALL ON FUNCTION public.create_organization_with_business(text, text, text, text)
FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_organization_with_business(text, text, text, text) TO authenticated;
-- Realtime publication (idempotent)
DO $$ BEGIN ALTER PUBLICATION supabase_realtime
ADD TABLE public.user_notifications;
EXCEPTION
WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN ALTER PUBLICATION supabase_realtime
ADD TABLE public.appointments;
EXCEPTION
WHEN duplicate_object THEN NULL;
END $$;