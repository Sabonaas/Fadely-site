import { getSupabase } from '@/lib/supabase/client';
import { FadelyError } from '@/lib/supabase/errors';
import type { Permission } from '@/policies/permissions';
import { requireAuth, type AuthContext } from './requireAuth';

/** Server-side permission via RPC (RLS is authoritative) */
export async function requireBusinessPermission(
  businessId: string,
  permission: Permission
): Promise<AuthContext> {
  const ctx = await requireAuth();
  const { data, error } = await getSupabase().rpc('has_business_permission', {
    p_business_id: businessId,
    p_permission: permission,
  });
  if (error) throw new FadelyError(error.message, 'PERMISSION_CHECK_FAILED', 500, error);
  if (!data) throw new FadelyError('Sem permissão para esta ação', 'FORBIDDEN', 403);
  return ctx;
}

export function withBusinessPermission<TArgs extends unknown[], TResult>(
  getBusinessId: (...args: TArgs) => string,
  permission: Permission,
  handler: (ctx: AuthContext, ...args: TArgs) => Promise<TResult>
) {
  return async (...args: TArgs): Promise<TResult> => {
    await requireBusinessPermission(getBusinessId(...args), permission);
    const ctx = await requireAuth();
    return handler(ctx, ...args);
  };
}
