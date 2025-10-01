import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { NotificationRelationalRepository } from './infrastructure/persistence/relational/repositories/notification.repository';
import { NotificationEntity } from './infrastructure/persistence/relational/entities/notification.entity';
import { NotificationRepository } from './infrastructure/persistence/notification.repository';
import { ClientInactivityService } from './services/client-inactivity.service';
import { NotificationScheduler } from './services/notification-scheduler.service';
import { ClientEntity } from '../clients/infrastructure/persistence/relational/entities/client.entity';
import { SessionEntity } from '../session/infrastructure/persistence/relational/entities/session.entity';
import { UserClientEntity } from '../users/infrastructure/persistence/relational/entities/user-client.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      NotificationEntity,
      ClientEntity,
      SessionEntity,
      UserClientEntity,
    ]),
  ],
  controllers: [NotificationsController],
  providers: [
    NotificationsService,
    ClientInactivityService,
    NotificationScheduler,
    {
      provide: NotificationRepository,
      useClass: NotificationRelationalRepository,
    },
  ],
  exports: [
    NotificationsService,
    NotificationRepository,
    ClientInactivityService,
    NotificationScheduler,
  ],
})
export class NotificationsModule {}
