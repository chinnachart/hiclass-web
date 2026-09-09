import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * เพิ่มช่องโซเชียลของแต่ละสาขา (Facebook / Instagram / TikTok / YouTube)
 * เพื่อให้หน้าสาขาบนเว็บลิงก์ไปเพจของสาขานั้นได้ตรง ไม่ต้องผ่าน Linktree
 * ทุกคอลัมน์เป็น nullable — ปลอดภัยกับข้อมูลเดิม
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "cms"."branches" ADD COLUMN IF NOT EXISTS "facebook_url" varchar;
   ALTER TABLE "cms"."branches" ADD COLUMN IF NOT EXISTS "instagram_url" varchar;
   ALTER TABLE "cms"."branches" ADD COLUMN IF NOT EXISTS "tiktok_url" varchar;
   ALTER TABLE "cms"."branches" ADD COLUMN IF NOT EXISTS "youtube_url" varchar;`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "cms"."branches" DROP COLUMN IF EXISTS "facebook_url";
   ALTER TABLE "cms"."branches" DROP COLUMN IF EXISTS "instagram_url";
   ALTER TABLE "cms"."branches" DROP COLUMN IF EXISTS "tiktok_url";
   ALTER TABLE "cms"."branches" DROP COLUMN IF EXISTS "youtube_url";`)
}
