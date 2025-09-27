import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClientRoleEntity } from '../entities/client-role.entity';
import { ClientRoleMapper } from '../mappers/client-role.mapper';
import { ClientRoleRepository } from '../../client-role.repository';
import { ClientRole } from '../../../../domain/client-role';

@Injectable()
export class ClientRoleRelationalRepository implements ClientRoleRepository {
  constructor(
    @InjectRepository(ClientRoleEntity)
    private readonly clientRoleRepository: Repository<ClientRoleEntity>,
    private readonly mapper: ClientRoleMapper,
  ) {}

  async create(
    data: Omit<ClientRole, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>,
  ): Promise<ClientRole> {
    const persistenceModel = this.mapper.toPersistence(data as ClientRole);
    const newEntity = await this.clientRoleRepository.save(
      this.clientRoleRepository.create(persistenceModel),
    );
    return this.mapper.toDomain(newEntity);
  }

  async findMany(filters: {
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<{ data: ClientRole[]; total: number }> {
    const queryBuilder =
      this.clientRoleRepository.createQueryBuilder('clientRole');

    if (filters.search) {
      queryBuilder.andWhere(
        'clientRole.name ILIKE :search OR clientRole.description ILIKE :search',
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

  async findById(id: ClientRole['id']): Promise<ClientRole | null> {
    const entity = await this.clientRoleRepository.findOne({
      where: { id: id as number },
    });

    return entity ? this.mapper.toDomain(entity) : null;
  }

  async update(
    id: ClientRole['id'],
    data: Partial<ClientRole>,
  ): Promise<ClientRole> {
    const entity = await this.clientRoleRepository.findOne({
      where: { id: id as number },
    });

    if (!entity) {
      throw new Error('ClientRole not found');
    }

    Object.assign(entity, data);
    const updatedEntity = await this.clientRoleRepository.save(entity);
    return this.mapper.toDomain(updatedEntity);
  }

  async delete(id: ClientRole['id']): Promise<void> {
    await this.clientRoleRepository.softDelete({ id: id as number });
  }
}
