import { BaseRepository } from './base.repository';
import type { UserNotification } from '@/types';

export class NotificationRepository extends BaseRepository {
  async listUnread(userId: string, limit = 50): Promise<UserNotification[]> {
    const { data, error } = await this.db
      .from('user_notifications')
      .select('*')
      .eq('user_id', userId)
      .is('read_at', null)
      .order('created_at', { ascending: false })
      .limit(limit);
    this.throwIfError(error, 'NotificationRepository.listUnread');
    return (data ?? []) as UserNotification[];
  }

  async markRead(id: string): Promise<void> {
    const { error } = await this.db
      .from('user_notifications')
      .update({ read_at: new Date().toISOString() })
      .eq('id', id);
    this.throwIfError(error, 'NotificationRepository.markRead');
  }

  async create(row: {
    user_id: string;
    type: string;
    title: string;
    content?: string;
    organization_id?: string;
    business_id?: string;
    payload?: Record<string, unknown>;
  }): Promise<UserNotification> {
    const { data, error } = await this.db.from('user_notifications').insert(row).select().single();
    this.throwIfError(error, 'NotificationRepository.create');
    return data as unknown as UserNotification;
  }

  subscribeToUser(userId: string, onInsert: (n: UserNotification) => void) {
    return this.db
      .channel(`notifications:${userId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'user_notifications', filter: `user_id=eq.${userId}` },
        (payload) => onInsert(payload.new as UserNotification)
      )
      .subscribe();
  }
}

export const notificationRepository = new NotificationRepository();
