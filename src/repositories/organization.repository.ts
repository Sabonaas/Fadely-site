import { BaseRepository } from './base.repository';
import type { Organization, OrganizationMember } from '@/types';

export class OrganizationRepository extends BaseRepository {
  async getById(id: string): Promise<Organization | null> {
    const { data, error } = await this.db.from('organizations').select('*').eq('id', id).maybeSingle();
    this.throwIfError(error, 'OrganizationRepository.getById');
    return data as Organization | null;
  }

  async listForCurrentUser(): Promise<OrganizationMember[]> {
    const { data: { user } } = await this.db.auth.getUser();
    if (!user) return [];
    const { data, error } = await this.db
      .from('organization_members')
      .select('*, organizations(*)')
      .eq('user_id', user.id)
      .eq('is_active', true);
    this.throwIfError(error, 'OrganizationRepository.listForCurrentUser');
    return (data ?? []) as OrganizationMember[];
  }

  async createWithBusiness(orgName: string, businessName: string, businessType = 'salon', slug?: string) {
    const { data, error } = await this.db.rpc('create_organization_with_business', {
      p_org_name: orgName,
      p_business_name: businessName,
      p_business_type: businessType,
      p_slug: slug ?? null,
    });
    this.throwIfError(error, 'OrganizationRepository.createWithBusiness');
    return data as unknown as { organization: Organization; business: Record<string, unknown> };
  }
}

export const organizationRepository = new OrganizationRepository();
