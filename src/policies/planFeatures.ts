import type { PlanFeatures } from '@/types';
import { SubscriptionPlan } from '@/types/enums';

export const PLAN_LIMITS: Record<string, Pick<PlanFeatures, 'max_employees' | 'max_locations' | 'whatsapp_enabled' | 'analytics_advanced' | 'multi_unit'>> = {
  [SubscriptionPlan.FreeTrial]: { max_employees: 3, max_locations: 1, whatsapp_enabled: false, analytics_advanced: false, multi_unit: false },
  [SubscriptionPlan.Essential]: { max_employees: 5, max_locations: 1, whatsapp_enabled: true, analytics_advanced: false, multi_unit: false },
  [SubscriptionPlan.Professional]: { max_employees: 15, max_locations: 3, whatsapp_enabled: true, analytics_advanced: true, multi_unit: true },
  [SubscriptionPlan.Premium]: { max_employees: 999, max_locations: 999, whatsapp_enabled: true, analytics_advanced: true, multi_unit: true },
};

export type FeatureFlag = 'whatsapp' | 'advanced_analytics' | 'multi_unit' | 'unlimited_staff';

export function planHasFeature(plan: string | undefined, feature: FeatureFlag): boolean {
  const limits = PLAN_LIMITS[plan ?? SubscriptionPlan.FreeTrial] ?? PLAN_LIMITS[SubscriptionPlan.FreeTrial];
  switch (feature) {
    case 'whatsapp':
      return limits.whatsapp_enabled;
    case 'advanced_analytics':
      return limits.analytics_advanced;
    case 'multi_unit':
      return limits.multi_unit;
    case 'unlimited_staff':
      return limits.max_employees >= 999;
    default:
      return false;
  }
}

export function canAddEmployee(plan: string | undefined, currentCount: number): boolean {
  const limits = PLAN_LIMITS[plan ?? SubscriptionPlan.FreeTrial] ?? PLAN_LIMITS[SubscriptionPlan.FreeTrial];
  return currentCount < limits.max_employees;
}
