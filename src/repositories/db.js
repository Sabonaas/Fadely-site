import { supabase } from '@/lib/supabaseClient';
import { sanitizeUuidPayload, logDbPayload } from '@/lib/payloadUtils';
import { createEmployeeSchema, updateEmployeeSchema } from '@/validations/employee.schema';

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

/** Slug URL-safe a partir do nome (base; unicidade via RPC no servidor). */
export function slugifyBusinessName(name) {
  const base = (name || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  return base || 'negocio';
}

export async function ensureUniqueBusinessSlugRpc(baseSlug) {
  const { data, error } = await supabase.rpc('ensure_unique_business_slug', {
    p_base: baseSlug,
  });
  err('ensureUniqueBusinessSlugRpc', error);
  return data;
}

export async function completeOnboardingRpc(payload) {
  const { data, error } = await supabase.rpc('complete_onboarding', {
    p_business_name: payload.name,
    p_business_type: payload.type,
    p_employee_count: payload.employee_count,
    p_phone: payload.phone || null,
    p_whatsapp_connected: payload.whatsapp_connected ?? false,
    p_open_time: payload.open_time || '08:00',
    p_close_time: payload.close_time || '18:00',
    p_slug_hint: payload.slug_hint || null,
  });
  if (!error) return data;

  // Fallback se migration 007 ainda não foi aplicada
  if (error.code === 'PGRST202' || error.message?.includes('complete_onboarding')) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw error;
    const base = payload.slug_hint || slugifyBusinessName(payload.name);
    let uniqueSlug = base;
    try {
      uniqueSlug = (await ensureUniqueBusinessSlugRpc(base)) || base;
    } catch {
      uniqueSlug = `${base}-${user.id.slice(0, 8)}`;
    }
    return createBusiness({
      owner_id: user.id,
      owner_email: user.email,
      name: payload.name,
      type: payload.type,
      slug: uniqueSlug,
      employee_count: payload.employee_count,
      phone: payload.phone,
      whatsapp_connected: payload.whatsapp_connected,
      onboarding_completed: true,
      subscription_plan: 'free_trial',
      subscription_status: 'trial',
      booking_page_enabled: true,
      working_hours: { open: payload.open_time, close: payload.close_time },
      invite_code: generateInviteCode(),
    });
  }
  err('completeOnboardingRpc', error);
  return data;
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
  const toInsert = { ...row };
  if (toInsert.slug) {
    try {
      const unique = await ensureUniqueBusinessSlugRpc(toInsert.slug);
      if (unique) toInsert.slug = unique;
    } catch {
      toInsert.slug = `${toInsert.slug}-${Date.now().toString(36).slice(-6)}`;
    }
  }
  const { data, error } = await supabase.from('businesses').insert(toInsert).select().single();
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

export async function getBusinessOrganizationIdRpc(businessId) {
  const { data, error } = await supabase.rpc('get_business_organization_id', {
    p_business_id: businessId,
  });
  err('getBusinessOrganizationIdRpc', error);
  return data;
}

export async function createEmployee(row) {
  const sanitized = sanitizeUuidPayload(row, [
    'job_role_id',
    'organization_member_id',
    'auth_user_id',
    'user_id',
    'employee_id',
    'business_id',
  ]);
  const payload = createEmployeeSchema.parse(sanitized);
  logDbPayload('createEmployee', payload);
  const { data, error } = await supabase.from('employees').insert(payload).select().single();
  err('createEmployee', error);
  return data;
}

export async function updateEmployee(id, patch) {
  const sanitized = sanitizeUuidPayload(patch, [
    'job_role_id',
    'organization_member_id',
    'auth_user_id',
    'user_id',
    'employee_id',
  ]);
  const payload = updateEmployeeSchema.parse(sanitized);
  logDbPayload('updateEmployee', { id, ...payload });
  const { data, error } = await supabase
    .from('employees')
    .update({ ...payload, updated_at: new Date().toISOString() })
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
  const payload = sanitizeUuidPayload(row, [
    'business_id',
    'service_id',
    'employee_id',
    'client_id',
    'organization_id',
  ]);
  logDbPayload('createAppointment', payload);
  const { data, error } = await supabase.from('appointments').insert(payload).select().single();
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

// ── Coupons ───────────────────────────────────────────────────────────────────
export async function listCouponsByBusiness(businessId) {
  const { data, error } = await supabase
    .from('coupons')
    .select('*')
    .eq('business_id', businessId)
    .order('created_at', { ascending: false });
  err('listCouponsByBusiness', error);
  return data || [];
}

export async function createCoupon(row) {
  const { data, error } = await supabase.from('coupons').insert(row).select().single();
  err('createCoupon', error);
  return data;
}

export async function updateCoupon(id, patch) {
  const { data, error } = await supabase.from('coupons').update({ ...patch, updated_at: new Date().toISOString() }).eq('id', id).select().single();
  err('updateCoupon', error);
  return data;
}

export async function validateCouponRpc(businessId, code, clientId = null) {
  const { data, error } = await supabase.rpc('validate_coupon', {
    p_business_id: businessId,
    p_code: code,
    p_client_id: clientId,
  });
  err('validateCouponRpc', error);
  return data;
}

// ── Employee invites (secure token) ───────────────────────────────────────────
export async function createEmployeeInviteRpc(businessId, employeeId = null, email = null) {
  const { data, error } = await supabase.rpc('create_employee_invite', {
    p_business_id: businessId,
    p_employee_id: employeeId,
    p_email: email,
    p_days_valid: 7,
  });
  err('createEmployeeInviteRpc', error);
  return data;
}

export async function createAppointmentWithServicesRpc(appointment, services) {
  const { data, error } = await supabase.rpc('create_appointment_with_services', {
    p_appointment: appointment,
    p_services: services,
  });
  err('createAppointmentWithServicesRpc', error);
  return data;
}
