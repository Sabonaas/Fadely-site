import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';
import * as db from '@/repositories/db';

export function useBusiness() {
  const { data: businesses, isLoading, isFetching, refetch } = useQuery({
    queryKey: ['my-business'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.id) return [];

      let rows = await db.listBusinessesByOwnerId(session.user.id);

      if (rows.length > 0 && !rows[0].invite_code) {
        const code = db.generateInviteCode();
        await db.updateBusiness(rows[0].id, { invite_code: code });
        rows = await db.listBusinessesByOwnerId(session.user.id);
      }

      return rows;
    },
  });

  const business = businesses?.[0] || null;

  return { business, isLoading, isFetching, refetch };
}
