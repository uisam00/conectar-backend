import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPhotoToClients1759090017118 implements MigrationInterface {
  name = 'AddPhotoToClients1759090017118';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "clients" ADD "photoId" uuid`);
    await queryRunner.query(
      `ALTER TABLE "clients" ADD CONSTRAINT "FK_34bc7c36cd5f40874becd9547c3" FOREIGN KEY ("photoId") REFERENCES "file"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "clients" DROP CONSTRAINT "FK_34bc7c36cd5f40874becd9547c3"`,
    );
    await queryRunner.query(`ALTER TABLE "clients" DROP COLUMN "photoId"`);
  }
}
