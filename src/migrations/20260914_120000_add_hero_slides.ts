import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * สไลด์ข้อเสนอหน้าแรก (hero) — แก้ข้อความได้เองในหลังบ้าน
 * ตาราง array ของ global `site_settings` · ทุกช่องเว้นว่างได้
 * ถ้าไม่มีแถวเลย หน้าเว็บจะใช้ค่าตั้งต้นใน src/lib/heroSlides.ts (ไม่มีทางเกิดหน้าว่าง)
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   DO $$ BEGIN
     CREATE TYPE "cms"."enum_site_settings_hero_slides_cta_kind" AS ENUM('gold', 'line', 'red');
   EXCEPTION WHEN duplicate_object THEN null; END $$;

   DO $$ BEGIN
     CREATE TYPE "cms"."enum_site_settings_hero_slides_accent" AS ENUM('gold', 'line', 'red');
   EXCEPTION WHEN duplicate_object THEN null; END $$;

   CREATE TABLE IF NOT EXISTS "cms"."site_settings_hero_slides" (
     "_order" integer NOT NULL,
     "_parent_id" integer NOT NULL,
     "id" varchar PRIMARY KEY NOT NULL,
     "enabled" boolean DEFAULT true,
     "kicker" varchar,
     "title" varchar,
     "sub" varchar,
     "cta_label" varchar,
     "cta_href" varchar,
     "cta_kind" "cms"."enum_site_settings_hero_slides_cta_kind" DEFAULT 'gold',
     "ghost_label" varchar,
     "ghost_href" varchar,
     "note" varchar,
     "chips" varchar,
     "accent" "cms"."enum_site_settings_hero_slides_accent" DEFAULT 'gold',
     "center" boolean DEFAULT false
   );

   DO $$ BEGIN
     ALTER TABLE "cms"."site_settings_hero_slides"
       ADD CONSTRAINT "site_settings_hero_slides_parent_id_fk"
       FOREIGN KEY ("_parent_id") REFERENCES "cms"."site_settings"("id")
       ON DELETE cascade ON UPDATE no action;
   EXCEPTION WHEN duplicate_object THEN null; END $$;

   CREATE INDEX IF NOT EXISTS "site_settings_hero_slides_order_idx" ON "cms"."site_settings_hero_slides" ("_order");
   CREATE INDEX IF NOT EXISTS "site_settings_hero_slides_parent_id_idx" ON "cms"."site_settings_hero_slides" ("_parent_id");`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE IF EXISTS "cms"."site_settings_hero_slides";
   DROP TYPE IF EXISTS "cms"."enum_site_settings_hero_slides_cta_kind";
   DROP TYPE IF EXISTS "cms"."enum_site_settings_hero_slides_accent";`)
}
