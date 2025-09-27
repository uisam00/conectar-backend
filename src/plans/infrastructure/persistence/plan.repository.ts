import { Plan } from '../../domain/plan';

export abstract class PlanRepository {
  abstract create(
    data: Omit<Plan, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>,
  ): Promise<Plan>;
  abstract findMany(filters: {
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<{ data: Plan[]; total: number }>;
  abstract findById(id: Plan['id']): Promise<Plan | null>;
  abstract update(id: Plan['id'], data: Partial<Plan>): Promise<Plan>;
  abstract delete(id: Plan['id']): Promise<void>;
}
