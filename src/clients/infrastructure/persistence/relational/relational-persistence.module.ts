import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientEntity } from './entities/client.entity';
import { ClientMapper } from './mappers/client.mapper';
import { ClientRelationalRepository } from './repositories/client.repository';
import { ClientRepository } from '../client.repository';
import { UserClientEntity } from '../../../../users/infrastructure/persistence/relational/entities/user-client.entity';
import { UserEntity } from '../../../../users/infrastructure/persistence/relational/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ClientEntity, UserClientEntity, UserEntity]),
  ],
  providers: [
    ClientMapper,
    {
      provide: ClientRepository,
      useClass: ClientRelationalRepository,
    },
  ],
  exports: [ClientRepository, TypeOrmModule],
})
export class RelationalClientPersistenceModule {}
