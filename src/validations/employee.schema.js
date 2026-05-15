import { z } from 'zod';

const optionalUuid = z.preprocess(
  (v) => (v === '' || v === '__other__' ? undefined : v),
  z.string().uuid().optional()
);

const optionalEmail = z.preprocess(
  (v) => (v === '' ? undefined : v),
  z.string().email().optional()
);

export const createEmployeeSchema = z.object({
  business_id: z.string().uuid(),
  name: z.string().min(1, 'Nome obrigatório'),
  email: optionalEmail,
  phone: z.string().optional(),
  role: z.string().optional(),
  job_role_id: optionalUuid,
  color: z.string().optional(),
  organization_member_id: optionalUuid,
  auth_user_id: optionalUuid,
  user_id: optionalUuid,
});

export const updateEmployeeSchema = createEmployeeSchema.partial().omit({ business_id: true });
