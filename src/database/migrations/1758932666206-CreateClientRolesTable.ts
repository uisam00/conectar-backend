import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateClientRolesTable1758932666206 implements MigrationInterface {
  name = 'CreateClientRolesTable1758932666206';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "client_roles" ("id" SERIAL NOT NULL, "name" character varying(100) NOT NULL, "description" text, "permissions" jsonb, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, CONSTRAINT "PK_a5a9c0425b901eff17bcbc8458e" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "client_roles"`);
  }
}
