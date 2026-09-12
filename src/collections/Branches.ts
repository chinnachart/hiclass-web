import type { CollectionConfig } from 'payload'
import { revalidateSite, revalidateAndPing } from '../lib/revalidate'
import { IMG } from '../lib/imageSpecs'

export const Branches: CollectionConfig = {
  slug: 'branches',
  labels: { singular: 'สาขา', plural: 'สาขาของเรา' },
  admin: {
    group: 'เนื้อหาเว็บ',
    useAsTitle: 'name',
    defaultColumns: ['name', 'code', 'phone', 'published'],
    description: 'ข้อมูลสาขาที่แสดงบนเว็บ — รหัสสาขาต้องตรงกับในระบบ CRM',
  },
  access: { read: () => true },
  hooks: {
    afterChange: [revalidateAndPing((d) => ['/branches', `/branches/${d.code}`])],
    afterDelete: [revalidateSite],
  },
  defaultSort: 'sortOrder',
  fields: [
    {
      type: 'row',
      fields: [
        { name: 'name', type: 'text', required: true, label: 'ชื่อสาขา (ไทย)', admin: { width: '34%' } },
        { name: 'nameEn', type: 'text', label: 'ชื่อสาขา (อังกฤษ)', admin: { width: '33%' } },
        {
          name: 'code',
          type: 'text',
          required: true,
          unique: true,
          label: 'รหัสสาขา',
          admin: {
            width: '33%',
            description: 'ต้องตรงกับรหัสในระบบ CRM: ratchada, ladprao, rama5, bonmarche, kanchana',
          },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'phone', type: 'text', required: true, label: 'เบอร์โทรสาขา', admin: { width: '50%', description: 'รูปแบบ 062-673-1999' } },
        { name: 'openHours', type: 'text', label: 'เวลาทำการ', defaultValue: 'จ.–อา. 08:00–18:00', admin: { width: '50%' } },
      ],
    },
    { name: 'address', type: 'textarea', label: 'ที่อยู่' },
    {
      name: 'lineUrl',
      type: 'text',
      label: 'ลิงก์ LINE ของสาขานี้',
      admin: { description: 'เช่น https://line.me/R/ti/p/@bydhiclassladprao — ปุ่ม LINE บนหน้าสาขานี้จะไปหาสาขาโดยตรง ถ้าเว้นว่างจะใช้ LINE กลางจากตั้งค่าเว็บไซต์' },
    },
    { name: 'mapUrl', type: 'text', label: 'ลิงก์ Google Maps', admin: { description: 'กดปุ่ม "แชร์" ใน Google Maps แล้ววางลิงก์ที่นี่' } },
    {
      type: 'collapsible',
      label: 'ช่องทางโซเชียลของสาขานี้',
      admin: { description: 'ลูกค้ากดจากหน้าสาขาไปเพจของสาขานี้ได้ตรง ไม่ต้องผ่าน Linktree · เว้นว่างช่องไหน ปุ่มนั้นจะไม่ขึ้น' },
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'facebookUrl', type: 'text', label: 'Facebook', admin: { width: '50%', description: 'เช่น https://www.facebook.com/BYDHiclassLadprao' } },
            { name: 'instagramUrl', type: 'text', label: 'Instagram', admin: { width: '50%', description: 'เช่น https://www.instagram.com/bydhiclassladprao' } },
          ],
        },
        {
          type: 'row',
          fields: [
            { name: 'tiktokUrl', type: 'text', label: 'TikTok', admin: { width: '50%', description: 'เช่น https://www.tiktok.com/@bydhiclassladprao' } },
            { name: 'youtubeUrl', type: 'text', label: 'YouTube', admin: { width: '50%', description: 'เช่น https://www.youtube.com/@bydhiclassladprao' } },
          ],
        },
      ],
    },
    {
      name: 'domain',
      type: 'text',
      label: 'โดเมนของสาขานี้',
      admin: { description: 'เช่น bydhiclassratchada.com — เว้นว่างถ้าสาขานี้ยังไม่มีเว็บของตัวเอง' },
    },
    {
      name: 'intro',
      type: 'textarea',
      label: 'แนะนำสาขา',
      admin: { description: 'สำคัญมาก — เขียนให้ต่างจากสาขาอื่นจริงๆ เล่าถึงย่านนั้น ทีมงาน สิ่งที่สาขานี้เด่น ห้ามคัดลอกจากสาขาอื่น' },
    },
    {
      name: 'photos',
      type: 'upload',
      relationTo: 'media',
      hasMany: true,
      label: 'ภาพโชว์รูมจริง',
      admin: { description: IMG.gallery43 },
    },
    {
      name: 'team',
      type: 'array',
      label: 'ทีมขายประจำสาขา',
      labels: { singular: 'พนักงาน', plural: 'พนักงาน' },
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'name', type: 'text', required: true, label: 'ชื่อ', admin: { width: '40%' } },
            { name: 'role', type: 'text', label: 'ตำแหน่ง', admin: { width: '30%' } },
            { name: 'phone', type: 'text', label: 'เบอร์ติดต่อ', admin: { width: '30%' } },
          ],
        },
        { name: 'photo', type: 'upload', relationTo: 'media', label: 'รูป', admin: { description: IMG.square } },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'sortOrder', type: 'number', defaultValue: 100, label: 'ลำดับการแสดง', admin: { width: '50%' } },
        { name: 'published', type: 'checkbox', defaultValue: true, label: 'แสดงบนเว็บ', admin: { width: '50%' } },
      ],
    },
  ],
}
