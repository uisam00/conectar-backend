import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PlanEntity } from '../../../../plans/infrastructure/persistence/relational/entities/plan.entity';

@Injectable()
export class PlanSeedService {
  constructor(
    @InjectRepository(PlanEntity)
    private repository: Repository<PlanEntity>,
  ) {}

  async run() {
    const count = await this.repository.count();

    if (!count) {
      await this.repository.query(`
        INSERT INTO plans (id, name, description, price, "isSpecial", "createdAt", "updatedAt") VALUES
        (1, 'Conéctar Básico', 'Plano ideal para pequenos produtores e feirantes', 99.90, false, NOW(), NOW()),
        (2, 'Conéctar Crescimento', 'Plano para produtores em expansão e distribuidores', 199.90, false, NOW(), NOW()),
        (3, 'Conéctar Completo', 'Plano completo para cooperativas e grandes produtores', 399.90, false, NOW(), NOW()),
        (4, 'Conéctar Premium', 'Plano especial com rastreabilidade e certificações orgânicas', 799.90, true, NOW(), NOW()),
        (5, 'Conéctar VIP', 'Plano especial para grandes redes de supermercados', 1299.90, true, NOW(), NOW())
      `);
    }
  }
}
