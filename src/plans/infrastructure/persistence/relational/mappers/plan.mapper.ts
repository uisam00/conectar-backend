import { Injectable } from '@nestjs/common';
import { PlanEntity } from '../entities/plan.entity';
import { Plan } from '../../../../domain/plan';

@Injectable()
export class PlanMapper {
  toDomain(raw: PlanEntity): Plan {
    const domain = new Plan();
    domain.id = raw.id;
    domain.name = raw.name;
    domain.description = raw.description;
    domain.price = raw.price;
    domain.createdAt = raw.createdAt;
    domain.updatedAt = raw.updatedAt;
    domain.deletedAt = raw.deletedAt;
    return domain;
  }

  toPersistence(domain: Plan): Partial<PlanEntity> {
    const entity = new PlanEntity();
    entity.id = domain.id as number;
    entity.name = domain.name;
    entity.description = domain.description;
    entity.price = domain.price;
    return entity;
  }
}
