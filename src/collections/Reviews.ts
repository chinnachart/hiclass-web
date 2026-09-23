import type { CollectionConfig } from 'payload'
import { revalidateSite, revalidateAndPing } from '../lib/revalidate'

/**
 * รีวิวจากลูกค้า (zip #35) — ลูกค้าเขียนเองที่ /reviews → เข้ามาเป็น "รออนุมัติ"
 * แอดมินเปลี่ยนเป็น "อนุมัติ" แล้วจึงขึ้นหน้าแรก + /reviews · หน้าเว็บแสดง 5 ดาวทุกรีวิว (เจ้าของสั่ง)
 * สร้างได้ทางเดียวคือ /api/reviews (overrideAccess) — คนนอกอ่านได้เฉพาะที่อนุมัติแล้ว
 */
export const Reviews: CollectionConfig = {
  slug: 'reviews',
  labels: { singular: 'รีวิวจากลูกค้า', plural: 'รีวิวจากลูกค้า' },
  admin: {
    group: 'เนื้อหาเว็บ',
    useAsTitle: 'name',
    defaultColumns: ['name', 'status', 'model', 'branch', 'createdAt'],
    description:
      'ลูกค้าเขียนรีวิวที่หน้า /reviews → เข้ามาเป็น "รออนุมัติ" · อ่านแล้วเปลี่ยนสถานะเป็น "อนุมัติ" กด Save จึงจะขึ้นเว็บ · ไม่เหมาะสมให้เลือก "ไม่แสดง"',
    listSearchableFields: ['name', 'message'],
  },
  access: {
    read: ({ req }) => (req.user ? true : { status: { equals: 'approved' } }),
    create: ({ req }) => !!req.user,
    update: ({ req }) => !!req.user,
    delete: ({ req }) => !!req.user,
  },
  defaultSort: '-createdAt',
  hooks: {
    afterChange: [revalidateAndPing(() => ['/', '/reviews'])],
    afterDelete: [revalidateSite],
  },
  fields: [
    {
      name: 'status',
      type: 'select',
      label: 'สถานะ',
      required: true,
      defaultValue: 'pending',
      options: [
        { label: 'รออนุมัติ', value: 'pending' },
        { label: 'อนุมัติ (ขึ้นเว็บ)', value: 'approved' },
        { label: 'ไม่แสดง', value: 'rejected' },
      ],
      admin: { position: 'sidebar' },
    },
    { name: 'name', type: 'text', required: true, label: 'ชื่อลูกค้า (แสดงบนเว็บ)' },
    {
      type: 'row',
      fields: [
        { name: 'model', type: 'text', label: 'รุ่นรถ', admin: { width: '50%' } },
        { name: 'branch', type: 'text', label: 'สาขาที่ซื้อ', admin: { width: '50%' } },
      ],
    },
    { name: 'message', type: 'textarea', required: true, label: 'ข้อความรีวิว', admin: { description: 'แก้คำผิดได้ แต่ไม่ควรเปลี่ยนความหมายของลูกค้า' } },
  ],
}
