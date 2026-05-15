import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

let client: SupabaseClient | null = null;

/** Supabase client — use `supabase gen types` + Database generic in CI for strict mode */
export function getSupabase(): SupabaseClient {
  if (!client) {
    if (!url || !anonKey) {
      console.warn('[Fadely] Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY');
    }
    client = createClient(url ?? '', anonKey ?? '', {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
      global: {
        headers: { 'x-fadely-client': 'web' },
      },
    });
  }
  return client;
}

export const supabase = getSupabase();
