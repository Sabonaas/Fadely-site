import { createOrganizationSchema } from '@/validations';
import { organizationRepository } from '@/repositories';
import { canAddEmployee, planHasFeature } from '@/policies/planFeatures';

export class OrganizationService {
  async onboard(input: unknown) {
    const dto = createOrganizationSchema.parse(input);
    return organizationRepository.createWithBusiness(
      dto.orgName,
      dto.businessName,
      dto.businessType,
      dto.slug
    );
  }

  async getOrganization(id: string) {
    return organizationRepository.getById(id);
  }

  async listMemberships() {
    return organizationRepository.listForCurrentUser();
  }

  assertFeature(plan: string | undefined, feature: Parameters<typeof planHasFeature>[1]) {
    if (!planHasFeature(plan, feature)) {
      throw new Error(`Recurso não disponível no plano atual. Faça upgrade.`);
    }
  }

  assertCanAddEmployee(plan: string | undefined, count: number) {
    if (!canAddEmployee(plan, count)) {
      throw new Error('Limite de funcionários atingido para o seu plano.');
    }
  }
}

export const organizationService = new OrganizationService();
