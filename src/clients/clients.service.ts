import { Injectable } from '@nestjs/common';
import { ClientRepository } from './infrastructure/persistence/client.repository';
import { Client } from './domain/client';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { QueryClientDto } from './dto/query-client.dto';

@Injectable()
export class ClientsService {
  constructor(private readonly clientRepository: ClientRepository) {}

  async create(createClientDto: CreateClientDto): Promise<Client> {
    return this.clientRepository.create(createClientDto);
  }

  async findMany(
    queryDto: QueryClientDto,
  ): Promise<{ data: Client[]; total: number }> {
    return this.clientRepository.findMany(queryDto);
  }

  async findById(id: number): Promise<Client | null> {
    return this.clientRepository.findById(id);
  }

  async update(id: number, updateClientDto: UpdateClientDto): Promise<Client> {
    return this.clientRepository.update(id, updateClientDto);
  }

  async delete(id: number): Promise<void> {
    return this.clientRepository.delete(id);
  }
}
