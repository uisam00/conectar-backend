import { Injectable } from '@nestjs/common';
import { ClientRoleRepository } from './infrastructure/persistence/client-role.repository';
import { ClientRole } from './domain/client-role';
import { CreateClientRoleDto } from './dto/create-client-role.dto';
import { UpdateClientRoleDto } from './dto/update-client-role.dto';
import { QueryClientRoleDto } from './dto/query-client-role.dto';

@Injectable()
export class ClientRolesService {
  constructor(private readonly clientRoleRepository: ClientRoleRepository) {}

  async create(createClientRoleDto: CreateClientRoleDto): Promise<ClientRole> {
    return this.clientRoleRepository.create(createClientRoleDto);
  }

  async findMany(
    queryDto: QueryClientRoleDto,
  ): Promise<{ data: ClientRole[]; total: number }> {
    return this.clientRoleRepository.findMany(queryDto);
  }

  async findById(id: number): Promise<ClientRole | null> {
    return this.clientRoleRepository.findById(id);
  }

  async update(
    id: number,
    updateClientRoleDto: UpdateClientRoleDto,
  ): Promise<ClientRole> {
    return this.clientRoleRepository.update(id, updateClientRoleDto);
  }

  async delete(id: number): Promise<void> {
    return this.clientRoleRepository.delete(id);
  }
}
