import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike, FindOptionsWhere, In } from 'typeorm';
import { ClientEntity } from '../entities/client.entity';
import { ClientMapper } from '../mappers/client.mapper';
import { ClientRepository } from '../../client.repository';
import { Client } from '../../../../domain/client';
import {
  FilterUserDto,
  SortUserDto,
} from '../../../../../users/dto/query-user.dto';
import { User } from '../../../../../users/domain/user';
import { IPaginationOptions } from '../../../../../utils/types/pagination-options';
import { UserEntity } from '../../../../../users/infrastructure/persistence/relational/entities/user.entity';
import { UserMapper } from '../../../../../users/infrastructure/persistence/relational/mappers/user.mapper';

@Injectable()
export class ClientRelationalRepository implements ClientRepository {
  constructor(
    @InjectRepository(ClientEntity)
    private readonly clientRepository: Repository<ClientEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
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
    cnpj?: string;
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

    // Search por nomes (razaoSocial e nomeComercial) - case insensitive
    if (filters.search) {
      console.log('Search filter:', filters.search);
      console.log(
        'Creating search conditions for razaoSocial and nomeComercial',
      );
      searchConditions.push(
        { razaoSocial: ILike(`%${filters.search}%`) },
        { nomeComercial: ILike(`%${filters.search}%`) },
      );
      console.log('Search conditions created:', searchConditions);
    }

    // Search por CNPJ - case insensitive
    if (filters.cnpj) {
      console.log('CNPJ filter:', filters.cnpj);
      searchConditions.push({ cnpj: ILike(`%${filters.cnpj}%`) });
    }

    // Combine where conditions using TypeORM's Or operator
    let where: any;
    if (searchConditions.length > 0) {
      // Create an array of where conditions, each combining base conditions with search conditions
      where = searchConditions.map((searchCondition) => ({
        ...whereConditions,
        ...searchCondition,
      }));
    } else {
      where = whereConditions;
    }

    console.log('Where conditions:', JSON.stringify(where, null, 2));
    console.log('Total search conditions:', searchConditions.length);
    console.log(
      'Final where array length:',
      Array.isArray(where) ? where.length : 'not an array',
    );

    // Build order object
    const order: any = {};
    if (filters.sortBy && filters.sortOrder) {
      order[filters.sortBy] = filters.sortOrder;
    }

    console.log('Order conditions:', JSON.stringify(order, null, 2));

    console.log('Executing query with:', {
      where,
      relations,
      skip: ((filters.page || 1) - 1) * (filters.limit || 10),
      take: filters.limit || 10,
      order: Object.keys(order).length > 0 ? order : undefined,
    });

    // Debug: Verificar se há dados na tabela
    const totalClients = await this.clientRepository.count();
    console.log('Total clients in database:', totalClients);

    // Debug: Mostrar alguns dados de exemplo
    const sampleData = await this.clientRepository.find({
      take: 3,
      select: ['id', 'razaoSocial', 'nomeComercial', 'cnpj'],
    });
    console.log('Sample data from database:', sampleData);

    const [data, total] = await this.clientRepository.findAndCount({
      where,
      relations,
      skip: ((filters.page || 1) - 1) * (filters.limit || 10),
      take: filters.limit || 10,
      order: Object.keys(order).length > 0 ? order : undefined,
    });

    console.log('Query result:', { dataCount: data.length, total });

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

  async findUsersByClient(
    clientId: number,
    {
      filterOptions,
      sortOptions,
      paginationOptions,
    }: {
      filterOptions?: FilterUserDto | null;
      sortOptions?: SortUserDto[] | null;
      paginationOptions: IPaginationOptions;
    },
  ): Promise<User[]> {
    const where: FindOptionsWhere<UserEntity> = {};
    const relations = ['role', 'status', 'photo'];

    // Filtro por roles do sistema
    if (filterOptions?.roles?.length) {
      where.role = filterOptions.roles.map((role) => ({
        id: Number(role.id),
      }));
    }

    // Filtro por role do sistema específico
    if (filterOptions?.systemRoleId) {
      where.role = { id: filterOptions.systemRoleId };
    }

    // Filtro por role do cliente
    if (filterOptions?.clientRoleId) {
      // Buscar IDs dos usuários que atendem aos critérios de role do cliente
      const userClientQuery = this.userRepository
        .createQueryBuilder('user')
        .select('user.id')
        .leftJoin('user_clients', 'uc', 'uc.userId = user.id')
        .where('uc.clientId = :clientId', { clientId })
        .andWhere('uc.clientRoleId = :clientRoleId', {
          clientRoleId: filterOptions.clientRoleId,
        });

      const userClientResults = await userClientQuery.getMany();
      const userIds = userClientResults.map((user) => user.id);

      // Se não encontrou usuários com os critérios de cliente, retornar array vazio
      if (userIds.length === 0) {
        return [];
      }

      where.id = In(userIds);
    } else {
      // Se não há filtro de role do cliente, buscar todos os usuários do cliente
      const userClientQuery = this.userRepository
        .createQueryBuilder('user')
        .select('user.id')
        .leftJoin('user_clients', 'uc', 'uc.userId = user.id')
        .where('uc.clientId = :clientId', { clientId });

      const userClientResults = await userClientQuery.getMany();
      const userIds = userClientResults.map((user) => user.id);

      // Se não encontrou usuários do cliente, retornar array vazio
      if (userIds.length === 0) {
        return [];
      }

      where.id = In(userIds);
    }

    // Construir ordenação
    const order: any = {};
    if (sortOptions?.length) {
      sortOptions.forEach((sort) => {
        order[sort.orderBy] = sort.order.toUpperCase();
      });
    }

    const entities = await this.userRepository.find({
      where,
      relations,
      skip: (paginationOptions.page - 1) * paginationOptions.limit,
      take: paginationOptions.limit,
      order: Object.keys(order).length > 0 ? order : undefined,
    });

    return entities.map((user) => UserMapper.toDomain(user));
  }
}
