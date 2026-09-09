import path from 'path'
import { fileURLToPath } from 'url'
import { buildConfig } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { s3Storage } from '@payloadcms/storage-s3'
import { th } from '@payloadcms/translations/languages/th'
import { en } from '@payloadcms/translations/languages/en'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { CarModels } from './collections/CarModels'
import { Promotions } from './collections/Promotions'
import { News } from './collections/News'
import { Branches } from './collections/Branches'
import { SiteSettings } from './globals/SiteSettings'
import { PageContent } from './globals/PageContent'

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
      // ทางลัดในเมนูซ้าย: แก้ราคา / เพิ่มโปร / อัปรูป / เปิดเว็บจริง
      afterNavLinks: ['@/components/admin/NavLinks#AfterNavLinks'],
      views: {
        // หน้าแรกหลังบ้านแบบ "วันนี้อยากทำอะไร" สำหรับทีมการตลาด
        dashboard: { Component: '@/components/admin/Dashboard#Dashboard' },
        // แก้ราคาทุกรุ่นในหน้าเดียว
        prices: { Component: '@/components/admin/PricesView#PricesView', path: '/prices', exact: true },
        // ย้ายรูปจากเว็บ WordPress เก่าเข้าคลังรูป
        wpImport: { Component: '@/components/admin/WpImportView#WpImportView', path: '/wp-import', exact: true },
      },
    },
    // ไม่ต้องใช้รูปโปรไฟล์จากอินเทอร์เน็ต
    avatar: 'default',
    // ล็อกหลังบ้านเป็นธีมสว่างอย่างเดียว — ดีไซน์ทั้งชุดเป็นพื้นขาว/แดง BYD
    // ถ้าปล่อยให้เป็น 'all' เครื่องที่ตั้ง dark mode จะเห็นการ์ดขาวคู่กับตัวหนังสือขาว
    theme: 'light',
  },
  // หลังบ้านเป็นภาษาไทยโดยค่าเริ่มต้น สลับเป็นอังกฤษได้จากหน้าโปรไฟล์
  i18n: {
    fallbackLanguage: 'th',
    supportedLanguages: { th, en },
  },
  collections: [CarModels, Promotions, News, Branches, Media, Users],
  globals: [SiteSettings, PageContent],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: { outputFile: path.resolve(dirname, 'payload-types.ts') },
  db: postgresAdapter({
    // เนื้อหาเว็บอยู่ใน schema ชื่อ cms — แยกออกจากตารางของ CRM ที่อยู่ใน public
    schemaName: 'cms',
    // บน Vercel ทุก function เปิด pool ของตัวเอง → จำกัดให้เล็ก และใช้ Supabase pooler
    // แบบ transaction mode (พอร์ต 6543) ไม่งั้นจะชน "max clients reached" ของ session mode
    pool: {
      connectionString: process.env.DATABASE_URI || '',
      max: process.env.VERCEL ? 3 : 10,
      idleTimeoutMillis: 10_000,
      connectionTimeoutMillis: 10_000,
    },
  }),
  upload: { limits: { fileSize: 20_000_000 } },
  plugins: [
    // เก็บรูปไว้บน Supabase Storage เมื่อ deploy ขึ้น Vercel (ซึ่งไม่มีดิสก์ถาวร)
    // ถ้าไม่ได้ตั้งค่า S3_* ไว้ ปลั๊กอินจะปิดตัวเอง แล้วเก็บลงดิสก์ตาม MEDIA_DIR เหมือนเดิม
    //
    // สำคัญ: ต้องใส่ปลั๊กอินไว้เสมอ (ไม่ใช่ใส่แบบมีเงื่อนไข) ไม่งั้นตอนสร้าง importMap
    // บนเครื่อง dev ที่ไม่มี S3_* จะไม่มีคอมโพเนนต์ของปลั๊กอินอยู่ในไฟล์
    // แล้วหลังบ้านบน production จะจอขาวเพราะหาคอมโพเนนต์ไม่เจอ
    s3Storage({
      enabled: Boolean(process.env.S3_BUCKET),
      collections: { media: true },
      bucket: process.env.S3_BUCKET || '',
      config: {
        endpoint: process.env.S3_ENDPOINT,
        region: process.env.S3_REGION || 'ap-southeast-1',
        forcePathStyle: true,
        credentials: {
          accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
          secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
        },
      },
    }),
  ],
  sharp: (await import('sharp')).default,
})
