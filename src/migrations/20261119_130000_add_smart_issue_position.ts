import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/** แจ้งปัญหา SMART: เพิ่มช่องตำแหน่งผู้แจ้ง */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`ALTER TABLE "cms"."smart_issues" ADD COLUMN IF NOT EXISTS "position" varchar;`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`ALTER TABLE "cms"."smart_issues" DROP COLUMN IF EXISTS "position";`)
}
