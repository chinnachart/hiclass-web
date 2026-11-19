import type { CollectionConfig } from 'payload'

/**
 * แจ้งปัญหาระบบ SMART — พนักงานแจ้งที่ /smart-report (ไม่ต้องล็อกอิน) สร้างได้ทางเดียวคือ /api/smart-report
 * ผู้ดูแลระบบ SMART ดูและตอบที่ /smart-report/list?key=… (รหัสตั้งที่ ตั้งค่าเว็บไซต์ แท็บ แจ้งปัญหา SMART)
 * ไม่เกี่ยวกับ CNC
 */
export const SmartIssues: CollectionConfig = {
  slug: 'smart-issues',
  labels: { singular: 'แจ้งปัญหา SMART', plural: 'แจ้งปัญหา SMART' },
  admin: {
    group: 'ภายใน',
    useAsTitle: 'title',
    defaultColumns: ['title', 'dept', 'status', 'reporterName', 'branch', 'createdAt'],
    description: 'พนักงานแจ้งที่ /smart-report | ผู้ดูแลระบบ SMART ดูที่ /smart-report/list?key=รหัส (ตั้งรหัสที่ ตั้งค่าเว็บไซต์ แท็บ แจ้งปัญหา SMART)',
    listSearchableFields: ['title', 'detail', 'reporterName'],
  },
  access: {
    read: ({ req }) => !!req.user,
    create: ({ req }) => !!req.user,
    update: ({ req }) => !!req.user,
    delete: ({ req }) => !!req.user,
  },
  defaultSort: '-createdAt',
  fields: [
    {
      name: 'status',
      type: 'select',
      label: 'สถานะ',
      required: true,
      defaultValue: 'new',
      options: [
        { label: 'ใหม่', value: 'new' },
        { label: 'กำลังแก้', value: 'in_progress' },
        { label: 'ขอข้อมูลเพิ่ม', value: 'need_info' },
        { label: 'แก้แล้ว', value: 'done' },
      ],
      admin: { position: 'sidebar' },
    },
    {
      name: 'dept',
      type: 'select',
      label: 'ฝ่าย',
      required: true,
      options: [
        { label: 'ฝ่ายขาย', value: 'sales' },
        { label: 'ฝ่ายบริการ', value: 'service' },
      ],
      admin: { position: 'sidebar' },
    },
    { name: 'title', type: 'text', required: true, label: 'ปัญหา (หัวข้อ)' },
    {
      type: 'row',
      fields: [
        { name: 'reporterName', type: 'text', required: true, label: 'ผู้แจ้ง', admin: { width: '34%' } },
        { name: 'contact', type: 'text', label: 'เบอร์/LINE ผู้แจ้ง', admin: { width: '33%' } },
        { name: 'branch', type: 'text', label: 'สาขา', admin: { width: '33%' } },
      ],
    },
    { name: 'menu', type: 'text', label: 'เมนู/หน้าจอที่พบปัญหา' },
    { name: 'detail', type: 'textarea', required: true, label: 'คำอธิบาย' },
    { name: 'photos', type: 'json', label: 'รูป (path ใน bucket smart-report)', admin: { readOnly: true } },
    { name: 'reply', type: 'textarea', label: 'คำตอบจากผู้ดูแลระบบ' },
    { name: 'repliedAt', type: 'date', label: 'ตอบล่าสุด', admin: { readOnly: true, position: 'sidebar', date: { pickerAppearance: 'dayAndTime' } } },
  ],
}
