import { analyticsRepository } from '@/repositories';

export class AnalyticsService {
  getAdminDashboard(businessId: string, from?: string, to?: string) {
    return analyticsRepository.getDashboardMetrics(businessId, from, to);
  }

  getEmployeeDashboard(employeeId: string, from?: string, to?: string) {
    return analyticsRepository.getEmployeeMetrics(employeeId, from, to);
  }

  async getInsights(businessId: string) {
    const [topServices, busiestHours, metrics] = await Promise.all([
      analyticsRepository.getTopServices(businessId),
      analyticsRepository.getBusiestHours(businessId),
      analyticsRepository.getDashboardMetrics(businessId),
    ]);
    return { topServices, busiestHours, metrics };
  }
}

export const analyticsService = new AnalyticsService();
