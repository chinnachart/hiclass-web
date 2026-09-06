import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "cms"."car_models_variants" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"price" numeric NOT NULL,
  	"note" varchar
  );
  
  ALTER TABLE "cms"."site_settings" ALTER COLUMN "hero_headline" SET DEFAULT 'ลองขับ BYD ใกล้บ้าน';
  ALTER TABLE "cms"."site_settings" ALTER COLUMN "hero_headline2" SET DEFAULT 'วันนี้ ฟรี';
  ALTER TABLE "cms"."site_settings" ALTER COLUMN "hero_sub" SET DEFAULT '5 สาขาในกรุงเทพฯ นัดออนไลน์ 1 นาที ทีมขายโทรยืนยันภายใน 1 ชั่วโมง';
  ALTER TABLE "cms"."branches" ADD COLUMN "line_url" varchar;
  ALTER TABLE "cms"."site_settings" ADD COLUMN "delivered_count" numeric;
  ALTER TABLE "cms"."site_settings" ADD COLUMN "years_open" numeric;
  ALTER TABLE "cms"."site_settings" ADD COLUMN "google_rating" numeric;
  ALTER TABLE "cms"."site_settings" ADD COLUMN "trust_note" varchar;
  ALTER TABLE "cms"."site_settings" ADD COLUMN "ga_measurement_id" varchar;
  ALTER TABLE "cms"."site_settings" ADD COLUMN "google_site_verification" varchar;
  ALTER TABLE "cms"."car_models_variants" ADD CONSTRAINT "car_models_variants_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "cms"."car_models"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "car_models_variants_order_idx" ON "cms"."car_models_variants" USING btree ("_order");
  CREATE INDEX "car_models_variants_parent_id_idx" ON "cms"."car_models_variants" USING btree ("_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "cms"."car_models_variants" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "cms"."car_models_variants" CASCADE;
  ALTER TABLE "cms"."site_settings" ALTER COLUMN "hero_headline" SET DEFAULT 'Build Your Dream';
  ALTER TABLE "cms"."site_settings" ALTER COLUMN "hero_headline2" SET DEFAULT 'เริ่มที่คันที่ใช่';
  ALTER TABLE "cms"."site_settings" ALTER COLUMN "hero_sub" SET DEFAULT 'เลือกรุ่น ดูค่างวดจริง แล้วนัดลองขับที่สาขาใกล้บ้าน — จบได้ในหน้าเดียว';
  ALTER TABLE "cms"."branches" DROP COLUMN "line_url";
  ALTER TABLE "cms"."site_settings" DROP COLUMN "delivered_count";
  ALTER TABLE "cms"."site_settings" DROP COLUMN "years_open";
  ALTER TABLE "cms"."site_settings" DROP COLUMN "google_rating";
  ALTER TABLE "cms"."site_settings" DROP COLUMN "trust_note";
  ALTER TABLE "cms"."site_settings" DROP COLUMN "ga_measurement_id";
  ALTER TABLE "cms"."site_settings" DROP COLUMN "google_site_verification";`)
}
