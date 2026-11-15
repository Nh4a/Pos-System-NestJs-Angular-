import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTableUser1794725786332 implements MigrationInterface {
  name = 'CreateTableUser1794725786332';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "users" ("id" SERIAL NOT NULL, "userName" character varying NOT NULL, "gmail" character varying NOT NULL, "password" character varying NOT NULL, "profileImageUrl" character varying, "role" character varying, "createdDate" TIMESTAMP NOT NULL DEFAULT now(), "updatedDate" TIMESTAMP NOT NULL DEFAULT now(), "deletedDate" TIMESTAMP, CONSTRAINT "UQ_97429b42372c6d841a8fc0ad871" UNIQUE ("gmail"), CONSTRAINT "UQ_450a05c0c4de5b75ac8d34835b9" UNIQUE ("password"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "users"`);
  }
}
