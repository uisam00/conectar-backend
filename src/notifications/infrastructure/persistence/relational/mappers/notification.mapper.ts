import { Notification } from '../../../../domain/notification';
import { NotificationEntity } from '../entities/notification.entity';

export class NotificationMapper {
  static toDomain(raw: NotificationEntity): Notification {
    const domainEntity = new Notification();
    domainEntity.id = raw.id;
    domainEntity.type = raw.type;
    domainEntity.title = raw.title;
    domainEntity.message = raw.message;
    domainEntity.isRead = raw.isRead;
    domainEntity.userId = raw.user?.id;
    domainEntity.clientId = raw.client?.id;
    domainEntity.metadata = raw.metadata;
    domainEntity.createdAt = raw.createdAt;
    domainEntity.updatedAt = raw.updatedAt;
    domainEntity.deletedAt = raw.deletedAt;

    return domainEntity;
  }

  static toPersistence(domainEntity: Notification): NotificationEntity {
    const persistenceEntity = new NotificationEntity();
    persistenceEntity.id = domainEntity.id;
    persistenceEntity.type = domainEntity.type;
    persistenceEntity.title = domainEntity.title;
    persistenceEntity.message = domainEntity.message;
    persistenceEntity.isRead = domainEntity.isRead;
    persistenceEntity.metadata = domainEntity.metadata;
    persistenceEntity.createdAt = domainEntity.createdAt;
    persistenceEntity.updatedAt = domainEntity.updatedAt;
    persistenceEntity.deletedAt = domainEntity.deletedAt;

    return persistenceEntity;
  }
}
