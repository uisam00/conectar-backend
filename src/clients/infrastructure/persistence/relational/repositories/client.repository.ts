import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClientEntity } from '../entities/client.entity';
import { ClientMapper } from '../mappers/client.mapper';
import { ClientRepository } from '../../client.repository';
import { Client } from '../../../../domain/client';

@Injectable()
export class ClientRelationalRepository implements ClientRepository {
  constructor(
    @InjectRepository(ClientEntity)
    private readonly clientRepository: Repository<ClientEntity>,
    private readonly mapper: ClientMapper,
  ) {}

  async create(
    data: Omit<Client, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>,
  ): Promise<Client> {
    const persistenceModel = this.mapper.toPersistence(data as Client);
    const newEntity = await this.clientRepository.save(
      this.clientRepository.create(persistenceModel),
    );
    return this.mapper.toDomain(newEntity);
  }

  async findMany(filters: {
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<{ data: Client[]; total: number }> {
    const queryBuilder = this.clientRepository.createQueryBuilder('client');

    if (filters.search) {
      queryBuilder.andWhere(
        'client.razaoSocial ILIKE :search OR client.nomeComercial ILIKE :search OR client.cnpj ILIKE :search',
        {
          search: `%${filters.search}%`,
        },
      );
    }

    const [data, total] = await queryBuilder
      .skip(((filters.page || 1) - 1) * (filters.limit || 10))
      .take(filters.limit || 10)
      .getManyAndCount();

    return {
      data: data.map((item) => this.mapper.toDomain(item)),
      total,
    };
  }

  async findById(id: Client['id']): Promise<Client | null> {
    const entity = await this.clientRepository.findOne({
      where: { id: id as number },
    });

    return entity ? this.mapper.toDomain(entity) : null;
  }

  async update(id: Client['id'], data: Partial<Client>): Promise<Client> {
    const entity = await this.clientRepository.findOne({
      where: { id: id as number },
    });

    if (!entity) {
      throw new Error('Client not found');
    }

    Object.assign(entity, data);
    const updatedEntity = await this.clientRepository.save(entity);
    return this.mapper.toDomain(updatedEntity);
  }

  async delete(id: Client['id']): Promise<void> {
    await this.clientRepository.softDelete({ id: id as number });
  }
}
