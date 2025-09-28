import { Client } from '../../domain/client';
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
      paginationOptions,
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
      paginationOptions: IPaginationOptions;
    },
  ): Promise<User[]>;
}
