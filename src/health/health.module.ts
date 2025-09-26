import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { MailerModule } from '../mailer/mailer.module';

@Module({
  imports: [MailerModule],
  controllers: [HealthController],
})
export class HealthModule {}
