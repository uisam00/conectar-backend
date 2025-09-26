import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { HealthService } from './health.service';
import { MailerModule } from '../mailer/mailer.module';
import { HEALTH_REPOSITORY } from './infrastructure/health.repository.interface';
import { HealthRepositoryImpl } from './infrastructure/repositories/health.repository';

@Module({
  imports: [MailerModule],
  controllers: [HealthController],
  providers: [
    HealthService,
    {
      provide: HEALTH_REPOSITORY,
      useClass: HealthRepositoryImpl,
    },
  ],
})
export class HealthModule {}
