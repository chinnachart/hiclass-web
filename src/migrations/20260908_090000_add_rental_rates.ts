import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE IF NOT EXISTS "cms"."car_models_rental_rates" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"variant" varchar NOT NULL,
  	"day1" numeric,
  	"day3" numeric,
  	"day7" numeric,
  	"day30" numeric
  );

  DO $$ BEGIN
   ALTER TABLE "cms"."car_models_rental_rates" ADD CONSTRAINT "car_models_rental_rates_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "cms"."car_models"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN null; END $$;
  CREATE INDEX IF NOT EXISTS "car_models_rental_rates_order_idx" ON "cms"."car_models_rental_rates" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "car_models_rental_rates_parent_id_idx" ON "cms"."car_models_rental_rates" USING btree ("_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "cms"."car_models_rental_rates" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "cms"."car_models_rental_rates" CASCADE;`)
}
