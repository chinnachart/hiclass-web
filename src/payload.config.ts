import path from 'path'
import { fileURLToPath } from 'url'
import { buildConfig } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { th } from '@payloadcms/translations/languages/th'
import { en } from '@payloadcms/translations/languages/en'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { CarModels } from './collections/CarModels'
import { Promotions } from './collections/Promotions'
import { News } from './collections/News'
import { Branches } from './collections/Branches'
import { SiteSettings } from './globals/SiteSettings'

const dirname = path.dirname(fileURLToPath(import.meta.url))

export default buildConfig({
  admin: {
    user: Users.slug,
    meta: {
      titleSuffix: ' — หลังบ้าน Hi-Class EV Car',
    },
    components: {
      graphics: {
        Logo: '@/components/admin/Logo#AdminLogo',
        Icon: '@/components/admin/Logo#AdminIcon',
      },
    },
  },
  // หลังบ้านเป็นภาษาไทยโดยค่าเริ่มต้น สลับเป็นอังกฤษได้จากหน้าโปรไฟล์
  i18n: {
    fallbackLanguage: 'th',
    supportedLanguages: { th, en },
  },
  collections: [CarModels, Promotions, News, Branches, Media, Users],
  globals: [SiteSettings],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: { outputFile: path.resolve(dirname, 'payload-types.ts') },
  db: postgresAdapter({
    // เนื้อหาเว็บอยู่ใน schema ชื่อ cms — แยกออกจากตารางของ CRM ที่อยู่ใน public
    schemaName: 'cms',
    pool: { connectionString: process.env.DATABASE_URI || '' },
  }),
  upload: { limits: { fileSize: 20_000_000 } },
  sharp: (await import('sharp')).default,
})
