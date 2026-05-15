import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/lib/AuthContext';

export function useProfile() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: profile, isLoading, refetch } = useQuery({
    queryKey: ['profile', user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, email')
        .eq('id', user.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    staleTime: 60_000,
  });

  const avatarUrl = profile?.avatar_url || user?.avatar_url || null;
  const displayName = profile?.full_name || user?.full_name || user?.email || '';

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['profile', user?.id] });
  };

  return { profile, avatarUrl, displayName, isLoading, refetch, invalidate };
}
