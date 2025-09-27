import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUserClientsTable1758933938597 implements MigrationInterface {
  name = 'CreateUserClientsTable1758933938597';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "user_clients" ("id" SERIAL NOT NULL, "userId" integer NOT NULL, "clientId" integer NOT NULL, "clientRoleId" integer, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, CONSTRAINT "PK_93fa1b9251af32ddc852b9eb787" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_clients" ADD CONSTRAINT "FK_5fa6406a4b9b6eed9204ee46598" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_clients" ADD CONSTRAINT "FK_91e1d6c0b3fec0b8479db6661c9" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_clients" ADD CONSTRAINT "FK_b821efd5c09f30dd396cc8ad55b" FOREIGN KEY ("clientRoleId") REFERENCES "client_roles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_clients" DROP CONSTRAINT "FK_b821efd5c09f30dd396cc8ad55b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_clients" DROP CONSTRAINT "FK_91e1d6c0b3fec0b8479db6661c9"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_clients" DROP CONSTRAINT "FK_5fa6406a4b9b6eed9204ee46598"`,
    );
    await queryRunner.query(`DROP TABLE "user_clients"`);
  }
}
