import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateCategoryColumn1795068441424 implements MigrationInterface {
    name = 'UpdateCategoryColumn1795068441424'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "categories" ALTER COLUMN "imageUrl" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "categories" ALTER COLUMN "imagePublicId" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "categories" ALTER COLUMN "imagePublicId" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "categories" ALTER COLUMN "imageUrl" SET NOT NULL`);
    }

}
