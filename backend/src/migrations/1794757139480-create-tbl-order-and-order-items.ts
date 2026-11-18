import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateTblOrderAndOrderItems1794757139480 implements MigrationInterface {
    name = 'CreateTblOrderAndOrderItems1794757139480'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "order_items" ("orderItemId" uuid NOT NULL DEFAULT uuid_generate_v4(), "productName" character varying, "price" numeric(12,2) NOT NULL, "quantity" integer NOT NULL, "subtotal" numeric(12,2) NOT NULL, "orderId" uuid, "productId" integer, CONSTRAINT "PK_4e1bb5fea3ad96dcc899be6cc7d" PRIMARY KEY ("orderItemId"))`);
        await queryRunner.query(`CREATE TYPE "public"."orders_paymentmethod_enum" AS ENUM('cash', 'aba', 'khqr')`);
        await queryRunner.query(`CREATE TABLE "orders" ("orderId" uuid NOT NULL DEFAULT uuid_generate_v4(), "receiptNumber" character varying NOT NULL, "itemCount" integer NOT NULL, "total" numeric(12,2) NOT NULL, "paymentMethod" "public"."orders_paymentmethod_enum" NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_738372672d510f04c993cdbedfe" UNIQUE ("receiptNumber"), CONSTRAINT "PK_41ba27842ac1a2c24817ca59eaa" PRIMARY KEY ("orderId"))`);
        await queryRunner.query(`ALTER TABLE "order_items" ADD CONSTRAINT "FK_f1d359a55923bb45b057fbdab0d" FOREIGN KEY ("orderId") REFERENCES "orders"("orderId") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "order_items" ADD CONSTRAINT "FK_cdb99c05982d5191ac8465ac010" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "order_items" DROP CONSTRAINT "FK_cdb99c05982d5191ac8465ac010"`);
        await queryRunner.query(`ALTER TABLE "order_items" DROP CONSTRAINT "FK_f1d359a55923bb45b057fbdab0d"`);
        await queryRunner.query(`DROP TABLE "orders"`);
        await queryRunner.query(`DROP TYPE "public"."orders_paymentmethod_enum"`);
        await queryRunner.query(`DROP TABLE "order_items"`);
    }

}
