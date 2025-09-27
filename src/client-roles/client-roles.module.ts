import { Module } from '@nestjs/common';
import { ClientRolesService } from './client-roles.service';
import { ClientRolesController } from './client-roles.controller';
import { RelationalClientRolePersistenceModule } from './infrastructure/persistence/relational/relational-persistence.module';

@Module({
  imports: [RelationalClientRolePersistenceModule],
  controllers: [ClientRolesController],
  providers: [ClientRolesService],
  exports: [ClientRolesService, RelationalClientRolePersistenceModule],
})
export class ClientRolesModule {}
