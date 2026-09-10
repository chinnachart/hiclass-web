import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * ตั้งค่า Google Ads conversion ในตั้งค่าเว็บไซต์ (แท็บ Google & การวัดผล)
 * nullable ทั้งหมด — ปลอดภัยกับข้อมูลเดิม
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "cms"."site_settings"
     ADD COLUMN IF NOT EXISTS "google_ads_id" varchar,
     ADD COLUMN IF NOT EXISTS "ads_label_test_drive" varchar,
     ADD COLUMN IF NOT EXISTS "ads_label_register" varchar,
     ADD COLUMN IF NOT EXISTS "ads_label_phone" varchar,
     ADD COLUMN IF NOT EXISTS "ads_label_line" varchar;`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "cms"."site_settings"
     DROP COLUMN IF EXISTS "google_ads_id",
     DROP COLUMN IF EXISTS "ads_label_test_drive",
     DROP COLUMN IF EXISTS "ads_label_register",
     DROP COLUMN IF EXISTS "ads_label_phone",
     DROP COLUMN IF EXISTS "ads_label_line";`)
}
