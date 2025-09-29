import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository, In, Like } from 'typeorm';
import { UserEntity } from '../entities/user.entity';
import { NullableType } from '../../../../../utils/types/nullable.type';
import { User } from '../../../../domain/user';
import { UserRepository } from '../../user.repository';
import { UserMapper } from '../mappers/user.mapper';
import { IPaginationOptions } from '../../../../../utils/types/pagination-options';

@Injectable()
export class UsersRelationalRepository implements UserRepository {
  constructor(
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
  ) {}

  async create(
    data: User & {
      clientAssociations?: { clientId: number; clientRoleId?: number }[];
    },
  ): Promise<User> {
    const persistenceModel = UserMapper.toPersistence(data);
    const newEntity = await this.usersRepository.save(
      this.usersRepository.create(persistenceModel),
    );

    // Criar associações com clientes se fornecidas
    if (data.clientAssociations && data.clientAssociations.length > 0) {
      const userClientData = data.clientAssociations.map(
        ({ clientId, clientRoleId }) => ({
          userId: newEntity.id,
          clientId,
          clientRoleId,
        }),
      );

      await this.usersRepository.manager
        .createQueryBuilder()
        .insert()
        .into('user_clients')
        .values(userClientData)
        .execute();
    }

    return UserMapper.toDomain(newEntity);
  }

  async findManyWithPagination({
    search,
    firstName,
    lastName,
    email,
    roleId,
    statusId,
    clientId,
    systemRoleId,
    clientRoleId,
    sortBy,
    sortOrder,
    paginationOptions,
  }: {
    search?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    roleId?: number;
    statusId?: number;
    clientId?: number;
    systemRoleId?: number;
    clientRoleId?: number;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
    paginationOptions: IPaginationOptions;
  }): Promise<User[]> {
    // Construir condições WHERE
    const whereConditions: any = {};
    const relations = ['role', 'status', 'photo'];

    // Filtros básicos
    if (roleId) {
      whereConditions.role = { id: roleId };
    }
    if (statusId) {
      whereConditions.status = { id: statusId };
    }
    if (systemRoleId) {
      whereConditions.role = { id: systemRoleId };
    }

    // Filtros de texto
    const textConditions: any[] = [];
    if (search) {
      textConditions.push(
        { firstName: Like(`%${search}%`) },
        { lastName: Like(`%${search}%`) },
        { email: Like(`%${search}%`) },
      );
    }
    if (firstName) {
      textConditions.push({ firstName: Like(`%${firstName}%`) });
    }
    if (lastName) {
      textConditions.push({ lastName: Like(`%${lastName}%`) });
    }
    if (email) {
      textConditions.push({ email: Like(`%${email}%`) });
    }

    // Combinar condições
    let where: any = whereConditions;
    if (textConditions.length > 0) {
      where = { ...whereConditions, $or: textConditions };
    }

    // Ordenação
    const order: any = {};
    if (sortBy && sortOrder) {
      order[sortBy] = sortOrder;
    }

    // Buscar usuários
    const [entities] = await this.usersRepository.findAndCount({
      where,
      relations,
      skip: (paginationOptions.page - 1) * paginationOptions.limit,
      take: paginationOptions.limit,
      order: Object.keys(order).length > 0 ? order : undefined,
    });

    // Se há filtros de cliente, buscar dados de clientes separadamente
    if (clientId || clientRoleId) {
      const userIds = entities.map((user) => user.id);

      // Se não há usuários, retornar array vazio
      if (userIds.length === 0) {
        return [];
      }

      // Buscar associações de cliente
      const userClients = await this.usersRepository
        .createQueryBuilder('user')
        .leftJoin('user_clients', 'uc', 'uc.userId = user.id')
        .leftJoin('clients', 'client', 'client.id = uc.clientId')
        .select([
          'user.id',
          'client.id',
          'client.razaoSocial',
          'client.nomeComercial',
          'client.cnpj',
          'uc.clientRoleId',
        ])
        .where('user.id IN (:...userIds)', { userIds })
        .andWhere(clientId ? 'uc.clientId = :clientId' : '1=1', { clientId })
        .andWhere(clientRoleId ? 'uc.clientRoleId = :clientRoleId' : '1=1', {
          clientRoleId,
        })
        .getRawMany();

      // Filtrar usuários que têm as associações corretas
      const validUserIds = new Set(userClients.map((uc) => uc.user_id));
      const filteredEntities = entities.filter((user) =>
        validUserIds.has(user.id),
      );

      // Buscar clientes para os usuários filtrados
      const usersWithClients = await Promise.all(
        filteredEntities.map(async (user) => {
          const domainUser = UserMapper.toDomain(user);

          // Buscar clientes associados ao usuário
          const userClientsData = await this.usersRepository
            .createQueryBuilder('user')
            .leftJoin('user_clients', 'uc', 'uc.userId = user.id')
            .leftJoin('clients', 'client', 'client.id = uc.clientId')
            .select([
              'client.id',
              'client.razaoSocial',
              'client.nomeComercial',
              'client.cnpj',
              'uc.clientRoleId',
            ])
            .where('user.id = :userId', { userId: user.id })
            .getRawMany();

          (domainUser as any).clients = userClientsData
            .map((uc) => ({
              id: uc.client_id,
              razaoSocial: uc.client_razaoSocial,
              nomeComercial: uc.client_nomeComercial,
              cnpj: uc.client_cnpj,
              clientRoleId: uc.uc_clientRoleId,
            }))
            .filter((client) => client.id !== null);

          return domainUser;
        }),
      );

      return usersWithClients;
    }

    // Buscar clientes associados para todos os usuários
    const usersWithClients = await Promise.all(
      entities.map(async (user) => {
        const domainUser = UserMapper.toDomain(user);

        // Buscar clientes associados ao usuário
        const userClients = await this.usersRepository
          .createQueryBuilder('user')
          .leftJoin('user_clients', 'uc', 'uc.userId = user.id')
          .leftJoin('clients', 'client', 'client.id = uc.clientId')
          .select([
            'client.id',
            'client.razaoSocial',
            'client.nomeComercial',
            'client.cnpj',
            'uc.clientRoleId',
          ])
          .where('user.id = :userId', { userId: user.id })
          .getRawMany();

        (domainUser as any).clients = userClients
          .map((uc) => ({
            id: uc.client_id,
            razaoSocial: uc.client_razaoSocial,
            nomeComercial: uc.client_nomeComercial,
            cnpj: uc.client_cnpj,
            clientRoleId: uc.uc_clientRoleId,
          }))
          .filter((client) => client.id !== null);

        return domainUser;
      }),
    );

    return usersWithClients;
  }

  async findById(id: User['id']): Promise<NullableType<User>> {
    const entity = await this.usersRepository.findOne({
      where: { id: Number(id) },
    });

    return entity ? UserMapper.toDomain(entity) : null;
  }

  async findByIds(ids: User['id'][]): Promise<User[]> {
    const entities = await this.usersRepository.find({
      where: { id: In(ids) },
    });

    return entities.map((user) => UserMapper.toDomain(user));
  }

  async findByEmail(email: User['email']): Promise<NullableType<User>> {
    if (!email) return null;

    const entity = await this.usersRepository.findOne({
      where: { email },
    });

    return entity ? UserMapper.toDomain(entity) : null;
  }

  async findBySocialIdAndProvider({
    socialId,
    provider,
  }: {
    socialId: User['socialId'];
    provider: User['provider'];
  }): Promise<NullableType<User>> {
    if (!socialId || !provider) return null;

    const entity = await this.usersRepository.findOne({
      where: { socialId, provider },
    });

    return entity ? UserMapper.toDomain(entity) : null;
  }

  async update(id: User['id'], payload: Partial<User>): Promise<User> {
    const entity = await this.usersRepository.findOne({
      where: { id: Number(id) },
    });

    if (!entity) {
      throw new Error('User not found');
    }

    const updatedEntity = await this.usersRepository.save(
      this.usersRepository.create(
        UserMapper.toPersistence({
          ...UserMapper.toDomain(entity),
          ...payload,
        }),
      ),
    );

    return UserMapper.toDomain(updatedEntity);
  }

  async findMany(filters: {
    search?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    roleId?: number;
    statusId?: number;
    clientId?: number;
    systemRoleId?: number;
    clientRoleId?: number;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
  }): Promise<{ data: User[]; total: number }> {
    const whereConditions: any = {};
    const relations = ['role', 'status', 'photo'];

    // Status filter
    if (filters.statusId) {
      whereConditions.status = { id: filters.statusId };
    }

    // Role filter
    if (filters.roleId) {
      whereConditions.role = { id: filters.roleId };
    }

    // Search conditions
    const searchConditions: any[] = [];

    if (filters.search) {
      searchConditions.push(
        { firstName: Like(`%${filters.search}%`) },
        { lastName: Like(`%${filters.search}%`) },
        { email: Like(`%${filters.search}%`) },
      );
    }

    if (filters.firstName) {
      searchConditions.push({ firstName: Like(`%${filters.firstName}%`) });
    }

    if (filters.lastName) {
      searchConditions.push({ lastName: Like(`%${filters.lastName}%`) });
    }

    if (filters.email) {
      searchConditions.push({ email: Like(`%${filters.email}%`) });
    }

    // Combine where conditions
    let where: any;
    if (searchConditions.length > 0) {
      where = searchConditions.map((searchCondition) => ({
        ...whereConditions,
        ...searchCondition,
      }));
    } else {
      where = whereConditions;
    }

    // Build order object
    const order: any = {};
    if (filters.sortBy && filters.sortOrder) {
      order[filters.sortBy] = filters.sortOrder;
    }

    const [data, total] = await this.usersRepository.findAndCount({
      where,
      relations,
      skip: ((filters.page || 1) - 1) * (filters.limit || 10),
      take: filters.limit || 10,
      order: Object.keys(order).length > 0 ? order : undefined,
    });

    return {
      data: data.map((item) => UserMapper.toDomain(item)),
      total,
    };
  }

  async remove(id: User['id']): Promise<void> {
    await this.usersRepository.softDelete(id);
  }
}
