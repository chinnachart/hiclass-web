import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * เพิ่ม powertrain (ev / phev) ให้รุ่นรถ — ใช้เลือกคำว่า "ระยะทางต่อการชาร์จ" กับ "ระยะทางรวม"
 * default 'ev' · ตั้ง phev ให้ 3 รุ่น DM-i ที่มีอยู่
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   DO $$ BEGIN
     CREATE TYPE "cms"."enum_car_models_powertrain" AS ENUM('ev', 'phev');
   EXCEPTION WHEN duplicate_object THEN NULL; END $$;
   ALTER TABLE "cms"."car_models" ADD COLUMN IF NOT EXISTS "powertrain" "cms"."enum_car_models_powertrain" DEFAULT 'ev' NOT NULL;
   UPDATE "cms"."car_models" SET "powertrain" = 'phev' WHERE "slug" IN ('sealion-6', 'sealion-5', 'seal-5');`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "cms"."car_models" DROP COLUMN IF EXISTS "powertrain";
   DROP TYPE IF EXISTS "cms"."enum_car_models_powertrain";`)
}
