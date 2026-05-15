import { BaseRepository } from './base.repository';
import type { DashboardMetrics } from '@/types';

export class AnalyticsRepository extends BaseRepository {
  async getDashboardMetrics(businessId: string, from?: string, to?: string): Promise<DashboardMetrics> {
    const { data, error } = await this.db.rpc('get_dashboard_metrics', {
      p_business_id: businessId,
      p_from: from,
      p_to: to,
    });
    this.throwIfError(error, 'AnalyticsRepository.getDashboardMetrics');
    return data as unknown as DashboardMetrics;
  }

  async getEmployeeMetrics(employeeId: string, from?: string, to?: string) {
    const { data, error } = await this.db.rpc('get_employee_dashboard_metrics', {
      p_employee_id: employeeId,
      p_from: from,
      p_to: to,
    });
    this.throwIfError(error, 'AnalyticsRepository.getEmployeeMetrics');
    return data;
  }

  async getTopServices(businessId: string, limit = 5) {
    const { data, error } = await this.db.rpc('get_top_services', {
      p_business_id: businessId,
      p_limit: limit,
    });
    this.throwIfError(error, 'AnalyticsRepository.getTopServices');
    return data ?? [];
  }

  async getBusiestHours(businessId: string) {
    const { data, error } = await this.db.rpc('get_busiest_hours', { p_business_id: businessId });
    this.throwIfError(error, 'AnalyticsRepository.getBusiestHours');
    return data ?? [];
  }
}

export const analyticsRepository = new AnalyticsRepository();
