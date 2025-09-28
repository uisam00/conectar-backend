import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { FindOptionsWhere, Repository, In } from 'typeorm';
import { UserEntity } from '../entities/user.entity';
import { NullableType } from '../../../../../utils/types/nullable.type';
import { FilterUserDto, SortUserDto } from '../../../../dto/query-user.dto';
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

  async create(data: User): Promise<User> {
    const persistenceModel = UserMapper.toPersistence(data);
    const newEntity = await this.usersRepository.save(
      this.usersRepository.create(persistenceModel),
    );
    return UserMapper.toDomain(newEntity);
  }

  async findManyWithPagination({
    filterOptions,
    sortOptions,
    paginationOptions,
  }: {
    filterOptions?: FilterUserDto | null;
    sortOptions?: SortUserDto[] | null;
    paginationOptions: IPaginationOptions;
  }): Promise<User[]> {
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

    // Para filtros de cliente e role do cliente, precisamos usar uma abordagem diferente
    // pois não são campos diretos da entidade User
    let userIds: number[] | undefined;

    if (filterOptions?.clientId || filterOptions?.clientRoleId) {
      // Buscar IDs dos usuários que atendem aos critérios de cliente/role do cliente
      const userClientQuery = this.usersRepository
        .createQueryBuilder('user')
        .select('user.id')
        .leftJoin('user_clients', 'uc', 'uc.userId = user.id');

      if (filterOptions?.clientId) {
        userClientQuery.andWhere('uc.clientId = :clientId', {
          clientId: filterOptions.clientId,
        });
      }

      if (filterOptions?.clientRoleId) {
        userClientQuery.andWhere('uc.clientRoleId = :clientRoleId', {
          clientRoleId: filterOptions.clientRoleId,
        });
      }

      const userClientResults = await userClientQuery.getMany();
      userIds = userClientResults.map((user) => user.id);

      // Se não encontrou usuários com os critérios de cliente, retornar array vazio
      if (userIds.length === 0) {
        return [];
      }
    }

    // Aplicar filtro de IDs se necessário
    if (userIds) {
      where.id = In(userIds);
    }

    // Construir ordenação
    const order: any = {};
    if (sortOptions?.length) {
      sortOptions.forEach((sort) => {
        order[sort.orderBy] = sort.order.toUpperCase();
      });
    }

    const entities = await this.usersRepository.find({
      where,
      relations,
      skip: (paginationOptions.page - 1) * paginationOptions.limit,
      take: paginationOptions.limit,
      order: Object.keys(order).length > 0 ? order : undefined,
    });

    return entities.map((user) => UserMapper.toDomain(user));
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

  async remove(id: User['id']): Promise<void> {
    await this.usersRepository.softDelete(id);
  }
}
