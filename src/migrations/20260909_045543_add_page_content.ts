import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "cms"."enum_page_content_aw_items_level" AS ENUM('national', 'apac');
  CREATE TYPE "cms"."enum_page_content_sv_services_icon" AS ENUM('wrench', 'shield', 'bolt', 'key', 'car', 'wheel', 'clock', 'phone', 'chat', 'pin', 'check');
  
  CREATE TABLE IF NOT EXISTS "cms"."page_content_aw_stats" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" varchar NOT NULL,
  	"label" varchar NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "cms"."page_content_aw_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"year" numeric NOT NULL,
  	"title" varchar NOT NULL,
  	"level" "cms"."enum_page_content_aw_items_level" DEFAULT 'national' NOT NULL,
  	"th" varchar NOT NULL,
  	"event" varchar NOT NULL,
  	"count" numeric
  );
  
  CREATE TABLE IF NOT EXISTS "cms"."page_content_aw_year_photos" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"year" numeric NOT NULL,
  	"image_id" integer NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "cms"."page_content_rt_faq" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"question" varchar NOT NULL,
  	"answer" varchar NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "cms"."page_content_sv_services" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"icon" "cms"."enum_page_content_sv_services_icon" DEFAULT 'wrench',
  	"title" varchar NOT NULL,
  	"body" varchar NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "cms"."page_content_sv_faq" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"question" varchar NOT NULL,
  	"answer" varchar NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "cms"."page_content_ti_faq" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"question" varchar NOT NULL,
  	"answer" varchar NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "cms"."page_content" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"aw_kicker" varchar,
  	"aw_as_of" varchar,
  	"aw_headline" varchar,
  	"aw_headline2" varchar,
  	"aw_lead" varchar,
  	"aw_hero_image_id" integer,
  	"aw_tech_title" varchar,
  	"aw_tech_sub" varchar,
  	"aw_tech_note" varchar,
  	"aw_tech_image_id" integer,
  	"aw_cta_title" varchar,
  	"aw_cta_sub" varchar,
  	"aw_seo_title" varchar,
  	"aw_seo_desc" varchar,
  	"rt_kicker" varchar,
  	"rt_title" varchar,
  	"rt_lead" varchar,
  	"rt_fineprint" varchar,
  	"rt_seo_title" varchar,
  	"rt_seo_desc" varchar,
  	"sv_kicker" varchar,
  	"sv_title" varchar,
  	"sv_lead" varchar,
  	"sv_seo_title" varchar,
  	"sv_seo_desc" varchar,
  	"ti_kicker" varchar,
  	"ti_title" varchar,
  	"ti_lead" varchar,
  	"ti_seo_title" varchar,
  	"ti_seo_desc" varchar,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  ALTER TABLE "cms"."page_content_aw_stats" ADD CONSTRAINT "page_content_aw_stats_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "cms"."page_content"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cms"."page_content_aw_items" ADD CONSTRAINT "page_content_aw_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "cms"."page_content"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cms"."page_content_aw_year_photos" ADD CONSTRAINT "page_content_aw_year_photos_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "cms"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "cms"."page_content_aw_year_photos" ADD CONSTRAINT "page_content_aw_year_photos_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "cms"."page_content"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cms"."page_content_rt_faq" ADD CONSTRAINT "page_content_rt_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "cms"."page_content"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cms"."page_content_sv_services" ADD CONSTRAINT "page_content_sv_services_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "cms"."page_content"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cms"."page_content_sv_faq" ADD CONSTRAINT "page_content_sv_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "cms"."page_content"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cms"."page_content_ti_faq" ADD CONSTRAINT "page_content_ti_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "cms"."page_content"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cms"."page_content" ADD CONSTRAINT "page_content_aw_hero_image_id_media_id_fk" FOREIGN KEY ("aw_hero_image_id") REFERENCES "cms"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "cms"."page_content" ADD CONSTRAINT "page_content_aw_tech_image_id_media_id_fk" FOREIGN KEY ("aw_tech_image_id") REFERENCES "cms"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX IF NOT EXISTS "page_content_aw_stats_order_idx" ON "cms"."page_content_aw_stats" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "page_content_aw_stats_parent_id_idx" ON "cms"."page_content_aw_stats" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "page_content_aw_items_order_idx" ON "cms"."page_content_aw_items" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "page_content_aw_items_parent_id_idx" ON "cms"."page_content_aw_items" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "page_content_aw_year_photos_order_idx" ON "cms"."page_content_aw_year_photos" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "page_content_aw_year_photos_parent_id_idx" ON "cms"."page_content_aw_year_photos" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "page_content_aw_year_photos_image_idx" ON "cms"."page_content_aw_year_photos" USING btree ("image_id");
  CREATE INDEX IF NOT EXISTS "page_content_rt_faq_order_idx" ON "cms"."page_content_rt_faq" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "page_content_rt_faq_parent_id_idx" ON "cms"."page_content_rt_faq" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "page_content_sv_services_order_idx" ON "cms"."page_content_sv_services" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "page_content_sv_services_parent_id_idx" ON "cms"."page_content_sv_services" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "page_content_sv_faq_order_idx" ON "cms"."page_content_sv_faq" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "page_content_sv_faq_parent_id_idx" ON "cms"."page_content_sv_faq" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "page_content_ti_faq_order_idx" ON "cms"."page_content_ti_faq" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "page_content_ti_faq_parent_id_idx" ON "cms"."page_content_ti_faq" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "page_content_aw_hero_image_idx" ON "cms"."page_content" USING btree ("aw_hero_image_id");
  CREATE INDEX IF NOT EXISTS "page_content_aw_tech_image_idx" ON "cms"."page_content" USING btree ("aw_tech_image_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
  DROP TABLE IF EXISTS "cms"."page_content_aw_stats" CASCADE;
  DROP TABLE IF EXISTS "cms"."page_content_aw_items" CASCADE;
  DROP TABLE IF EXISTS "cms"."page_content_aw_year_photos" CASCADE;
  DROP TABLE IF EXISTS "cms"."page_content_rt_faq" CASCADE;
  DROP TABLE IF EXISTS "cms"."page_content_sv_services" CASCADE;
  DROP TABLE IF EXISTS "cms"."page_content_sv_faq" CASCADE;
  DROP TABLE IF EXISTS "cms"."page_content_ti_faq" CASCADE;
  DROP TABLE IF EXISTS "cms"."page_content" CASCADE;
  DROP TYPE "cms"."enum_page_content_aw_items_level";
  DROP TYPE "cms"."enum_page_content_sv_services_icon";`)
}
