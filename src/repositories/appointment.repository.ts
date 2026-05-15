import { BaseRepository } from './base.repository';
import type { Appointment } from '@/types';

export class AppointmentRepository extends BaseRepository {
  async listByBusiness(businessId: string, from?: string, to?: string): Promise<Appointment[]> {
    let q = this.db.from('appointments').select('*').eq('business_id', businessId).order('date');
    if (from) q = q.gte('date', from);
    if (to) q = q.lte('date', to);
    const { data, error } = await q;
    this.throwIfError(error, 'AppointmentRepository.listByBusiness');
    return (data ?? []) as Appointment[];
  }

  async listByEmployee(employeeId: string): Promise<Appointment[]> {
    const { data, error } = await this.db
      .from('appointments')
      .select('*')
      .eq('employee_id', employeeId)
      .order('date');
    this.throwIfError(error, 'AppointmentRepository.listByEmployee');
    return (data ?? []) as Appointment[];
  }

  async create(row: Record<string, unknown>): Promise<Appointment> {
    const { data, error } = await this.db.from('appointments').insert(row).select().single();
    this.throwIfError(error, 'AppointmentRepository.create');
    return data as unknown as Appointment;
  }

  async update(id: string, patch: Record<string, unknown>): Promise<Appointment> {
    const { data, error } = await this.db
      .from('appointments')
      .update({ ...patch, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    this.throwIfError(error, 'AppointmentRepository.update');
    return data as unknown as Appointment;
  }

  async hasConflict(
    businessId: string,
    employeeId: string | null,
    startAt: string,
    endAt: string,
    excludeId?: string
  ): Promise<boolean> {
    const { data, error } = await this.db.rpc('check_appointment_conflict', {
      p_business_id: businessId,
      p_employee_id: employeeId,
      p_start_at: startAt,
      p_end_at: endAt,
      p_exclude_appointment_id: excludeId ?? null,
    });
    this.throwIfError(error, 'AppointmentRepository.hasConflict');
    return Boolean(data);
  }
}

export const appointmentRepository = new AppointmentRepository();
