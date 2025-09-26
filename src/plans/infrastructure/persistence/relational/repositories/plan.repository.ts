import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PlanEntity } from '../entities/plan.entity';
import { PlanMapper } from '../mappers/plan.mapper';
import { PlanRepository } from '../../plan.repository';
import { Plan } from '../../../../domain/plan';

@Injectable()
export class PlanRelationalRepository implements PlanRepository {
  constructor(
    @InjectRepository(PlanEntity)
    private readonly planRepository: Repository<PlanEntity>,
    private readonly mapper: PlanMapper,
  ) {}

  async create(data: Omit<Plan, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>): Promise<Plan> {
    const persistenceModel = this.mapper.toPersistence(data as Plan);
    const newEntity = await this.planRepository.save(
      this.planRepository.create(persistenceModel),
    );
    return this.mapper.toDomain(newEntity);
  }

  async findMany(filters: {
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<{ data: Plan[]; total: number }> {
    const queryBuilder = this.planRepository.createQueryBuilder('plan');

    if (filters.search) {
      queryBuilder.andWhere('plan.name ILIKE :search OR plan.description ILIKE :search', {
        search: `%${filters.search}%`,
      });
    }

    const [data, total] = await queryBuilder
      .skip(((filters.page || 1) - 1) * (filters.limit || 10))
      .take(filters.limit || 10)
      .getManyAndCount();

    return {
      data: data.map((item) => this.mapper.toDomain(item)),
      total,
    };
  }

  async findById(id: Plan['id']): Promise<Plan | null> {
    const entity = await this.planRepository.findOne({
      where: { id: id as number },
    });

    return entity ? this.mapper.toDomain(entity) : null;
  }

  async update(id: Plan['id'], data: Partial<Plan>): Promise<Plan> {
    const entity = await this.planRepository.findOne({
      where: { id: id as number },
    });

    if (!entity) {
      throw new Error('Plan not found');
    }

    Object.assign(entity, data);
    const updatedEntity = await this.planRepository.save(entity);
    return this.mapper.toDomain(updatedEntity);
  }

  async delete(id: Plan['id']): Promise<void> {
    await this.planRepository.softDelete({ id: id as number });
  }
}
