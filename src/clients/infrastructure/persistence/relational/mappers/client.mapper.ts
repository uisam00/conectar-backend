import { Injectable } from '@nestjs/common';
import { ClientEntity } from '../entities/client.entity';
import { Client } from '../../../../domain/client';

@Injectable()
export class ClientMapper {
  toDomain(raw: ClientEntity): Client {
    const domain = new Client();
    domain.id = raw.id;
    domain.razaoSocial = raw.razaoSocial;
    domain.cnpj = this.formatCnpj(raw.cnpj); // Formatar CNPJ na saída
    domain.nomeComercial = raw.nomeComercial;
    domain.statusId = raw.statusId;
    domain.planId = raw.planId;
    domain.photo = raw.photo;
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
    entity.photoId = domain.photo?.id as number;
    return entity;
  }

  private formatCnpj(cnpj: string): string {
    // Se já está formatado, retorna como está
    if (cnpj.includes('.')) {
      return cnpj;
    }

    // Formatar CNPJ: XX.XXX.XXX/XXXX-XX
    if (cnpj.length === 14) {
      return `${cnpj.slice(0, 2)}.${cnpj.slice(2, 5)}.${cnpj.slice(5, 8)}/${cnpj.slice(8, 12)}-${cnpj.slice(12, 14)}`;
    }

    return cnpj;
  }
}
