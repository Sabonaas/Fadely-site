import { FadelyError } from '@/lib/supabase/errors';
import { appointmentRepository } from '@/repositories';
import { createAppointmentSchema, updateAppointmentSchema } from '@/validations';
import type { Appointment } from '@/types';

export class AppointmentService {
  async create(input: unknown): Promise<Appointment> {
    const dto = createAppointmentSchema.parse(input);
    const conflict = await appointmentRepository.hasConflict(
      dto.business_id,
      dto.employee_id ?? null,
      dto.start_at,
      dto.end_at
    );
    if (conflict) {
      throw new FadelyError('Horário indisponível — conflito detectado', 'APPOINTMENT_CONFLICT', 409);
    }
    const [date, time] = dto.start_at.split('T');
    return appointmentRepository.create({
      ...dto,
      date: date.slice(0, 10),
      time: time?.slice(0, 5) ?? '09:00',
      duration: Math.round((new Date(dto.end_at).getTime() - new Date(dto.start_at).getTime()) / 60000),
    });
  }

  async update(input: unknown): Promise<Appointment> {
    const dto = updateAppointmentSchema.parse(input);
    const { id, ...patch } = dto;
    if (patch.start_at && patch.end_at) {
      const existing = await appointmentRepository.listByBusiness(patch.business_id ?? '');
      const appt = existing.find((a) => a.id === id);
      const businessId = patch.business_id ?? appt?.business_id;
      if (businessId) {
        const conflict = await appointmentRepository.hasConflict(
          businessId,
          patch.employee_id ?? appt?.employee_id ?? null,
          patch.start_at,
          patch.end_at,
          id
        );
        if (conflict) throw new FadelyError('Conflito de horário', 'APPOINTMENT_CONFLICT', 409);
      }
    }
    return appointmentRepository.update(id, patch as Record<string, unknown>);
  }

  async cancel(id: string, reason?: string) {
    return appointmentRepository.update(id, {
      status: 'cancelled',
      cancelled_at: new Date().toISOString(),
      cancellation_reason: reason,
    });
  }

  async confirm(id: string) {
    return appointmentRepository.update(id, {
      status: 'confirmed',
      confirmed_at: new Date().toISOString(),
    });
  }

  listByBusiness(businessId: string, from?: string, to?: string) {
    return appointmentRepository.listByBusiness(businessId, from, to);
  }
}

export const appointmentService = new AppointmentService();
