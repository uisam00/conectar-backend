import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClientRoleEntity } from '../../../../client-roles/infrastructure/persistence/relational/entities/client-role.entity';

@Injectable()
export class ClientRoleSeedService {
  constructor(
    @InjectRepository(ClientRoleEntity)
    private repository: Repository<ClientRoleEntity>,
  ) {}

  async run() {
    const count = await this.repository.count();

    if (!count) {
      await this.repository.query(`
        INSERT INTO client_roles (id, name, description, permissions, "createdAt", "updatedAt") VALUES
        (1, 'admin', 'Administrador do cliente com acesso total', '{"canManageUsers": true, "canManageClient": true, "canViewReports": true, "canManageSettings": true}', NOW(), NOW()),
        (2, 'user', 'Usuário comum do cliente com acesso limitado', '{"canViewReports": true, "canManageOwnProfile": true}', NOW(), NOW()),
        (3, 'manager', 'Gerente do cliente com acesso intermediário', '{"canManageUsers": true, "canViewReports": true, "canManageOwnProfile": true}', NOW(), NOW()),
        (4, 'viewer', 'Visualizador com acesso apenas de leitura', '{"canViewReports": true}', NOW(), NOW())
      `);
    }
  }
}
