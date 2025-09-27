import { Injectable, ConflictException } from '@nestjs/common';
import { ClientRepository } from './infrastructure/persistence/client.repository';
import { Client } from './domain/client';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { QueryClientDto } from './dto/query-client.dto';

@Injectable()
export class ClientsService {
  constructor(private readonly clientRepository: ClientRepository) {}

  async create(createClientDto: CreateClientDto): Promise<Client> {
    // Normalizar CNPJ (remover formatação)
    const normalizedCnpj = this.normalizeCnpj(createClientDto.cnpj);

    // Verificar se o CNPJ já existe
    const existingClient =
      await this.clientRepository.findByCnpj(normalizedCnpj);
    if (existingClient) {
      throw new ConflictException('CNPJ já cadastrado');
    }

    // Criar cliente com CNPJ normalizado
    const clientData = {
      ...createClientDto,
      cnpj: normalizedCnpj,
    };

    return this.clientRepository.create(clientData);
  }

  async findMany(
    queryDto: QueryClientDto,
  ): Promise<{ data: Client[]; total: number }> {
    return this.clientRepository.findMany(queryDto);
  }

  async findById(id: number): Promise<Client | null> {
    return this.clientRepository.findById(id);
  }

  async findByUserId(userId: number): Promise<Client[]> {
    return this.clientRepository.findByUserId(userId);
  }

  async findMyClientsWithRole(
    userId: number,
  ): Promise<{ clients: Client[]; userRole: any }> {
    const clients = await this.clientRepository.findByUserId(userId);

    return {
      clients,
      userRole: null, // Simplificado por enquanto
    };
  }

  async update(id: number, updateClientDto: UpdateClientDto): Promise<Client> {
    // Se o CNPJ está sendo atualizado, verificar se já existe
    if (updateClientDto.cnpj) {
      const normalizedCnpj = this.normalizeCnpj(updateClientDto.cnpj);

      // Verificar se o CNPJ já existe em outro cliente
      const existingClient =
        await this.clientRepository.findByCnpj(normalizedCnpj);
      if (existingClient && existingClient.id !== id) {
        throw new ConflictException('CNPJ já cadastrado');
      }

      // Atualizar com CNPJ normalizado
      const updateData = {
        ...updateClientDto,
        cnpj: normalizedCnpj,
      };

      return this.clientRepository.update(id, updateData);
    }

    return this.clientRepository.update(id, updateClientDto);
  }

  async delete(id: number): Promise<void> {
    return this.clientRepository.delete(id);
  }

  private normalizeCnpj(cnpj: string): string {
    // Remove todos os caracteres não numéricos
    return cnpj.replace(/\D/g, '');
  }
}
