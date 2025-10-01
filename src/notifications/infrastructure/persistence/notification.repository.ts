import { Notification } from '../../domain/notification';

export abstract class NotificationRepository {
  abstract create(
    data: Omit<Notification, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>,
  ): Promise<Notification>;
  abstract findMany(filters: {
    userId?: number;
    isRead?: boolean;
    type?: string;
    page?: number;
    limit?: number;
  }): Promise<{ data: Notification[]; total: number; unreadCount: number }>;
  abstract findById(id: Notification['id']): Promise<Notification | null>;
  abstract update(
    id: Notification['id'],
    data: Partial<Notification>,
  ): Promise<Notification>;
  abstract delete(id: Notification['id']): Promise<void>;
  abstract markAsRead(id: Notification['id']): Promise<void>;
  abstract markAllAsRead(userId: number): Promise<void>;
  abstract getUnreadCount(userId: number): Promise<number>;
}
