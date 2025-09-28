import { DeepPartial } from '../../../utils/types/deep-partial.type';
import { NullableType } from '../../../utils/types/nullable.type';
import { IPaginationOptions } from '../../../utils/types/pagination-options';
import { User } from '../../domain/user';

export abstract class UserRepository {
  abstract create(
    data: Omit<User, 'id' | 'createdAt' | 'deletedAt' | 'updatedAt'> & {
      clientAssociations?: { clientId: number; clientRoleId?: number }[];
    },
  ): Promise<User>;

  abstract findManyWithPagination({
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
  }): Promise<User[]>;

  abstract findMany(filters: {
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
  }): Promise<{ data: User[]; total: number }>;

  abstract findById(id: User['id']): Promise<NullableType<User>>;
  abstract findByIds(ids: User['id'][]): Promise<User[]>;
  abstract findByEmail(email: User['email']): Promise<NullableType<User>>;
  abstract findBySocialIdAndProvider({
    socialId,
    provider,
  }: {
    socialId: User['socialId'];
    provider: User['provider'];
  }): Promise<NullableType<User>>;

  abstract update(
    id: User['id'],
    payload: DeepPartial<User>,
  ): Promise<User | null>;

  abstract remove(id: User['id']): Promise<void>;
}
