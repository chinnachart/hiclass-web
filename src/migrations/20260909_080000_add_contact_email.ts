import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * เพิ่มอีเมลกลางสำหรับลูกค้าติดต่อในตั้งค่าเว็บไซต์ (แสดงท้ายเว็บ / หน้าติดต่อเรา / JSON-LD)
 * nullable — ปลอดภัยกับข้อมูลเดิม
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "cms"."site_settings" ADD COLUMN IF NOT EXISTS "contact_email" varchar;`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "cms"."site_settings" DROP COLUMN IF EXISTS "contact_email";`)
}
