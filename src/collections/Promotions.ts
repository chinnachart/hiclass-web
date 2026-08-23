import type { CollectionConfig } from 'payload'
import { revalidateSite } from '../lib/revalidate'

export const Promotions: CollectionConfig = {
  slug: 'promotions',
  labels: { singular: 'โปรโมชัน', plural: 'โปรโมชัน' },
  admin: {
    group: 'เนื้อหาเว็บ',
    useAsTitle: 'title',
    defaultColumns: ['title', 'badge', 'endDate', 'featured'],
    description: 'โปรฯ ที่เลยวันสิ้นสุดจะหายจากเว็บเองอัตโนมัติ ไม่ต้องมาลบ',
  },
  access: { read: () => true },
  hooks: {
    afterChange: [revalidateSite],
    afterDelete: [revalidateSite],
  },
  fields: [
    { name: 'title', type: 'text', required: true, label: 'หัวข้อโปรโมชัน' },
    {
      name: 'summary',
      type: 'textarea',
      required: true,
      label: 'รายละเอียดสั้น',
      admin: { description: '1–2 บรรทัดพอ ข้อความยาวจะถูกตัดบนการ์ด' },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'badge',
          type: 'text',
          label: 'ป้ายกำกับ',
          defaultValue: 'โปรโมชัน',
          admin: { width: '50%', description: 'คำสั้นๆ บนมุมการ์ด เช่น ไฮไลต์ / ทดลองขับ / เทิร์นรถเก่า' },
        },
        {
          name: 'featured',
          type: 'checkbox',
          label: 'ตั้งเป็นโปรฯ เด่น',
          admin: { width: '50%', description: 'การ์ดจะใหญ่และมีพื้นหลังแดง — ควรเลือกแค่อันเดียว' },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'startDate',
          type: 'date',
          label: 'เริ่มแสดงวันที่',
          admin: { width: '50%', description: 'เว้นว่าง = แสดงทันที' },
        },
        {
          name: 'endDate',
          type: 'date',
          label: 'สิ้นสุดวันที่',
          admin: { width: '50%', description: 'เว้นว่าง = แสดงตลอด' },
        },
      ],
    },
    { name: 'image', type: 'upload', relationTo: 'media', label: 'รูปประกอบ' },
    {
      type: 'row',
      fields: [
        { name: 'ctaLabel', type: 'text', label: 'ข้อความบนปุ่ม', admin: { width: '50%' } },
        { name: 'ctaHref', type: 'text', label: 'ลิงก์ปลายทาง', admin: { width: '50%', description: 'เช่น /test-drive' } },
      ],
    },
    {
      name: 'branches',
      type: 'relationship',
      relationTo: 'branches',
      hasMany: true,
      label: 'เฉพาะสาขา',
      admin: { description: 'เว้นว่าง = แสดงทุกสาขา เลือกสาขา = แสดงเฉพาะเว็บสาขานั้น' },
    },
    { name: 'sortOrder', type: 'number', defaultValue: 100, label: 'ลำดับการแสดง' },
  ],
}
