import type { SupabaseClient } from '@supabase/supabase-js';
import { getSupabase } from '@/lib/supabase/client';
import { mapSupabaseError } from '@/lib/supabase/errors';

export abstract class BaseRepository {
  protected readonly db: SupabaseClient;

  constructor(client?: SupabaseClient) {
    this.db = client ?? getSupabase();
  }

  protected throwIfError(error: unknown, ctx: string): void {
    if (error) {
      console.error(`[repository:${ctx}]`, error);
      throw mapSupabaseError(error as Parameters<typeof mapSupabaseError>[0]);
    }
  }
}
