import { z } from 'zod';
import { AppointmentStatus } from '@/types/enums';

export const createAppointmentSchema = z.object({
  business_id: z.string().uuid(),
  service_id: z.string().uuid().optional().nullable(),
  employee_id: z.string().uuid().optional().nullable(),
  client_id: z.string().uuid().optional().nullable(),
  client_name: z.string().min(1).optional(),
  client_phone: z.string().optional(),
  start_at: z.string().datetime({ offset: true }),
  end_at: z.string().datetime({ offset: true }),
  price: z.number().min(0).default(0),
  notes: z.string().max(2000).optional(),
  status: z
    .enum([
      AppointmentStatus.Scheduled,
      AppointmentStatus.Confirmed,
      AppointmentStatus.InProgress,
      AppointmentStatus.Completed,
      AppointmentStatus.Cancelled,
      AppointmentStatus.NoShow,
    ])
    .default(AppointmentStatus.Scheduled),
});

export const updateAppointmentSchema = createAppointmentSchema.partial().extend({
  id: z.string().uuid(),
  cancellation_reason: z.string().max(500).optional(),
});

export type CreateAppointmentDto = z.infer<typeof createAppointmentSchema>;
export type UpdateAppointmentDto = z.infer<typeof updateAppointmentSchema>;
