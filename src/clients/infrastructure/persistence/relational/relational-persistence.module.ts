import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientEntity } from './entities/client.entity';
import { ClientMapper } from './mappers/client.mapper';
import { ClientRelationalRepository } from './repositories/client.repository';
import { ClientRepository } from '../client.repository';

@Module({
  imports: [TypeOrmModule.forFeature([ClientEntity])],
  providers: [
    ClientMapper,
    {
      provide: ClientRepository,
      useClass: ClientRelationalRepository,
    },
  ],
  exports: [ClientRepository],
})
export class RelationalClientPersistenceModule {}
