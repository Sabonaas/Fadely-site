import { useEffect, useState } from 'react';
import { notificationRepository } from '@/repositories';
import type { UserNotification } from '@/types';

export function useNotifications(userId: string | undefined) {
  const [items, setItems] = useState<UserNotification[]>([]);

  useEffect(() => {
    if (!userId) return;
    notificationRepository.listUnread(userId).then(setItems);
    const sub = notificationRepository.subscribeToUser(userId, (n) => {
      setItems((prev) => [n, ...prev]);
    });
    return () => {
      sub.unsubscribe();
    };
  }, [userId]);

  const markRead = async (id: string) => {
    await notificationRepository.markRead(id);
    setItems((prev) => prev.filter((n) => n.id !== id));
  };

  return { items, markRead, unreadCount: items.length };
}
