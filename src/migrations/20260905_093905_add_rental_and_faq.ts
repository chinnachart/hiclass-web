import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "cms"."car_models_faq" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"question" varchar NOT NULL,
  	"answer" varchar NOT NULL
  );
  
  ALTER TABLE "cms"."car_models" ADD COLUMN "rental_available" boolean;
  ALTER TABLE "cms"."car_models" ADD COLUMN "rental_daily" numeric;
  ALTER TABLE "cms"."car_models" ADD COLUMN "rental_monthly" numeric;
  ALTER TABLE "cms"."car_models_faq" ADD CONSTRAINT "car_models_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "cms"."car_models"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "car_models_faq_order_idx" ON "cms"."car_models_faq" USING btree ("_order");
  CREATE INDEX "car_models_faq_parent_id_idx" ON "cms"."car_models_faq" USING btree ("_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "cms"."car_models_faq" CASCADE;
  ALTER TABLE "cms"."car_models" DROP COLUMN "rental_available";
  ALTER TABLE "cms"."car_models" DROP COLUMN "rental_daily";
  ALTER TABLE "cms"."car_models" DROP COLUMN "rental_monthly";`)
}
