import { useCallback, useEffect, useState } from 'react';
import { getSupabase } from '@/lib/supabase/client';
import type { Permission } from '@/policies/permissions';
import { roleCan } from '@/policies/permissions';
import type { MemberRole } from '@/types/enums';

export function usePermissions(businessId: string | undefined, role?: MemberRole | string) {
  const [can, setCan] = useState<Record<string, boolean>>({});

  const check = useCallback(
    async (permission: Permission) => {
      if (!businessId) return false;
      if (role && roleCan(role, permission)) return true;
      const { data } = await getSupabase().rpc('has_business_permission', {
        p_business_id: businessId,
        p_permission: permission,
      });
      return Boolean(data);
    },
    [businessId, role]
  );

  const checkMany = useCallback(
    async (permissions: Permission[]) => {
      const results: Record<string, boolean> = {};
      await Promise.all(
        permissions.map(async (p) => {
          results[p] = await check(p);
        })
      );
      setCan(results);
      return results;
    },
    [check]
  );

  return { can, check, checkMany };
}

export function useCanAccessFinancial(businessId?: string, role?: string) {
  const [allowed, setAllowed] = useState(false);
  useEffect(() => {
    if (!businessId) return;
    getSupabase()
      .rpc('has_business_permission', {
        p_business_id: businessId,
        p_permission: 'financial:read',
      })
      .then(({ data }) => setAllowed(Boolean(data) || role === 'owner'));
  }, [businessId, role]);
  return allowed;
}
