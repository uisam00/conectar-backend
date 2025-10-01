export class Notification {
  id: number;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  userId?: number;
  clientId?: number;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}
