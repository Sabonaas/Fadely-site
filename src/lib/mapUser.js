/** Normaliza o utilizador Supabase para o formato usado pela UI (ex. AccountSettings, ProfileDropdown). */
export function mapSessionUser(user) {
  if (!user) return null;
  const meta = user.user_metadata || {};
  return {
    id: user.id,
    email: user.email,
    full_name: meta.full_name || '',
    role: meta.subscription_plan || meta.role || 'free_trial',
    avatar_url: meta.avatar_url || null,
  };
}
