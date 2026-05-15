-- Fix Postgres 42P17: infinite recursion detected in policy for relation "businesses"
-- Cycle: SELECT businesses → businesses_employee_read → EXISTS(employees) →
--         employees_owner_all → EXISTS(businesses) → …
-- Solution: owner checks on child tables use SECURITY DEFINER helper with row_security off.

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

DROP POLICY IF EXISTS "job_roles_owner" ON public.job_roles;
CREATE POLICY "job_roles_owner" ON public.job_roles FOR ALL
  USING (public.is_business_owner(job_roles.business_id, auth.uid()))
  WITH CHECK (public.is_business_owner(job_roles.business_id, auth.uid()));

DROP POLICY IF EXISTS "employees_owner_all" ON public.employees;
CREATE POLICY "employees_owner_all" ON public.employees FOR ALL
  USING (public.is_business_owner(employees.business_id, auth.uid()))
  WITH CHECK (public.is_business_owner(employees.business_id, auth.uid()));

DROP POLICY IF EXISTS "services_owner" ON public.services;
CREATE POLICY "services_owner" ON public.services FOR ALL
  USING (public.is_business_owner(services.business_id, auth.uid()))
  WITH CHECK (public.is_business_owner(services.business_id, auth.uid()));

DROP POLICY IF EXISTS "clients_owner" ON public.clients;
CREATE POLICY "clients_owner" ON public.clients FOR ALL
  USING (public.is_business_owner(clients.business_id, auth.uid()))
  WITH CHECK (public.is_business_owner(clients.business_id, auth.uid()));

DROP POLICY IF EXISTS "appointments_owner" ON public.appointments;
CREATE POLICY "appointments_owner" ON public.appointments FOR ALL
  USING (public.is_business_owner(appointments.business_id, auth.uid()))
  WITH CHECK (public.is_business_owner(appointments.business_id, auth.uid()));

DROP POLICY IF EXISTS "notifications_owner" ON public.notifications;
CREATE POLICY "notifications_owner" ON public.notifications FOR ALL
  USING (public.is_business_owner(notifications.business_id, auth.uid()))
  WITH CHECK (public.is_business_owner(notifications.business_id, auth.uid()));
