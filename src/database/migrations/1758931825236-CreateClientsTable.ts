import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateClientsTable1758931825236 implements MigrationInterface {
  name = 'CreateClientsTable1758931825236';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "clients" ("id" SERIAL NOT NULL, "razaoSocial" character varying(255) NOT NULL, "cnpj" character varying(18) NOT NULL, "nomeComercial" character varying(255), "statusId" integer NOT NULL, "planId" integer NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, CONSTRAINT "UQ_c2528f5ea78df3e939950b861c0" UNIQUE ("cnpj"), CONSTRAINT "PK_f1ab7cf3a5714dbc6bb4e1c28a4" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_c2528f5ea78df3e939950b861c" ON "clients" ("cnpj") `,
    );
    await queryRunner.query(
      `ALTER TABLE "clients" ADD CONSTRAINT "FK_f35e02376b6d48ffaba221d71fc" FOREIGN KEY ("statusId") REFERENCES "status"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "clients" ADD CONSTRAINT "FK_f43f980394c1c202377138eace7" FOREIGN KEY ("planId") REFERENCES "plans"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "clients" DROP CONSTRAINT "FK_f43f980394c1c202377138eace7"`,
    );
    await queryRunner.query(
      `ALTER TABLE "clients" DROP CONSTRAINT "FK_f35e02376b6d48ffaba221d71fc"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_c2528f5ea78df3e939950b861c"`,
    );
    await queryRunner.query(`DROP TABLE "clients"`);
  }
}
