import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientEntity } from '../../../../clients/infrastructure/persistence/relational/entities/client.entity';
import { ClientSeedService } from './client-seed.service';

@Module({
  imports: [TypeOrmModule.forFeature([ClientEntity])],
  providers: [ClientSeedService],
  exports: [ClientSeedService],
})
export class ClientSeedModule {}
