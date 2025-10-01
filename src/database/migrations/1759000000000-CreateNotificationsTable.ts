import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateNotificationsTable1759000000000
  implements MigrationInterface
{
  name = 'CreateNotificationsTable1759000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "notifications" (
        "id" SERIAL NOT NULL,
        "type" character varying NOT NULL,
        "title" character varying NOT NULL,
        "message" text NOT NULL,
        "isRead" boolean NOT NULL DEFAULT false,
        "userId" integer,
        "clientId" integer,
        "metadata" jsonb,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "deletedAt" TIMESTAMP,
        CONSTRAINT "PK_notifications" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      ALTER TABLE "notifications" 
      ADD CONSTRAINT "FK_notifications_userId" 
      FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "notifications" 
      ADD CONSTRAINT "FK_notifications_clientId" 
      FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_notifications_userId" ON "notifications" ("userId")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_notifications_clientId" ON "notifications" ("clientId")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_notifications_type" ON "notifications" ("type")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_notifications_isRead" ON "notifications" ("isRead")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_notifications_isRead"`);
    await queryRunner.query(`DROP INDEX "IDX_notifications_type"`);
    await queryRunner.query(`DROP INDEX "IDX_notifications_clientId"`);
    await queryRunner.query(`DROP INDEX "IDX_notifications_userId"`);
    await queryRunner.query(
      `ALTER TABLE "notifications" DROP CONSTRAINT "FK_notifications_clientId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "notifications" DROP CONSTRAINT "FK_notifications_userId"`,
    );
    await queryRunner.query(`DROP TABLE "notifications"`);
  }
}
