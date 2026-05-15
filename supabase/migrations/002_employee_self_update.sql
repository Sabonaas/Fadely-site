-- Permite ao próprio colaborador atualizar o registo (ex.: desligar vínculo).
CREATE POLICY "employees_self_update" ON public.employees FOR UPDATE
  USING (
    auth_user_id = auth.uid()
    OR (is_linked = true AND lower(user_email) = lower(auth.jwt() ->> 'email'))
  )
  WITH CHECK (true);
