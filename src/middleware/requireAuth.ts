import type { Session, User } from '@supabase/supabase-js';
import { getSupabase } from '@/lib/supabase/client';
import { FadelyError } from '@/lib/supabase/errors';

export interface AuthContext {
  session: Session;
  user: User;
}

/** Ensures a valid session before running a handler */
export async function requireAuth(): Promise<AuthContext> {
  const db = getSupabase();
  const { data: { session }, error } = await db.auth.getSession();
  if (error) throw new FadelyError(error.message, 'AUTH_ERROR', 401, error);
  if (!session?.user) throw new FadelyError('Sessão expirada. Faça login novamente.', 'UNAUTHORIZED', 401);
  return { session, user: session.user };
}

export function withAuth<TArgs extends unknown[], TResult>(
  handler: (ctx: AuthContext, ...args: TArgs) => Promise<TResult>
) {
  return async (...args: TArgs): Promise<TResult> => {
    const ctx = await requireAuth();
    return handler(ctx, ...args);
  };
}
