import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
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
    name?: string;
    statusId?: number;
    planId?: number;
    isSpecial?: boolean;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
  }): Promise<{ data: Client[]; total: number }> {
    const whereConditions: any = {};
    const relations = ['status', 'plan'];

    // Status filter
    if (filters.statusId) {
      whereConditions.statusId = filters.statusId;
    }

    // Plan filter
    if (filters.planId) {
      whereConditions.planId = filters.planId;
    }

    // Special plan filter
    if (filters.isSpecial !== undefined) {
      console.log('Applying isSpecial filter:', filters.isSpecial);
      if (filters.isSpecial) {
        whereConditions.plan = { isSpecial: true };
      } else {
        whereConditions.plan = { isSpecial: false };
      }
    }

    // Search and name filters will be handled separately
    const searchConditions: any[] = [];

    if (filters.search) {
      searchConditions.push(
        { razaoSocial: Like(`%${filters.search}%`) },
        { nomeComercial: Like(`%${filters.search}%`) },
        { cnpj: Like(`%${filters.search}%`) },
      );
    }

    if (filters.name) {
      searchConditions.push(
        { razaoSocial: Like(`%${filters.name}%`) },
        { nomeComercial: Like(`%${filters.name}%`) },
      );
    }

    // Combine where conditions
    const where =
      searchConditions.length > 0
        ? [{ ...whereConditions, $or: searchConditions }]
        : whereConditions;

    console.log('Where conditions:', JSON.stringify(where, null, 2));

    // Build order object
    const order: any = {};
    if (filters.sortBy && filters.sortOrder) {
      order[filters.sortBy] = filters.sortOrder;
    }

    console.log('Order conditions:', JSON.stringify(order, null, 2));

    const [data, total] = await this.clientRepository.findAndCount({
      where,
      relations,
      skip: ((filters.page || 1) - 1) * (filters.limit || 10),
      take: filters.limit || 10,
      order: Object.keys(order).length > 0 ? order : undefined,
    });

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

  async findByUserId(userId: number): Promise<Client[]> {
    const entities = await this.clientRepository
      .createQueryBuilder('client')
      .innerJoin('user_clients', 'uc', 'uc.clientId = client.id')
      .where('uc.userId = :userId', { userId })
      .getMany();

    return entities.map((entity) => this.mapper.toDomain(entity));
  }

  async findByCnpj(cnpj: string): Promise<Client | null> {
    const entity = await this.clientRepository.findOne({
      where: { cnpj },
    });

    if (!entity) {
      return null;
    }

    return this.mapper.toDomain(entity);
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
