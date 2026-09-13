import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * ป๊อปอัพแคมเปญหน้าแรก (ตั้งค่าเว็บไซต์ → แท็บ "ป๊อปอัพหน้าแรก")
 * nullable ทั้งหมด + สวิตช์ปิดไว้เป็นค่าเริ่มต้น — ปลอดภัยกับข้อมูลเดิม
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "cms"."site_settings"
     ADD COLUMN IF NOT EXISTS "popup_enabled" boolean DEFAULT false,
     ADD COLUMN IF NOT EXISTS "popup_image_id" integer,
     ADD COLUMN IF NOT EXISTS "popup_href" varchar DEFAULT '/test-drive',
     ADD COLUMN IF NOT EXISTS "popup_alt" varchar,
     ADD COLUMN IF NOT EXISTS "popup_start" timestamp(3) with time zone,
     ADD COLUMN IF NOT EXISTS "popup_end" timestamp(3) with time zone;

   DO $$ BEGIN
     ALTER TABLE "cms"."site_settings"
       ADD CONSTRAINT "site_settings_popup_image_id_media_id_fk"
       FOREIGN KEY ("popup_image_id") REFERENCES "cms"."media"("id") ON DELETE set null ON UPDATE no action;
   EXCEPTION WHEN duplicate_object THEN null; END $$;

   CREATE INDEX IF NOT EXISTS "site_settings_popup_image_idx" ON "cms"."site_settings" USING btree ("popup_image_id");`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP INDEX IF EXISTS "cms"."site_settings_popup_image_idx";
   ALTER TABLE "cms"."site_settings"
     DROP COLUMN IF EXISTS "popup_enabled",
     DROP COLUMN IF EXISTS "popup_image_id",
     DROP COLUMN IF EXISTS "popup_href",
     DROP COLUMN IF EXISTS "popup_alt",
     DROP COLUMN IF EXISTS "popup_start",
     DROP COLUMN IF EXISTS "popup_end";`)
}
