import { z } from 'zod';
import { MemberRole } from '@/types/enums';

export const createOrganizationSchema = z.object({
  orgName: z.string().min(2).max(120),
  businessName: z.string().min(2).max(120),
  businessType: z.string().default('salon'),
  slug: z.string().regex(/^[a-z0-9-]+$/).min(3).max(60).optional(),
});

export const inviteMemberSchema = z.object({
  organizationId: z.string().uuid(),
  email: z.string().email(),
  role: z
    .enum([
      MemberRole.Owner,
      MemberRole.Admin,
      MemberRole.Manager,
      MemberRole.Employee,
      MemberRole.Receptionist,
    ])
    .default(MemberRole.Employee),
});

export type CreateOrganizationDto = z.infer<typeof createOrganizationSchema>;
