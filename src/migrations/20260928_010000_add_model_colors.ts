import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/** สีรถต่อรุ่น (zip #39) — ตาราง array ของ car-models แบบเดียวกับ variants/faq */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE IF NOT EXISTS "cms"."car_models_colors" (
     "_order" integer NOT NULL,
     "_parent_id" integer NOT NULL,
     "id" varchar PRIMARY KEY NOT NULL,
     "name" varchar NOT NULL,
     "hex" varchar,
     "image_id" integer
   );
   DO $$ BEGIN
     ALTER TABLE "cms"."car_models_colors" ADD CONSTRAINT "car_models_colors_parent_id_fk"
       FOREIGN KEY ("_parent_id") REFERENCES "cms"."car_models"("id") ON DELETE cascade ON UPDATE no action;
   EXCEPTION WHEN duplicate_object THEN null; END $$;
   DO $$ BEGIN
     ALTER TABLE "cms"."car_models_colors" ADD CONSTRAINT "car_models_colors_image_id_media_id_fk"
       FOREIGN KEY ("image_id") REFERENCES "cms"."media"("id") ON DELETE set null ON UPDATE no action;
   EXCEPTION WHEN duplicate_object THEN null; END $$;
   CREATE INDEX IF NOT EXISTS "car_models_colors_order_idx" ON "cms"."car_models_colors" USING btree ("_order");
   CREATE INDEX IF NOT EXISTS "car_models_colors_parent_id_idx" ON "cms"."car_models_colors" USING btree ("_parent_id");
   CREATE INDEX IF NOT EXISTS "car_models_colors_image_idx" ON "cms"."car_models_colors" USING btree ("image_id");`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`DROP TABLE IF EXISTS "cms"."car_models_colors" CASCADE;`)
}
