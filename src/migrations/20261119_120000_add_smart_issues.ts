import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/** แจ้งปัญหาระบบ SMART (/smart-report) — ตารางใหม่ + คอลัมน์ใน payload_locked_documents_rels + รหัสหน้ารายการใน site_settings */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   DO $$ BEGIN
     CREATE TYPE "cms"."enum_smart_issues_status" AS ENUM('new', 'in_progress', 'need_info', 'done');
   EXCEPTION WHEN duplicate_object THEN null; END $$;
   DO $$ BEGIN
     CREATE TYPE "cms"."enum_smart_issues_dept" AS ENUM('sales', 'service');
   EXCEPTION WHEN duplicate_object THEN null; END $$;

   CREATE TABLE IF NOT EXISTS "cms"."smart_issues" (
     "id" serial PRIMARY KEY NOT NULL,
     "status" "cms"."enum_smart_issues_status" DEFAULT 'new' NOT NULL,
     "dept" "cms"."enum_smart_issues_dept" NOT NULL,
     "title" varchar NOT NULL,
     "reporter_name" varchar NOT NULL,
     "contact" varchar,
     "branch" varchar,
     "menu" varchar,
     "detail" varchar NOT NULL,
     "photos" jsonb,
     "reply" varchar,
     "replied_at" timestamp(3) with time zone,
     "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
     "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
   );
   CREATE INDEX IF NOT EXISTS "smart_issues_updated_at_idx" ON "cms"."smart_issues" USING btree ("updated_at");
   CREATE INDEX IF NOT EXISTS "smart_issues_created_at_idx" ON "cms"."smart_issues" USING btree ("created_at");

   ALTER TABLE "cms"."payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "smart_issues_id" integer;
   DO $$ BEGIN
     ALTER TABLE "cms"."payload_locked_documents_rels"
       ADD CONSTRAINT "payload_locked_documents_rels_smart_issues_fk"
       FOREIGN KEY ("smart_issues_id") REFERENCES "cms"."smart_issues"("id") ON DELETE cascade ON UPDATE no action;
   EXCEPTION WHEN duplicate_object THEN null; END $$;
   CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_smart_issues_id_idx" ON "cms"."payload_locked_documents_rels" USING btree ("smart_issues_id");

   ALTER TABLE "cms"."site_settings" ADD COLUMN IF NOT EXISTS "smart_report_key" varchar;`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "cms"."site_settings" DROP COLUMN IF EXISTS "smart_report_key";
   ALTER TABLE "cms"."payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_smart_issues_fk";
   DROP INDEX IF EXISTS "cms"."payload_locked_documents_rels_smart_issues_id_idx";
   ALTER TABLE "cms"."payload_locked_documents_rels" DROP COLUMN IF EXISTS "smart_issues_id";
   DROP TABLE IF EXISTS "cms"."smart_issues" CASCADE;
   DROP TYPE IF EXISTS "cms"."enum_smart_issues_status";
   DROP TYPE IF EXISTS "cms"."enum_smart_issues_dept";`)
}
