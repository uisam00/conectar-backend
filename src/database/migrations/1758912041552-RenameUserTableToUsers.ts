import { MigrationInterface, QueryRunner } from 'typeorm';

export class RenameUserTableToUsers1758912041552 implements MigrationInterface {
  name = 'RenameUserTableToUsers1758912041552';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Rename the table from 'user' to 'users'
    await queryRunner.query(`ALTER TABLE "user" RENAME TO "users"`);
    
    // Create indexes on the renamed table
    await queryRunner.query(
      `CREATE INDEX "IDX_2025eaefc4e1b443c84f6ca9b2" ON "users" ("socialId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_5372672fbfd1677205e0ce3ece" ON "users" ("firstName")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_af99afb7cf88ce20aff6977e68" ON "users" ("lastName")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes before renaming back
    await queryRunner.query(
      `DROP INDEX "public"."IDX_af99afb7cf88ce20aff6977e68"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_5372672fbfd1677205e0ce3ece"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_2025eaefc4e1b443c84f6ca9b2"`,
    );
    
    // Rename the table back from 'users' to 'user'
    await queryRunner.query(`ALTER TABLE "users" RENAME TO "user"`);
  }
}
