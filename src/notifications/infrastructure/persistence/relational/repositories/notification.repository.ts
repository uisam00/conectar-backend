import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotificationRepository } from '../../notification.repository';
import { Notification } from '../../../../domain/notification';
import { NotificationEntity } from '../entities/notification.entity';
import { NotificationMapper } from '../mappers/notification.mapper';

@Injectable()
export class NotificationRelationalRepository
  implements NotificationRepository
{
  constructor(
    @InjectRepository(NotificationEntity)
    private readonly notificationRepository: Repository<NotificationEntity>,
  ) {}

  async create(
    data: Omit<Notification, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>,
  ): Promise<Notification> {
    const persistenceEntity = NotificationMapper.toPersistence(
      data as Notification,
    );
    const newEntity = await this.notificationRepository.save(persistenceEntity);
    return NotificationMapper.toDomain(newEntity);
  }

  async findMany(filters: {
    userId?: number;
    isRead?: boolean;
    type?: string;
    page?: number;
    limit?: number;
  }): Promise<{ data: Notification[]; total: number; unreadCount: number }> {
    const queryBuilder =
      this.notificationRepository.createQueryBuilder('notification');

    if (filters.userId) {
      queryBuilder.andWhere('notification.user.id = :userId', {
        userId: filters.userId,
      });
    }

    if (filters.isRead !== undefined) {
      queryBuilder.andWhere('notification.isRead = :isRead', {
        isRead: filters.isRead,
      });
    }

    if (filters.type) {
      queryBuilder.andWhere('notification.type = :type', {
        type: filters.type,
      });
    }

    queryBuilder
      .leftJoinAndSelect('notification.user', 'user')
      .leftJoinAndSelect('notification.client', 'client')
      .orderBy('notification.isRead', 'ASC') // Não lidas primeiro (false < true)
      .addOrderBy('notification.createdAt', 'DESC'); // Depois por data (mais recente primeiro)

    const total = await queryBuilder.getCount();

    // Contar notificações não lidas
    const unreadQueryBuilder =
      this.notificationRepository.createQueryBuilder('notification');

    if (filters.userId) {
      unreadQueryBuilder.andWhere('notification.user.id = :userId', {
        userId: filters.userId,
      });
    }

    if (filters.type) {
      unreadQueryBuilder.andWhere('notification.type = :type', {
        type: filters.type,
      });
    }

    unreadQueryBuilder.andWhere('notification.isRead = :isRead', {
      isRead: false,
    });

    const unreadCount = await unreadQueryBuilder.getCount();

    if (filters.page && filters.limit) {
      const offset = (filters.page - 1) * filters.limit;
      queryBuilder.skip(offset).take(filters.limit);
    }

    const entities = await queryBuilder.getMany();
    const data = entities.map((entity) => NotificationMapper.toDomain(entity));

    return { data, total, unreadCount };
  }

  async findById(id: Notification['id']): Promise<Notification | null> {
    const entity = await this.notificationRepository.findOne({
      where: { id },
      relations: ['user', 'client'],
    });

    if (!entity) {
      return null;
    }

    return NotificationMapper.toDomain(entity);
  }

  async update(
    id: Notification['id'],
    data: Partial<Notification>,
  ): Promise<Notification> {
    await this.notificationRepository.update(id, data);
    const updatedEntity = await this.notificationRepository.findOne({
      where: { id },
      relations: ['user', 'client'],
    });

    if (!updatedEntity) {
      throw new Error('Notification not found');
    }

    return NotificationMapper.toDomain(updatedEntity);
  }

  async delete(id: Notification['id']): Promise<void> {
    await this.notificationRepository.softDelete(id);
  }

  async markAsRead(id: Notification['id']): Promise<void> {
    await this.notificationRepository.update(id, { isRead: true });
  }

  async markAllAsRead(userId: number): Promise<void> {
    await this.notificationRepository.update(
      { user: { id: userId } },
      { isRead: true },
    );
  }

  async getUnreadCount(userId: number): Promise<number> {
    return await this.notificationRepository.count({
      where: {
        user: { id: userId },
        isRead: false,
      },
    });
  }
}
