import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  // เนื้อหาเว็บอยู่คนละ schema กับตารางของ CRM
  await db.execute(sql`CREATE SCHEMA IF NOT EXISTS "cms";`)

  await db.execute(sql`
   CREATE TYPE "cms"."enum_car_models_body_type" AS ENUM('suv', 'sedan', 'hatch', 'mpv');
  CREATE TYPE "cms"."enum_news_category" AS ENUM('news', 'event', 'guide', 'service');
  CREATE TYPE "cms"."enum_news_status" AS ENUM('draft', 'published');
  CREATE TYPE "cms"."enum__news_v_version_category" AS ENUM('news', 'event', 'guide', 'service');
  CREATE TYPE "cms"."enum__news_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "cms"."enum_users_role" AS ENUM('admin', 'editor');
  CREATE TABLE "cms"."car_models_specs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"value" varchar NOT NULL
  );
  
  CREATE TABLE "cms"."car_models" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"body_type" "cms"."enum_car_models_body_type" NOT NULL,
  	"tagline" varchar NOT NULL,
  	"price_from" numeric NOT NULL,
  	"range_km" numeric,
  	"colors_count" numeric,
  	"hero_image_id" integer,
  	"sort_order" numeric DEFAULT 100,
  	"published" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "cms"."car_models_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"media_id" integer
  );
  
  CREATE TABLE "cms"."promotions" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"summary" varchar NOT NULL,
  	"badge" varchar DEFAULT 'โปรโมชัน',
  	"featured" boolean,
  	"start_date" timestamp(3) with time zone,
  	"end_date" timestamp(3) with time zone,
  	"image_id" integer,
  	"cta_label" varchar,
  	"cta_href" varchar,
  	"sort_order" numeric DEFAULT 100,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "cms"."promotions_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"branches_id" integer
  );
  
  CREATE TABLE "cms"."news" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"slug" varchar,
  	"category" "cms"."enum_news_category" DEFAULT 'news',
  	"published_at" timestamp(3) with time zone,
  	"excerpt" varchar,
  	"cover_image_id" integer,
  	"content" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "cms"."enum_news_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "cms"."_news_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_slug" varchar,
  	"version_category" "cms"."enum__news_v_version_category" DEFAULT 'news',
  	"version_published_at" timestamp(3) with time zone,
  	"version_excerpt" varchar,
  	"version_cover_image_id" integer,
  	"version_content" jsonb,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "cms"."enum__news_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "cms"."branches_team" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"role" varchar,
  	"phone" varchar,
  	"photo_id" integer
  );
  
  CREATE TABLE "cms"."branches" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"name_en" varchar,
  	"code" varchar NOT NULL,
  	"phone" varchar NOT NULL,
  	"open_hours" varchar DEFAULT 'จ.–อา. 08:30–18:30',
  	"address" varchar,
  	"map_url" varchar,
  	"domain" varchar,
  	"intro" varchar,
  	"sort_order" numeric DEFAULT 100,
  	"published" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "cms"."branches_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"media_id" integer
  );
  
  CREATE TABLE "cms"."media" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"alt" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric,
  	"sizes_thumb_url" varchar,
  	"sizes_thumb_width" numeric,
  	"sizes_thumb_height" numeric,
  	"sizes_thumb_mime_type" varchar,
  	"sizes_thumb_filesize" numeric,
  	"sizes_thumb_filename" varchar,
  	"sizes_card_url" varchar,
  	"sizes_card_width" numeric,
  	"sizes_card_height" numeric,
  	"sizes_card_mime_type" varchar,
  	"sizes_card_filesize" numeric,
  	"sizes_card_filename" varchar,
  	"sizes_hero_url" varchar,
  	"sizes_hero_width" numeric,
  	"sizes_hero_height" numeric,
  	"sizes_hero_mime_type" varchar,
  	"sizes_hero_filesize" numeric,
  	"sizes_hero_filename" varchar
  );
  
  CREATE TABLE "cms"."users_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "cms"."users" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"full_name" varchar,
  	"role" "cms"."enum_users_role" DEFAULT 'editor' NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  CREATE TABLE "cms"."payload_kv" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"data" jsonb NOT NULL
  );
  
  CREATE TABLE "cms"."payload_locked_documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"global_slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "cms"."payload_locked_documents_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"car_models_id" integer,
  	"promotions_id" integer,
  	"news_id" integer,
  	"branches_id" integer,
  	"media_id" integer,
  	"users_id" integer
  );
  
  CREATE TABLE "cms"."payload_preferences" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"value" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "cms"."payload_preferences_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer
  );
  
  CREATE TABLE "cms"."payload_migrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"batch" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "cms"."site_settings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"hero_headline" varchar DEFAULT 'Build Your Dream' NOT NULL,
  	"hero_headline2" varchar DEFAULT 'เริ่มที่คันที่ใช่',
  	"hero_sub" varchar DEFAULT 'เลือกรุ่น ดูค่างวดจริง แล้วนัดลองขับที่สาขาใกล้บ้าน — จบได้ในหน้าเดียว',
  	"hero_blurb" varchar,
  	"main_phone" varchar DEFAULT '062-673-1999' NOT NULL,
  	"line_url" varchar,
  	"facebook_url" varchar,
  	"footer_about" varchar,
  	"finance_rate" numeric DEFAULT 2.89 NOT NULL,
  	"default_down_percent" numeric DEFAULT 20,
  	"default_term" numeric DEFAULT 60,
  	"finance_note" varchar DEFAULT 'ตัวเลขเป็นการประมาณเบื้องต้น เงื่อนไขจริงขึ้นอยู่กับการอนุมัติของสถาบันการเงิน',
  	"lead_source_label" varchar DEFAULT 'Website - ทดลองขับ' NOT NULL,
  	"lead_holder_name" varchar DEFAULT 'เว็บไซต์ - รอรับ' NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  ALTER TABLE "cms"."car_models_specs" ADD CONSTRAINT "car_models_specs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "cms"."car_models"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cms"."car_models" ADD CONSTRAINT "car_models_hero_image_id_media_id_fk" FOREIGN KEY ("hero_image_id") REFERENCES "cms"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "cms"."car_models_rels" ADD CONSTRAINT "car_models_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "cms"."car_models"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cms"."car_models_rels" ADD CONSTRAINT "car_models_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "cms"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cms"."promotions" ADD CONSTRAINT "promotions_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "cms"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "cms"."promotions_rels" ADD CONSTRAINT "promotions_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "cms"."promotions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cms"."promotions_rels" ADD CONSTRAINT "promotions_rels_branches_fk" FOREIGN KEY ("branches_id") REFERENCES "cms"."branches"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cms"."news" ADD CONSTRAINT "news_cover_image_id_media_id_fk" FOREIGN KEY ("cover_image_id") REFERENCES "cms"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "cms"."_news_v" ADD CONSTRAINT "_news_v_parent_id_news_id_fk" FOREIGN KEY ("parent_id") REFERENCES "cms"."news"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "cms"."_news_v" ADD CONSTRAINT "_news_v_version_cover_image_id_media_id_fk" FOREIGN KEY ("version_cover_image_id") REFERENCES "cms"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "cms"."branches_team" ADD CONSTRAINT "branches_team_photo_id_media_id_fk" FOREIGN KEY ("photo_id") REFERENCES "cms"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "cms"."branches_team" ADD CONSTRAINT "branches_team_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "cms"."branches"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cms"."branches_rels" ADD CONSTRAINT "branches_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "cms"."branches"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cms"."branches_rels" ADD CONSTRAINT "branches_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "cms"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cms"."users_sessions" ADD CONSTRAINT "users_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "cms"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cms"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "cms"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cms"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_car_models_fk" FOREIGN KEY ("car_models_id") REFERENCES "cms"."car_models"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cms"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_promotions_fk" FOREIGN KEY ("promotions_id") REFERENCES "cms"."promotions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cms"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_news_fk" FOREIGN KEY ("news_id") REFERENCES "cms"."news"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cms"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_branches_fk" FOREIGN KEY ("branches_id") REFERENCES "cms"."branches"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cms"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "cms"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cms"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "cms"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cms"."payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "cms"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cms"."payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "cms"."users"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "car_models_specs_order_idx" ON "cms"."car_models_specs" USING btree ("_order");
  CREATE INDEX "car_models_specs_parent_id_idx" ON "cms"."car_models_specs" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "car_models_slug_idx" ON "cms"."car_models" USING btree ("slug");
  CREATE INDEX "car_models_hero_image_idx" ON "cms"."car_models" USING btree ("hero_image_id");
  CREATE INDEX "car_models_updated_at_idx" ON "cms"."car_models" USING btree ("updated_at");
  CREATE INDEX "car_models_created_at_idx" ON "cms"."car_models" USING btree ("created_at");
  CREATE INDEX "car_models_rels_order_idx" ON "cms"."car_models_rels" USING btree ("order");
  CREATE INDEX "car_models_rels_parent_idx" ON "cms"."car_models_rels" USING btree ("parent_id");
  CREATE INDEX "car_models_rels_path_idx" ON "cms"."car_models_rels" USING btree ("path");
  CREATE INDEX "car_models_rels_media_id_idx" ON "cms"."car_models_rels" USING btree ("media_id");
  CREATE INDEX "promotions_image_idx" ON "cms"."promotions" USING btree ("image_id");
  CREATE INDEX "promotions_updated_at_idx" ON "cms"."promotions" USING btree ("updated_at");
  CREATE INDEX "promotions_created_at_idx" ON "cms"."promotions" USING btree ("created_at");
  CREATE INDEX "promotions_rels_order_idx" ON "cms"."promotions_rels" USING btree ("order");
  CREATE INDEX "promotions_rels_parent_idx" ON "cms"."promotions_rels" USING btree ("parent_id");
  CREATE INDEX "promotions_rels_path_idx" ON "cms"."promotions_rels" USING btree ("path");
  CREATE INDEX "promotions_rels_branches_id_idx" ON "cms"."promotions_rels" USING btree ("branches_id");
  CREATE UNIQUE INDEX "news_slug_idx" ON "cms"."news" USING btree ("slug");
  CREATE INDEX "news_cover_image_idx" ON "cms"."news" USING btree ("cover_image_id");
  CREATE INDEX "news_updated_at_idx" ON "cms"."news" USING btree ("updated_at");
  CREATE INDEX "news_created_at_idx" ON "cms"."news" USING btree ("created_at");
  CREATE INDEX "news__status_idx" ON "cms"."news" USING btree ("_status");
  CREATE INDEX "_news_v_parent_idx" ON "cms"."_news_v" USING btree ("parent_id");
  CREATE INDEX "_news_v_version_version_slug_idx" ON "cms"."_news_v" USING btree ("version_slug");
  CREATE INDEX "_news_v_version_version_cover_image_idx" ON "cms"."_news_v" USING btree ("version_cover_image_id");
  CREATE INDEX "_news_v_version_version_updated_at_idx" ON "cms"."_news_v" USING btree ("version_updated_at");
  CREATE INDEX "_news_v_version_version_created_at_idx" ON "cms"."_news_v" USING btree ("version_created_at");
  CREATE INDEX "_news_v_version_version__status_idx" ON "cms"."_news_v" USING btree ("version__status");
  CREATE INDEX "_news_v_created_at_idx" ON "cms"."_news_v" USING btree ("created_at");
  CREATE INDEX "_news_v_updated_at_idx" ON "cms"."_news_v" USING btree ("updated_at");
  CREATE INDEX "_news_v_latest_idx" ON "cms"."_news_v" USING btree ("latest");
  CREATE INDEX "branches_team_order_idx" ON "cms"."branches_team" USING btree ("_order");
  CREATE INDEX "branches_team_parent_id_idx" ON "cms"."branches_team" USING btree ("_parent_id");
  CREATE INDEX "branches_team_photo_idx" ON "cms"."branches_team" USING btree ("photo_id");
  CREATE UNIQUE INDEX "branches_code_idx" ON "cms"."branches" USING btree ("code");
  CREATE INDEX "branches_updated_at_idx" ON "cms"."branches" USING btree ("updated_at");
  CREATE INDEX "branches_created_at_idx" ON "cms"."branches" USING btree ("created_at");
  CREATE INDEX "branches_rels_order_idx" ON "cms"."branches_rels" USING btree ("order");
  CREATE INDEX "branches_rels_parent_idx" ON "cms"."branches_rels" USING btree ("parent_id");
  CREATE INDEX "branches_rels_path_idx" ON "cms"."branches_rels" USING btree ("path");
  CREATE INDEX "branches_rels_media_id_idx" ON "cms"."branches_rels" USING btree ("media_id");
  CREATE INDEX "media_updated_at_idx" ON "cms"."media" USING btree ("updated_at");
  CREATE INDEX "media_created_at_idx" ON "cms"."media" USING btree ("created_at");
  CREATE UNIQUE INDEX "media_filename_idx" ON "cms"."media" USING btree ("filename");
  CREATE INDEX "media_sizes_thumb_sizes_thumb_filename_idx" ON "cms"."media" USING btree ("sizes_thumb_filename");
  CREATE INDEX "media_sizes_card_sizes_card_filename_idx" ON "cms"."media" USING btree ("sizes_card_filename");
  CREATE INDEX "media_sizes_hero_sizes_hero_filename_idx" ON "cms"."media" USING btree ("sizes_hero_filename");
  CREATE INDEX "users_sessions_order_idx" ON "cms"."users_sessions" USING btree ("_order");
  CREATE INDEX "users_sessions_parent_id_idx" ON "cms"."users_sessions" USING btree ("_parent_id");
  CREATE INDEX "users_updated_at_idx" ON "cms"."users" USING btree ("updated_at");
  CREATE INDEX "users_created_at_idx" ON "cms"."users" USING btree ("created_at");
  CREATE UNIQUE INDEX "users_email_idx" ON "cms"."users" USING btree ("email");
  CREATE UNIQUE INDEX "payload_kv_key_idx" ON "cms"."payload_kv" USING btree ("key");
  CREATE INDEX "payload_locked_documents_global_slug_idx" ON "cms"."payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX "payload_locked_documents_updated_at_idx" ON "cms"."payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX "payload_locked_documents_created_at_idx" ON "cms"."payload_locked_documents" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_order_idx" ON "cms"."payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "cms"."payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX "payload_locked_documents_rels_path_idx" ON "cms"."payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX "payload_locked_documents_rels_car_models_id_idx" ON "cms"."payload_locked_documents_rels" USING btree ("car_models_id");
  CREATE INDEX "payload_locked_documents_rels_promotions_id_idx" ON "cms"."payload_locked_documents_rels" USING btree ("promotions_id");
  CREATE INDEX "payload_locked_documents_rels_news_id_idx" ON "cms"."payload_locked_documents_rels" USING btree ("news_id");
  CREATE INDEX "payload_locked_documents_rels_branches_id_idx" ON "cms"."payload_locked_documents_rels" USING btree ("branches_id");
  CREATE INDEX "payload_locked_documents_rels_media_id_idx" ON "cms"."payload_locked_documents_rels" USING btree ("media_id");
  CREATE INDEX "payload_locked_documents_rels_users_id_idx" ON "cms"."payload_locked_documents_rels" USING btree ("users_id");
  CREATE INDEX "payload_preferences_key_idx" ON "cms"."payload_preferences" USING btree ("key");
  CREATE INDEX "payload_preferences_updated_at_idx" ON "cms"."payload_preferences" USING btree ("updated_at");
  CREATE INDEX "payload_preferences_created_at_idx" ON "cms"."payload_preferences" USING btree ("created_at");
  CREATE INDEX "payload_preferences_rels_order_idx" ON "cms"."payload_preferences_rels" USING btree ("order");
  CREATE INDEX "payload_preferences_rels_parent_idx" ON "cms"."payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX "payload_preferences_rels_path_idx" ON "cms"."payload_preferences_rels" USING btree ("path");
  CREATE INDEX "payload_preferences_rels_users_id_idx" ON "cms"."payload_preferences_rels" USING btree ("users_id");
  CREATE INDEX "payload_migrations_updated_at_idx" ON "cms"."payload_migrations" USING btree ("updated_at");
  CREATE INDEX "payload_migrations_created_at_idx" ON "cms"."payload_migrations" USING btree ("created_at");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "cms"."car_models_specs" CASCADE;
  DROP TABLE "cms"."car_models" CASCADE;
  DROP TABLE "cms"."car_models_rels" CASCADE;
  DROP TABLE "cms"."promotions" CASCADE;
  DROP TABLE "cms"."promotions_rels" CASCADE;
  DROP TABLE "cms"."news" CASCADE;
  DROP TABLE "cms"."_news_v" CASCADE;
  DROP TABLE "cms"."branches_team" CASCADE;
  DROP TABLE "cms"."branches" CASCADE;
  DROP TABLE "cms"."branches_rels" CASCADE;
  DROP TABLE "cms"."media" CASCADE;
  DROP TABLE "cms"."users_sessions" CASCADE;
  DROP TABLE "cms"."users" CASCADE;
  DROP TABLE "cms"."payload_kv" CASCADE;
  DROP TABLE "cms"."payload_locked_documents" CASCADE;
  DROP TABLE "cms"."payload_locked_documents_rels" CASCADE;
  DROP TABLE "cms"."payload_preferences" CASCADE;
  DROP TABLE "cms"."payload_preferences_rels" CASCADE;
  DROP TABLE "cms"."payload_migrations" CASCADE;
  DROP TABLE "cms"."site_settings" CASCADE;
  DROP TYPE "cms"."enum_car_models_body_type";
  DROP TYPE "cms"."enum_news_category";
  DROP TYPE "cms"."enum_news_status";
  DROP TYPE "cms"."enum__news_v_version_category";
  DROP TYPE "cms"."enum__news_v_version_status";
  DROP TYPE "cms"."enum_users_role";`)
}
