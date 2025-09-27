import { Injectable } from '@nestjs/common';
import { ClientRoleEntity } from '../entities/client-role.entity';
import { ClientRole } from '../../../../domain/client-role';

@Injectable()
export class ClientRoleMapper {
  toDomain(raw: ClientRoleEntity): ClientRole {
    const domain = new ClientRole();
    domain.id = raw.id;
    domain.name = raw.name;
    domain.description = raw.description;
    domain.permissions = raw.permissions;
    domain.createdAt = raw.createdAt;
    domain.updatedAt = raw.updatedAt;
    domain.deletedAt = raw.deletedAt;
    return domain;
  }

  toPersistence(domain: ClientRole): Partial<ClientRoleEntity> {
    const entity = new ClientRoleEntity();
    entity.id = domain.id as number;
    entity.name = domain.name;
    entity.description = domain.description;
    entity.permissions = domain.permissions;
    return entity;
  }
}
