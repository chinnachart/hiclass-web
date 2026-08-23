import type { CollectionConfig } from 'payload'

export const Media: CollectionConfig = {
  slug: 'media',
  labels: { singular: 'รูปภาพ', plural: 'คลังรูปภาพ' },
  admin: { group: 'เนื้อหาเว็บ', description: 'อัปโหลดรูปครั้งเดียว นำไปใช้ซ้ำได้ทุกหน้า' },
  access: { read: () => true },
  upload: {
    mimeTypes: ['image/*'],
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
