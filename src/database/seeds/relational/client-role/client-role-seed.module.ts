import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ClientRoleSeedService } from './client-role-seed.service';
import { ClientRoleEntity } from '../../../../client-roles/infrastructure/persistence/relational/entities/client-role.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ClientRoleEntity])],
  providers: [ClientRoleSeedService],
  exports: [ClientRoleSeedService],
})
export class ClientRoleSeedModule {}
