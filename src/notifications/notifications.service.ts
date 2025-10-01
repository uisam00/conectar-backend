import { Injectable } from '@nestjs/common';
import { NotificationRepository } from './infrastructure/persistence/notification.repository';
import { Notification } from './domain/notification';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { QueryNotificationDto } from './dto/query-notification.dto';

@Injectable()
export class NotificationsService {
  constructor(
    private readonly notificationRepository: NotificationRepository,
  ) {}

  async create(
    createNotificationDto: CreateNotificationDto,
  ): Promise<Notification> {
    // Garantir que isRead tenha um valor padrão
    const notificationData = {
      ...createNotificationDto,
      isRead: createNotificationDto.isRead ?? false,
    };
    return await this.notificationRepository.create(notificationData);
  }

  async findMany(
    queryDto: QueryNotificationDto,
  ): Promise<{ data: Notification[]; total: number; unreadCount: number }> {
    return await this.notificationRepository.findMany(queryDto);
  }

  async findById(id: number): Promise<Notification | null> {
    return await this.notificationRepository.findById(id);
  }

  async markAsRead(id: number): Promise<void> {
    await this.notificationRepository.markAsRead(id);
  }

  async markAllAsRead(userId: number): Promise<void> {
    await this.notificationRepository.markAllAsRead(userId);
  }

  async getUnreadCount(userId: number): Promise<number> {
    return await this.notificationRepository.getUnreadCount(userId);
  }

  async delete(id: number): Promise<void> {
    await this.notificationRepository.delete(id);
  }

  // Método específico para criar notificação de cliente inativo
  async createClientInactiveNotification(
    clientId: number,
    clientName: string,
    daysInactive: number,
  ): Promise<Notification> {
    return await this.create({
      type: 'client_inactive',
      title: 'Cliente inativo',
      message: `O cliente ${clientName} não possui usuários ativos há ${daysInactive} dias`,
      clientId,
      metadata: {
        clientName,
        daysInactive,
        type: 'client_inactive',
      },
    });
  }
}
