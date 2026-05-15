import { useEffect, useState } from 'react';
import { getSupabase } from '@/lib/supabase/client';
import type { Appointment } from '@/types';

export function useRealtimeAppointments(businessId: string | undefined) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  useEffect(() => {
    if (!businessId) return;

    const db = getSupabase();
    let mounted = true;

    db.from('appointments')
      .select('*')
      .eq('business_id', businessId)
      .order('date')
      .then(({ data }) => {
        if (mounted && data) setAppointments(data as Appointment[]);
      });

    const channel = db
      .channel(`appointments:${businessId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'appointments', filter: `business_id=eq.${businessId}` },
        (payload) => {
          setAppointments((prev) => {
            if (payload.eventType === 'INSERT') {
              return [...prev, payload.new as Appointment];
            }
            if (payload.eventType === 'UPDATE') {
              return prev.map((a) => (a.id === (payload.new as Appointment).id ? (payload.new as Appointment) : a));
            }
            if (payload.eventType === 'DELETE') {
              return prev.filter((a) => a.id !== (payload.old as { id: string }).id);
            }
            return prev;
          });
        }
      )
      .subscribe();

    return () => {
      mounted = false;
      db.removeChannel(channel);
    };
  }, [businessId]);

  return appointments;
}
