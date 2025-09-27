import { Injectable } from '@nestjs/common';
import { ClientEntity } from '../entities/client.entity';
import { Client } from '../../../../domain/client';

@Injectable()
export class ClientMapper {
  toDomain(raw: ClientEntity): Client {
    const domain = new Client();
    domain.id = raw.id;
    domain.razaoSocial = raw.razaoSocial;
    domain.cnpj = raw.cnpj;
    domain.nomeComercial = raw.nomeComercial;
    domain.statusId = raw.statusId;
    domain.planId = raw.planId;
    domain.createdAt = raw.createdAt;
    domain.updatedAt = raw.updatedAt;
    domain.deletedAt = raw.deletedAt;
    return domain;
  }

  toPersistence(domain: Client): Partial<ClientEntity> {
    const entity = new ClientEntity();
    entity.id = domain.id as number;
    entity.razaoSocial = domain.razaoSocial;
    entity.cnpj = domain.cnpj;
    entity.nomeComercial = domain.nomeComercial;
    entity.statusId = domain.statusId;
    entity.planId = domain.planId;
    return entity;
  }
}
