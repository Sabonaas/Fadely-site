import { useQuery } from '@tanstack/react-query';
import { organizationService } from '@/services';

export function useOrganization(organizationId?: string) {
  return useQuery({
    queryKey: ['organization', organizationId],
    queryFn: () => organizationService.getOrganization(organizationId!),
    enabled: Boolean(organizationId),
  });
}

export function useMemberships() {
  return useQuery({
    queryKey: ['organization-memberships'],
    queryFn: () => organizationService.listMemberships(),
    staleTime: 60_000,
  });
}
