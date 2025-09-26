import { MigrationInterface, QueryRunner } from 'typeorm';

export class InsertInitialData1758776536627 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `INSERT INTO "role" ("id", "name") VALUES (1, 'admin') ON CONFLICT ("id") DO NOTHING`,
    );
    await queryRunner.query(
      `INSERT INTO "role" ("id", "name") VALUES (2, 'user') ON CONFLICT ("id") DO NOTHING`,
    );

    await queryRunner.query(
      `INSERT INTO "status" ("id", "name") VALUES (1, 'active') ON CONFLICT ("id") DO NOTHING`,
    );
    await queryRunner.query(
      `INSERT INTO "status" ("id", "name") VALUES (2, 'inactive') ON CONFLICT ("id") DO NOTHING`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remover dados iniciais das tabelas
    await queryRunner.query(`DELETE FROM "status" WHERE "id" IN (1, 2)`);
    await queryRunner.query(`DELETE FROM "role" WHERE "id" IN (1, 2)`);
  }
}
