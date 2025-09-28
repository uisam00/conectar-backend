import { Client } from '../../domain/client';
import { FilterUserDto, SortUserDto } from '../../../users/dto/query-user.dto';
import { User } from '../../../users/domain/user';
import { IPaginationOptions } from '../../../utils/types/pagination-options';

export abstract class ClientRepository {
  abstract create(
    data: Omit<Client, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>,
  ): Promise<Client>;
  abstract findMany(filters: {
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<{ data: Client[]; total: number }>;
  abstract findById(id: Client['id']): Promise<Client | null>;
  abstract findByUserId(userId: number): Promise<Client[]>;
  abstract findByCnpj(cnpj: string): Promise<Client | null>;
  abstract update(id: Client['id'], data: Partial<Client>): Promise<Client>;
  abstract delete(id: Client['id']): Promise<void>;
  abstract findUsersByClient(
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
  ): Promise<User[]>;
}
