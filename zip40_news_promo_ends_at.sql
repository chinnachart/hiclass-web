-- zip #40 — รันบน Supabase bivrzphxfmudsvtkcnpl แล้ว 2 ต.ค. 2569 (Claude รันผ่าน apply_migration) · เก็บไว้เผื่อต้องรันซ้ำ
ALTER TABLE "cms"."news" ADD COLUMN IF NOT EXISTS "promo_ends_at" timestamp(3) with time zone;
ALTER TABLE "cms"."_news_v" ADD COLUMN IF NOT EXISTS "version_promo_ends_at" timestamp(3) with time zone;
INSERT INTO cms.payload_migrations (name, batch, created_at, updated_at)
SELECT '20261001_120000_add_news_promo_ends_at', 14, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM cms.payload_migrations WHERE name = '20261001_120000_add_news_promo_ends_at');
-- ถอนกลับ:
-- DELETE FROM cms.payload_migrations WHERE name='20261001_120000_add_news_promo_ends_at';
-- ALTER TABLE cms.news DROP COLUMN promo_ends_at; ALTER TABLE cms._news_v DROP COLUMN version_promo_ends_at;
