import { useQuery } from '@tanstack/react-query';
import { analyticsService } from '@/services';

export function useAdminDashboard(businessId?: string, from?: string, to?: string) {
  return useQuery({
    queryKey: ['analytics', 'admin', businessId, from, to],
    queryFn: () => analyticsService.getAdminDashboard(businessId!, from, to),
    enabled: Boolean(businessId),
    staleTime: 30_000,
  });
}

export function useEmployeeDashboard(employeeId?: string) {
  return useQuery({
    queryKey: ['analytics', 'employee', employeeId],
    queryFn: () => analyticsService.getEmployeeDashboard(employeeId!),
    enabled: Boolean(employeeId),
  });
}

export function useBusinessInsights(businessId?: string) {
  return useQuery({
    queryKey: ['analytics', 'insights', businessId],
    queryFn: () => analyticsService.getInsights(businessId!),
    enabled: Boolean(businessId),
  });
}
