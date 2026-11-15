import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdatePasswordColumnOnUsersTbl1794733703274 implements MigrationInterface {
    name = 'UpdatePasswordColumnOnUsersTbl1794733703274'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "UQ_450a05c0c4de5b75ac8d34835b9"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "UQ_450a05c0c4de5b75ac8d34835b9" UNIQUE ("password")`);
    }

}
