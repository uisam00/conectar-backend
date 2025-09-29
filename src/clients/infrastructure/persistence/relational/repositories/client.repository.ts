import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { ClientEntity } from '../entities/client.entity';
import { ClientMapper } from '../mappers/client.mapper';
import { ClientRepository } from '../../client.repository';
import { Client } from '../../../../domain/client';
import { User } from '../../../../../users/domain/user';
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
    const relations = ['status', 'plan', 'photo'];

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
      relations: ['status', 'plan', 'photo'],
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
      search,
      firstName,
      lastName,
      email,
      roleId,
      statusId,
      systemRoleId,
      clientRoleId,
      sortBy,
      sortOrder,
      page,
      limit,
    }: {
      search?: string;
      firstName?: string;
      lastName?: string;
      email?: string;
      roleId?: number;
      statusId?: number;
      systemRoleId?: number;
      clientRoleId?: number;
      sortBy?: string;
      sortOrder?: 'ASC' | 'DESC';
      page?: number;
      limit?: number;
    },
  ): Promise<{ data: User[]; total: number }> {
    const queryBuilder = this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.role', 'role')
      .leftJoinAndSelect('user.status', 'status')
      .leftJoinAndSelect('user.photo', 'photo')
      .leftJoin('user_clients', 'uc', 'uc.userId = user.id')
      .leftJoinAndSelect('uc.clientRole', 'clientRole')
      .where('uc.clientId = :clientId', { clientId });

    // Filtro por busca geral (firstName, lastName, email)
    if (search) {
      queryBuilder.andWhere(
        '(user.firstName ILIKE :search OR user.lastName ILIKE :search OR user.email ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    // Filtros específicos
    if (firstName) {
      queryBuilder.andWhere('user.firstName ILIKE :firstName', {
        firstName: `%${firstName}%`,
      });
    }
    if (lastName) {
      queryBuilder.andWhere('user.lastName ILIKE :lastName', {
        lastName: `%${lastName}%`,
      });
    }
    if (email) {
      queryBuilder.andWhere('user.email ILIKE :email', {
        email: `%${email}%`,
      });
    }
    if (roleId) {
      queryBuilder.andWhere('role.id = :roleId', { roleId });
    }
    if (statusId) {
      queryBuilder.andWhere('status.id = :statusId', { statusId });
    }
    if (systemRoleId) {
      queryBuilder.andWhere('role.id = :systemRoleId', { systemRoleId });
    }
    if (clientRoleId) {
      queryBuilder.andWhere('uc.clientRoleId = :clientRoleId', {
        clientRoleId,
      });
    }

    // Ordenação
    if (sortBy && sortOrder) {
      queryBuilder.orderBy(`user.${sortBy}`, sortOrder);
    }

    // Paginação
    const pageNum = page || 1;
    const limitNum = limit || 10;
    queryBuilder.skip((pageNum - 1) * limitNum).take(limitNum);

    const [entities, total] = await queryBuilder.getManyAndCount();

    // Para cada usuário, buscar a role do cliente específica
    const usersWithClientRoles = await Promise.all(
      entities.map(async (user) => {
        const userClient = await this.userRepository.manager
          .createQueryBuilder()
          .select([
            'uc.clientRoleId',
            'cr.id',
            'cr.name',
            'cr.description',
            'cr.permissions',
          ])
          .from('user_clients', 'uc')
          .leftJoin('client_roles', 'cr', 'cr.id = uc.clientRoleId')
          .where('uc.userId = :userId AND uc.clientId = :clientId', {
            userId: user.id,
            clientId,
          })
          .getRawOne();

        const userDomain = UserMapper.toDomain(user);

        if (userClient && userClient.cr_id) {
          userDomain.clientRole = {
            id: userClient.cr_id,
            name: userClient.cr_name,
            description: userClient.cr_description,
            permissions: userClient.cr_permissions,
          };
        }

        return userDomain;
      }),
    );

    return {
      data: usersWithClientRoles,
      total,
    };
  }
}
