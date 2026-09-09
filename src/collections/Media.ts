import path from 'path'
import type { CollectionConfig } from 'payload'
import { IMG } from '../lib/imageSpecs'

export const Media: CollectionConfig = {
  slug: 'media',
  labels: { singular: 'รูปภาพ', plural: 'คลังรูปภาพ' },
  admin: { group: 'เนื้อหาเว็บ', description: IMG.library },
  access: { read: () => true },
  upload: {
    // เก็บไฟล์ไว้นอกโฟลเดอร์โปรแกรม ตั้งค่าผ่าน MEDIA_DIR
    // สำคัญมากตอน deploy บน Plesk — ไม่งั้นรูปที่อัปโหลดจะหายทุกครั้งที่อัปเดตเว็บ
    staticDir: process.env.MEDIA_DIR
      ? path.resolve(process.env.MEDIA_DIR)
      : path.resolve(process.cwd(), 'media'),
    mimeTypes: ['image/*'],
    // วางลิงก์รูปจากเว็บเก่าในช่องอัปโหลดได้เลย ระบบจะไปโหลดมาให้จากฝั่งเซิร์ฟเวอร์
    // (ถ้าไม่ระบุโดเมนไว้ตรงนี้ เบราว์เซอร์จะเป็นคนโหลด แล้วติด CORS ของ WordPress)
    pasteURL: {
      allowList: [
        { hostname: 'hiclassevcar.com', protocol: 'https' },
        { hostname: 'www.hiclassevcar.com', protocol: 'https' },
      ],
    },
    // ระบบย่อขนาดและแปลงเป็น WebP ให้อัตโนมัติ — อัปโหลดไฟล์ใหญ่มาได้เลย
    formatOptions: { format: 'webp', options: { quality: 82 } },
    imageSizes: [
      { name: 'thumb', width: 400, height: 250, position: 'centre' },
      { name: 'card', width: 800 },
      { name: 'hero', width: 1920 },
    ],
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
      label: 'คำอธิบายรูป',
      admin: { description: 'อธิบายสั้นๆ ว่ารูปนี้คืออะไร เช่น "BYD Sealion 7 สีขาว มุมหน้า" — Google ใช้ข้อความนี้' },
    },
  ],
}
