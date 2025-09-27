import { Client } from '../../domain/client';

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
}
