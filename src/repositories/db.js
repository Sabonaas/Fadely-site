import { supabase } from '@/lib/supabaseClient';

function err(ctx, e) {
  if (e) {
    console.error(`[db:${ctx}]`, e);
    throw e;
  }
}

export function generateInviteCode() {
  return (
    Math.random().toString(36).substring(2, 10).toUpperCase() +
    Math.random().toString(36).substring(2, 6).toUpperCase()
  );
}

// ── Auth helpers (thin) ─────────────────────────────────────────────────────
export async function signInWithEmail(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  err('signInWithEmail', error);
  return data;
}

export async function signUpWithEmail(email, password, fullName) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName || '',
        subscription_plan: 'free_trial',
      },
    },
  });
  err('signUpWithEmail', error);
  return data;
}

export async function signOutEverywhere() {
  const { error } = await supabase.auth.signOut();
  err('signOutEverywhere', error);
}

export async function updateAuthUserMetadata(updates) {
  const { data, error } = await supabase.auth.updateUser({ data: updates });
  err('updateAuthUserMetadata', error);
  return data;
}

export async function updateAuthUserFullName(fullName) {
  const { data, error } = await supabase.auth.updateUser({
    data: { full_name: fullName },
  });
  err('updateAuthUserFullName', error);
  return data;
}

// ── Businesses ──────────────────────────────────────────────────────────────
export async function listBusinessesByOwnerId(ownerId) {
  if (!ownerId) return [];
  const { data, error } = await supabase.from('businesses').select('*').eq('owner_id', ownerId);
  err('listBusinessesByOwnerId', error);
  return data || [];
}

export async function getBusinessBySlugForPublic(slug) {
  const { data, error } = await supabase
    .from('businesses')
    .select('*')
    .eq('slug', slug)
    .eq('booking_page_enabled', true)
    .maybeSingle();
  err('getBusinessBySlugForPublic', error);
  return data;
}

export async function createBusiness(row) {
  const { data, error } = await supabase.from('businesses').insert(row).select().single();
  err('createBusiness', error);
  return data;
}

export async function updateBusiness(businessId, patch) {
  const { data, error } = await supabase
    .from('businesses')
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq('id', businessId)
    .select()
    .single();
  err('updateBusiness', error);
  return data;
}

export async function getBusinessById(id) {
  const { data, error } = await supabase.from('businesses').select('*').eq('id', id).maybeSingle();
  err('getBusinessById', error);
  return data;
}

// ── Employees ───────────────────────────────────────────────────────────────
export async function listEmployeesByBusinessId(businessId) {
  const { data, error } = await supabase.from('employees').select('*').eq('business_id', businessId);
  err('listEmployeesByBusinessId', error);
  return data || [];
}

/** DashboardLayout: convites aceites (vínculo ativo). */
export async function listLinkedEmployeesForUser(userId, email) {
  const map = new Map();
  if (userId) {
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .eq('is_linked', true)
      .eq('auth_user_id', userId);
    err('listLinkedEmployeesForUser:uid', error);
    (data || []).forEach((r) => map.set(r.id, r));
  }
  if (email) {
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .eq('is_linked', true)
      .eq('user_email', email);
    err('listLinkedEmployeesForUser:email', error);
    (data || []).forEach((r) => map.set(r.id, r));
  }
  return [...map.values()];
}

/** Employee dashboard: qualquer registo com o email do utilizador. */
export async function listEmployeesByUserEmail(email) {
  if (!email) return [];
  const { data, error } = await supabase.from('employees').select('*').eq('user_email', email);
  err('listEmployeesByUserEmail', error);
  return data || [];
}

export async function createEmployee(row) {
  const { data, error } = await supabase.from('employees').insert(row).select().single();
  err('createEmployee', error);
  return data;
}

export async function updateEmployee(id, patch) {
  const { data, error } = await supabase
    .from('employees')
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  err('updateEmployee', error);
  return data;
}

export async function deleteEmployee(id) {
  const { error } = await supabase.from('employees').delete().eq('id', id);
  err('deleteEmployee', error);
}

// ── Invite RPCs ─────────────────────────────────────────────────────────────
export async function invitePreviewRpc(employeeId, inviteCode) {
  const { data, error } = await supabase.rpc('invite_preview', {
    p_employee_id: employeeId || null,
    p_invite_code: inviteCode || null,
  });
  err('invitePreviewRpc', error);
  return data || {};
}

export async function acceptInviteRpc({ employeeId, inviteCode, userId, email, fullName }) {
  const { data, error } = await supabase.rpc('accept_invite', {
    p_employee_id: employeeId || null,
    p_invite_code: inviteCode || null,
    p_user_id: userId,
    p_email: email,
    p_full_name: fullName || '',
  });
  err('acceptInviteRpc', error);
  return data;
}

// ── Services ────────────────────────────────────────────────────────────────
export async function listServicesByBusiness(businessId, { activeOnly } = {}) {
  let q = supabase.from('services').select('*').eq('business_id', businessId);
  if (activeOnly) q = q.eq('is_active', true);
  const { data, error } = await q;
  err('listServicesByBusiness', error);
  return data || [];
}

export async function createService(row) {
  const { data, error } = await supabase.from('services').insert(row).select().single();
  err('createService', error);
  return data;
}

export async function updateService(id, patch) {
  const { data, error } = await supabase
    .from('services')
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  err('updateService', error);
  return data;
}

export async function deleteService(id) {
  const { error } = await supabase.from('services').delete().eq('id', id);
  err('deleteService', error);
}

// ── Clients ─────────────────────────────────────────────────────────────────
export async function listClientsByBusiness(businessId) {
  const { data, error } = await supabase.from('clients').select('*').eq('business_id', businessId);
  err('listClientsByBusiness', error);
  return data || [];
}

export async function createClient(row) {
  const { data, error } = await supabase.from('clients').insert(row).select().single();
  err('createClient', error);
  return data;
}

export async function updateClient(id, patch) {
  const { data, error } = await supabase
    .from('clients')
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  err('updateClient', error);
  return data;
}

export async function deleteClient(id) {
  const { error } = await supabase.from('clients').delete().eq('id', id);
  err('deleteClient', error);
}

// ── Appointments ────────────────────────────────────────────────────────────
export async function listAppointmentsByBusiness(businessId) {
  const { data, error } = await supabase.from('appointments').select('*').eq('business_id', businessId);
  err('listAppointmentsByBusiness', error);
  return data || [];
}

export async function listAppointmentsByEmployee(employeeId) {
  const { data, error } = await supabase.from('appointments').select('*').eq('employee_id', employeeId);
  err('listAppointmentsByEmployee', error);
  return data || [];
}

export async function createAppointment(row) {
  const { data, error } = await supabase.from('appointments').insert(row).select().single();
  err('createAppointment', error);
  return data;
}

export async function updateAppointment(id, patch) {
  const { data, error } = await supabase
    .from('appointments')
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  err('updateAppointment', error);
  return data;
}

// ── Notifications ───────────────────────────────────────────────────────────
export async function listNotificationsByBusiness(businessId) {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('business_id', businessId)
    .order('created_at', { ascending: false });
  err('listNotificationsByBusiness', error);
  return data || [];
}

export async function createNotification(row) {
  const { data, error } = await supabase.from('notifications').insert(row).select().single();
  err('createNotification', error);
  return data;
}

// ── Job roles ─────────────────────────────────────────────────────────────────
export async function listJobRolesByBusiness(businessId) {
  const { data, error } = await supabase.from('job_roles').select('*').eq('business_id', businessId);
  err('listJobRolesByBusiness', error);
  return data || [];
}

export async function createJobRole(row) {
  const { data, error } = await supabase.from('job_roles').insert(row).select().single();
  err('createJobRole', error);
  return data;
}

export async function deleteJobRole(id) {
  const { error } = await supabase.from('job_roles').delete().eq('id', id);
  err('deleteJobRole', error);
}
