import { Module } from '@nestjs/common';
import { ClientsService } from './clients.service';
import { ClientsController } from './clients.controller';
import { RelationalClientPersistenceModule } from './infrastructure/persistence/relational/relational-persistence.module';
import { ClientMembershipGuard } from './guards/client-membership.guard';

@Module({
  imports: [RelationalClientPersistenceModule],
  controllers: [ClientsController],
  providers: [ClientsService, ClientMembershipGuard],
  exports: [ClientsService, RelationalClientPersistenceModule],
})
export class ClientsModule {}
