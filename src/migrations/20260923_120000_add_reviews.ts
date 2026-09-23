import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/** รีวิวจากลูกค้า (zip #35) — ตารางใหม่ + คอลัมน์ใน payload_locked_documents_rels (Payload ต้องมีทุก collection) */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   DO $$ BEGIN
     CREATE TYPE "cms"."enum_reviews_status" AS ENUM('pending', 'approved', 'rejected');
   EXCEPTION WHEN duplicate_object THEN null; END $$;

   CREATE TABLE IF NOT EXISTS "cms"."reviews" (
     "id" serial PRIMARY KEY NOT NULL,
     "status" "cms"."enum_reviews_status" DEFAULT 'pending' NOT NULL,
     "name" varchar NOT NULL,
     "model" varchar,
     "branch" varchar,
     "message" varchar NOT NULL,
     "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
     "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
   );
   CREATE INDEX IF NOT EXISTS "reviews_updated_at_idx" ON "cms"."reviews" USING btree ("updated_at");
   CREATE INDEX IF NOT EXISTS "reviews_created_at_idx" ON "cms"."reviews" USING btree ("created_at");

   ALTER TABLE "cms"."payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "reviews_id" integer;
   DO $$ BEGIN
     ALTER TABLE "cms"."payload_locked_documents_rels"
       ADD CONSTRAINT "payload_locked_documents_rels_reviews_fk"
       FOREIGN KEY ("reviews_id") REFERENCES "cms"."reviews"("id") ON DELETE cascade ON UPDATE no action;
   EXCEPTION WHEN duplicate_object THEN null; END $$;
   CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_reviews_id_idx" ON "cms"."payload_locked_documents_rels" USING btree ("reviews_id");`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "cms"."payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_reviews_fk";
   DROP INDEX IF EXISTS "cms"."payload_locked_documents_rels_reviews_id_idx";
   ALTER TABLE "cms"."payload_locked_documents_rels" DROP COLUMN IF EXISTS "reviews_id";
   DROP TABLE IF EXISTS "cms"."reviews" CASCADE;
   DROP TYPE IF EXISTS "cms"."enum_reviews_status";`)
}
