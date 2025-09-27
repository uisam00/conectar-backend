import { ClientRole } from '../../domain/client-role';

export abstract class ClientRoleRepository {
  abstract create(
    data: Omit<ClientRole, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>,
  ): Promise<ClientRole>;
  abstract findMany(filters: {
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<{ data: ClientRole[]; total: number }>;
  abstract findById(id: ClientRole['id']): Promise<ClientRole | null>;
  abstract update(
    id: ClientRole['id'],
    data: Partial<ClientRole>,
  ): Promise<ClientRole>;
  abstract delete(id: ClientRole['id']): Promise<void>;
}
