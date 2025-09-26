import { Module } from '@nestjs/common';
import { PlansService } from './plans.service';
import { PlansController } from './plans.controller';
import { RelationalPlanPersistenceModule } from './infrastructure/persistence/relational/relational-persistence.module';

@Module({
  imports: [RelationalPlanPersistenceModule],
  controllers: [PlansController],
  providers: [PlansService],
  exports: [PlansService, RelationalPlanPersistenceModule],
})
export class PlansModule {}
