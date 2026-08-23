import type { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  auth: true,
  labels: { singular: 'ผู้ใช้งาน', plural: 'ผู้ใช้งาน' },
  admin: { useAsTitle: 'email', group: 'ตั้งค่าระบบ' },
  fields: [
    {
      name: 'fullName',
      type: 'text',
      label: 'ชื่อ-นามสกุล',
    },
    {
      name: 'role',
      type: 'select',
      label: 'สิทธิ์การใช้งาน',
      defaultValue: 'editor',
      required: true,
      options: [
        { label: 'ผู้ดูแลระบบ (แก้ได้ทุกอย่าง)', value: 'admin' },
        { label: 'ทีมการตลาด (แก้เนื้อหาได้)', value: 'editor' },
      ],
      admin: { description: 'ทีมการตลาดเลือก "ทีมการตลาด" พอครับ' },
    },
  ],
}
