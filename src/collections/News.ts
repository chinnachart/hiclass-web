import type { CollectionConfig } from 'payload'
import { revalidateSite } from '../lib/revalidate'

export const News: CollectionConfig = {
  slug: 'news',
  labels: { singular: 'ข่าว/กิจกรรม', plural: 'ข่าวสารและกิจกรรม' },
  admin: {
    group: 'เนื้อหาเว็บ',
    useAsTitle: 'title',
    defaultColumns: ['title', 'category', 'publishedAt', '_status'],
  },
  access: { read: () => true },
  hooks: {
    afterChange: [revalidateSite],
    afterDelete: [revalidateSite],
  },
  versions: { drafts: true },
  defaultSort: '-publishedAt',
  fields: [
    { name: 'title', type: 'text', required: true, label: 'หัวข้อ' },
    {
      type: 'row',
      fields: [
        {
          name: 'slug',
          type: 'text',
          required: true,
          unique: true,
          label: 'ชื่อใน URL',
          admin: { width: '50%', description: 'ตัวพิมพ์เล็กและขีดกลาง เช่น byd-big-motor-sale-2026' },
        },
        {
          name: 'category',
          type: 'select',
          label: 'หมวด',
          defaultValue: 'news',
          admin: { width: '50%' },
          options: [
            { label: 'ข่าวสาร', value: 'news' },
            { label: 'กิจกรรม', value: 'event' },
            { label: 'ความรู้', value: 'guide' },
            { label: 'บริการ', value: 'service' },
          ],
        },
      ],
    },
    {
      name: 'publishedAt',
      type: 'date',
      required: true,
      label: 'วันที่เผยแพร่',
      defaultValue: () => new Date().toISOString(),
    },
    { name: 'excerpt', type: 'textarea', required: true, label: 'สรุปสั้น', admin: { description: 'ข้อความที่ขึ้นบนการ์ดและใน Google' } },
    { name: 'coverImage', type: 'upload', relationTo: 'media', label: 'รูปหน้าปก' },
    { name: 'content', type: 'richText', label: 'เนื้อหา' },
  ],
}
