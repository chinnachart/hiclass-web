import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

// ตารางดอกเบี้ยตามเงินดาวน์ × จำนวนงวด (site-settings → financeRates) — ลอกจากชีทไฟแนนซ์ Sealion 7 ก.ย. 2569
export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE IF NOT EXISTS "cms"."site_settings_finance_rates" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"down" numeric NOT NULL,
  	"r48" numeric,
  	"r60" numeric,
  	"r72" numeric,
  	"r84" numeric
  );

  DO $$ BEGIN
   ALTER TABLE "cms"."site_settings_finance_rates" ADD CONSTRAINT "site_settings_finance_rates_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "cms"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN null; END $$;
  CREATE INDEX IF NOT EXISTS "site_settings_finance_rates_order_idx" ON "cms"."site_settings_finance_rates" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "site_settings_finance_rates_parent_id_idx" ON "cms"."site_settings_finance_rates" USING btree ("_parent_id");

  INSERT INTO "cms"."site_settings_finance_rates" ("_order", "_parent_id", "id", "down", "r48", "r60", "r72", "r84")
  SELECT v.o, s.id, v.id, v.d, v.a, v.b, v.c, v.e
  FROM (SELECT id FROM "cms"."site_settings" ORDER BY id LIMIT 1) s,
  (VALUES
    (1, 'fr_30', 30, 1.98, 2.55, 3.09, 3.79),
    (2, 'fr_25', 25, 1.98, 2.79, 3.19, 3.89),
    (3, 'fr_20', 20, 2.79, 2.99, 3.39, 3.99),
    (4, 'fr_15', 15, 3.29, 3.59, 3.79, 4.49),
    (5, 'fr_10', 10, 3.89, 4.19, 4.49, 4.79)
  ) AS v(o, id, d, a, b, c, e)
  ON CONFLICT ("id") DO NOTHING;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE IF EXISTS "cms"."site_settings_finance_rates" CASCADE;`)
}
