import { Injectable } from '@nestjs/common';
import { PlanRepository } from './infrastructure/persistence/plan.repository';
import { Plan } from './domain/plan';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';
import { QueryPlanDto } from './dto/query-plan.dto';

@Injectable()
export class PlansService {
  constructor(private readonly planRepository: PlanRepository) {}

  async create(createPlanDto: CreatePlanDto): Promise<Plan> {
    return this.planRepository.create(createPlanDto);
  }

  async findMany(
    queryDto: QueryPlanDto,
  ): Promise<{ data: Plan[]; total: number }> {
    return this.planRepository.findMany(queryDto);
  }

  async findById(id: number): Promise<Plan | null> {
    return this.planRepository.findById(id);
  }

  async update(id: number, updatePlanDto: UpdatePlanDto): Promise<Plan> {
    return this.planRepository.update(id, updatePlanDto);
  }

  async delete(id: number): Promise<void> {
    return this.planRepository.delete(id);
  }
}
