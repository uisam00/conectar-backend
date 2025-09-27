import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientRoleEntity } from './entities/client-role.entity';
import { ClientRoleMapper } from './mappers/client-role.mapper';
import { ClientRoleRelationalRepository } from './repositories/client-role.repository';
import { ClientRoleRepository } from '../client-role.repository';

@Module({
  imports: [TypeOrmModule.forFeature([ClientRoleEntity])],
  providers: [
    ClientRoleMapper,
    {
      provide: ClientRoleRepository,
      useClass: ClientRoleRelationalRepository,
    },
  ],
  exports: [ClientRoleRepository],
})
export class RelationalClientRolePersistenceModule {}
