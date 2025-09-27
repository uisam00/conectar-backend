import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIsSpecialToPlans1758948735437 implements MigrationInterface {
  name = 'AddIsSpecialToPlans1758948735437';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "plans" ADD "isSpecial" boolean NOT NULL DEFAULT false`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "plans" DROP COLUMN "isSpecial"`);
  }
}
