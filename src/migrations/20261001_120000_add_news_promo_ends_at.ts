import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/** วันสิ้นสุดโปรของข่าว (zip #40) — หลังวันนี้หน้าจะ noindex + ขึ้นป้าย "โปรนี้สิ้นสุดแล้ว" + หลุดจาก sitemap */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "cms"."news" ADD COLUMN IF NOT EXISTS "promo_ends_at" timestamp(3) with time zone;
   ALTER TABLE "cms"."_news_v" ADD COLUMN IF NOT EXISTS "version_promo_ends_at" timestamp(3) with time zone;`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "cms"."news" DROP COLUMN IF EXISTS "promo_ends_at";
   ALTER TABLE "cms"."_news_v" DROP COLUMN IF EXISTS "version_promo_ends_at";`)
}
