import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClientEntity } from '../../../../clients/infrastructure/persistence/relational/entities/client.entity';

@Injectable()
export class ClientSeedService {
  constructor(
    @InjectRepository(ClientEntity)
    private repository: Repository<ClientEntity>,
  ) {}

  async run() {
    const count = await this.repository.count();

    if (!count) {
      await this.repository.query(`
        INSERT INTO clients ("razaoSocial", "cnpj", "nomeComercial", "statusId", "planId", "createdAt", "updatedAt") VALUES
        ('Pequeno Produtor Rural Ltda', '12.345.678/0001-90', 'Pequeno Produtor', 1, 1, NOW(), NOW()),
        ('Fazenda São José S.A.', '98.765.432/0001-10', 'Fazenda São José', 1, 2, NOW(), NOW()),
        ('Cooperativa dos Produtores Rurais Ltda', '11.222.333/0001-44', 'CoopRural', 1, 3, NOW(), NOW()),
        ('Fazenda Orgânica Premium S.A.', '55.666.777/0001-88', 'Fazenda Orgânica', 1, 4, NOW(), NOW()),
        ('Supermercado Verde Ltda', '99.888.777/0001-66', 'Super Verde', 1, 5, NOW(), NOW()),
        ('Distribuidora Rural Ltda', '77.888.999/0001-22', 'Distribuidora Rural', 2, 4, NOW(), NOW()),
        ('Feira do Produtor Ltda', '33.444.555/0001-77', 'Feira do Produtor', 1, 1, NOW(), NOW()),
        ('Sítio Central S.A.', '66.777.888/0001-99', 'Sítio Central', 1, 2, NOW(), NOW()),
        ('Produtores Unidos Ltda', '22.333.444/0001-55', 'Produtores Unidos', 1, 3, NOW(), NOW()),
        ('Fazenda Sustentável S.A.', '88.999.111/0001-33', 'Fazenda Sustentável', 1, 4, NOW(), NOW()),
        ('Rede de Supermercados Naturais Ltda', '44.555.666/0001-88', 'Rede Naturais', 1, 5, NOW(), NOW()),
        ('Cooperativa Agrícola Regional Ltda', '77.888.999/0001-44', 'CoopAgrícola', 1, 1, NOW(), NOW()),
        ('Chácara Express S.A.', '11.222.333/0001-77', 'Chácara Express', 1, 2, NOW(), NOW()),
        ('Fazenda Tecnológica Ltda', '55.666.777/0001-22', 'Fazenda Tech', 1, 3, NOW(), NOW()),
        ('Distribuidora Premium S.A.', '99.111.222/0001-66', 'Distribuidora Premium', 1, 4, NOW(), NOW()),
        ('Mega Produtores Ltda', '33.444.555/0001-11', 'Mega Produtores', 1, 5, NOW(), NOW()),
        ('Produtores Orgânicos Ltda', '66.777.888/0001-44', 'Produtores Orgânicos', 2, 4, NOW(), NOW()),
        ('Sítio do Campo S.A.', '22.333.444/0001-99', 'Sítio do Campo', 1, 1, NOW(), NOW()),
        ('Fazenda Verde Vida Ltda', '88.999.111/0001-55', 'Verde Vida', 1, 2, NOW(), NOW()),
        ('Cooperativa dos Agricultores Ltda', '44.555.666/0001-33', 'CoopAgricultores', 1, 3, NOW(), NOW())
      `);
    }
  }
}
