-- Garante slug único em businesses (e organizations) — evita 23505 businesses_slug_key

CREATE OR REPLACE FUNCTION public.ensure_unique_business_slug(p_base text)
RETURNS text
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
SET row_security = off
AS $$
DECLARE
  v_base text;
  v_candidate text;
  v_suffix int := 0;
BEGIN
  v_base := COALESCE(NULLIF(trim(public.slugify(COALESCE(p_base, 'negocio'))), ''), 'negocio');
  v_candidate := v_base;

  WHILE EXISTS (SELECT 1 FROM public.businesses b WHERE b.slug IS NOT DISTINCT FROM v_candidate) LOOP
    v_suffix := v_suffix + 1;
    v_candidate := v_base || '-' || v_suffix::text;
    IF v_suffix > 50 THEN
      v_candidate := v_base || '-' || left(gen_random_uuid()::text, 8);
      EXIT;
    END IF;
  END LOOP;

  RETURN v_candidate;
END;
$$;

REVOKE ALL ON FUNCTION public.ensure_unique_business_slug(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.ensure_unique_business_slug(text) TO authenticated;

CREATE OR REPLACE FUNCTION public.ensure_unique_organization_slug(p_base text)
RETURNS text
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
SET row_security = off
AS $$
DECLARE
  v_base text;
  v_candidate text;
  v_suffix int := 0;
BEGIN
  v_base := COALESCE(NULLIF(trim(public.slugify(COALESCE(p_base, 'org'))), ''), 'org');
  v_candidate := v_base;

  WHILE EXISTS (SELECT 1 FROM public.organizations o WHERE o.slug = v_candidate) LOOP
    v_suffix := v_suffix + 1;
    v_candidate := v_base || '-' || v_suffix::text;
    IF v_suffix > 50 THEN
      v_candidate := v_base || '-' || left(gen_random_uuid()::text, 8);
      EXIT;
    END IF;
  END LOOP;

  RETURN v_candidate;
END;
$$;

REVOKE ALL ON FUNCTION public.ensure_unique_organization_slug(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.ensure_unique_organization_slug(text) TO authenticated;

-- Onboarding atômico: org + business + slug únicos
CREATE OR REPLACE FUNCTION public.complete_onboarding(
  p_business_name text,
  p_business_type text DEFAULT 'salon',
  p_employee_count int DEFAULT 1,
  p_phone text DEFAULT NULL,
  p_whatsapp_connected boolean DEFAULT false,
  p_open_time text DEFAULT '08:00',
  p_close_time text DEFAULT '18:00',
  p_slug_hint text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_email text := auth.jwt() ->> 'email';
  v_org_slug text;
  v_biz_slug text;
  v_org public.organizations%ROWTYPE;
  v_business public.businesses%ROWTYPE;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'unauthorized';
  END IF;

  SELECT * INTO v_business
  FROM public.businesses b
  WHERE b.owner_id = v_user_id
  ORDER BY b.onboarding_completed DESC, b.created_at DESC
  LIMIT 1;

  IF v_business.id IS NOT NULL AND v_business.onboarding_completed = true THEN
    RAISE EXCEPTION 'onboarding_already_completed';
  END IF;

  v_biz_slug := public.ensure_unique_business_slug(
    COALESCE(NULLIF(trim(p_slug_hint), ''), p_business_name)
  );

  IF v_business.organization_id IS NOT NULL THEN
    SELECT * INTO v_org FROM public.organizations WHERE id = v_business.organization_id;
  END IF;

  IF v_org.id IS NULL THEN
    v_org_slug := public.ensure_unique_organization_slug(p_business_name);
    INSERT INTO public.organizations (name, slug, plan, subscription_status, trial_ends_at)
    VALUES (p_business_name, v_org_slug, 'free_trial', 'trial', (current_date + interval '14 days')::timestamptz)
    RETURNING * INTO v_org;

    INSERT INTO public.organization_members (organization_id, user_id, role, email)
    VALUES (v_org.id, v_user_id, 'owner', v_email)
    ON CONFLICT (organization_id, user_id) DO UPDATE SET role = 'owner', is_active = true;
  END IF;

  IF v_business.id IS NOT NULL THEN
    UPDATE public.businesses
    SET
      name = p_business_name,
      type = p_business_type,
      slug = v_biz_slug,
      organization_id = COALESCE(organization_id, v_org.id),
      employee_count = GREATEST(1, COALESCE(p_employee_count, 1)),
      phone = p_phone,
      whatsapp_connected = COALESCE(p_whatsapp_connected, false),
      onboarding_completed = true,
      booking_page_enabled = true,
      working_hours = jsonb_build_object(
        'open', COALESCE(p_open_time, '08:00'),
        'close', COALESCE(p_close_time, '18:00')
      ),
      invite_code = COALESCE(invite_code, upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 12))),
      updated_at = now()
    WHERE id = v_business.id
    RETURNING * INTO v_business;
  ELSE
    INSERT INTO public.businesses (
      owner_id, owner_email, name, type, slug, organization_id,
      employee_count, phone, whatsapp_connected, onboarding_completed,
      subscription_plan, subscription_status, trial_end_date, booking_page_enabled,
      working_hours, invite_code
    )
    VALUES (
      v_user_id, v_email, p_business_name, p_business_type, v_biz_slug, v_org.id,
      GREATEST(1, COALESCE(p_employee_count, 1)), p_phone, COALESCE(p_whatsapp_connected, false), true,
      'free_trial', 'trial', (current_date + 14), true,
      jsonb_build_object('open', COALESCE(p_open_time, '08:00'), 'close', COALESCE(p_close_time, '18:00')),
      upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 12))
    )
    RETURNING * INTO v_business;
  END IF;

  RETURN jsonb_build_object('organization', row_to_json(v_org), 'business', row_to_json(v_business));
END;
$$;

REVOKE ALL ON FUNCTION public.complete_onboarding(text, text, int, text, boolean, text, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.complete_onboarding(text, text, int, text, boolean, text, text, text) TO authenticated;

-- Corrigir RPC existente: slugs distintos e únicos em cada tabela
CREATE OR REPLACE FUNCTION public.create_organization_with_business(
  p_org_name text,
  p_business_name text,
  p_business_type text DEFAULT 'salon',
  p_slug text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_org public.organizations%ROWTYPE;
  v_business public.businesses%ROWTYPE;
  v_org_slug text;
  v_biz_slug text;
  v_user_id uuid := auth.uid();
  v_email text := auth.jwt() ->> 'email';
BEGIN
  IF v_user_id IS NULL THEN RAISE EXCEPTION 'unauthorized'; END IF;

  v_org_slug := public.ensure_unique_organization_slug(
    COALESCE(NULLIF(trim(p_slug), ''), p_org_name)
  );
  v_biz_slug := public.ensure_unique_business_slug(
    COALESCE(NULLIF(trim(p_slug), ''), p_business_name)
  );

  INSERT INTO public.organizations (name, slug, plan, subscription_status, trial_ends_at)
  VALUES (p_org_name, v_org_slug, 'free_trial', 'trial', (current_date + interval '14 days')::timestamptz)
  RETURNING * INTO v_org;

  INSERT INTO public.organization_members (organization_id, user_id, role, email)
  VALUES (v_org.id, v_user_id, 'owner', v_email)
  ON CONFLICT (organization_id, user_id) DO UPDATE SET role = 'owner', is_active = true;

  INSERT INTO public.businesses (
    owner_id, owner_email, name, type, slug, organization_id,
    subscription_plan, subscription_status, trial_end_date, onboarding_completed
  )
  VALUES (
    v_user_id, v_email, p_business_name, p_business_type, v_biz_slug, v_org.id,
    'free_trial', 'trial', (current_date + 14), false
  )
  RETURNING * INTO v_business;

  RETURN jsonb_build_object('organization', row_to_json(v_org), 'business', row_to_json(v_business));
END;
$$;
