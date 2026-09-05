import type { CollectionConfig } from 'payload'
import { revalidateSite } from '../lib/revalidate'

export const CarModels: CollectionConfig = {
  slug: 'car-models',
  labels: { singular: 'รุ่นรถ', plural: 'รุ่นรถ' },
  admin: {
    group: 'เนื้อหาเว็บ',
    useAsTitle: 'name',
    defaultColumns: ['name', 'bodyType', 'priceFrom', 'published'],
    description: 'แก้ราคาและสเปกรถทุกรุ่นที่นี่ — แก้แล้วเว็บอัปเดตทันที',
  },
  access: { read: () => true },
  hooks: {
    afterChange: [revalidateSite],
    afterDelete: [revalidateSite],
  },
  defaultSort: 'sortOrder',
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'name',
          type: 'text',
          required: true,
          label: 'ชื่อรุ่น',
          admin: { width: '50%', description: 'เช่น Sealion 7' },
        },
        {
          name: 'slug',
          type: 'text',
          required: true,
          unique: true,
          label: 'ชื่อใน URL',
          admin: { width: '50%', description: 'ตัวพิมพ์เล็กและขีดกลาง เช่น sealion-7 — เปลี่ยนแล้วลิงก์เดิมจะเสีย' },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'bodyType',
          type: 'select',
          required: true,
          label: 'ประเภทตัวถัง',
          admin: { width: '50%', description: 'ใช้สำหรับปุ่มกรองบนหน้าเว็บ' },
          options: [
            { label: 'SUV', value: 'suv' },
            { label: 'ซีดาน', value: 'sedan' },
            { label: 'แฮทช์แบ็ก', value: 'hatch' },
            { label: 'MPV / 7 ที่นั่ง', value: 'mpv' },
          ],
        },
        {
          name: 'tagline',
          type: 'text',
          required: true,
          label: 'คำอธิบายสั้น',
          admin: { width: '50%', description: 'เช่น SUV ไฟฟ้า หรือ ซีดานไฮบริด DM-i' },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'priceFrom',
          type: 'number',
          required: true,
          min: 0,
          label: 'ราคาเริ่มต้น (บาท)',
          admin: { width: '33%', description: 'กรอกตัวเลขล้วน ไม่ต้องใส่ลูกน้ำ เช่น 1249900' },
        },
        {
          name: 'rangeKm',
          type: 'number',
          min: 0,
          label: 'ระยะทางต่อการชาร์จ (กม.)',
          admin: { width: '33%' },
        },
        {
          name: 'colorsCount',
          type: 'number',
          min: 0,
          label: 'จำนวนสีให้เลือก',
          admin: { width: '34%' },
        },
      ],
    },
    {
      name: 'heroImage',
      type: 'upload',
      relationTo: 'media',
      label: 'รูปหลักของรุ่นนี้',
      admin: { description: 'รูปที่ขึ้นบนการ์ดในหน้าแรก ควรเป็นรูปแนวนอน พื้นหลังโล่ง' },
    },
    {
      name: 'gallery',
      type: 'upload',
      relationTo: 'media',
      hasMany: true,
      label: 'รูปเพิ่มเติม',
      admin: { description: 'รูปในหน้ารายละเอียดรุ่น เพิ่มได้ไม่จำกัด' },
    },
    {
      name: 'specs',
      type: 'array',
      label: 'ตารางสเปก',
      labels: { singular: 'รายการ', plural: 'รายการ' },
      admin: { description: 'เพิ่มได้เท่าที่ต้องการ เช่น "มอเตอร์" / "230 แรงม้า"' },
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'label', type: 'text', required: true, label: 'หัวข้อ', admin: { width: '40%' } },
            { name: 'value', type: 'text', required: true, label: 'ค่า', admin: { width: '60%' } },
          ],
        },
      ],
    },
    {
      type: 'collapsible',
      label: 'บริการรถให้เช่า',
      admin: { description: 'คนค้นหา "เช่ารถ BYD" เยอะแต่เรายังไม่มีหน้ารองรับ — กรอกค่าเช่าแล้วรุ่นนี้จะขึ้นหน้าเช่ารถอัตโนมัติ' },
      fields: [
        {
          name: 'rentalAvailable',
          type: 'checkbox',
          label: 'รุ่นนี้มีให้เช่า',
          admin: { description: 'ติ๊กแล้วรุ่นนี้จะแสดงในหน้า "บริการรถให้เช่า"' },
        },
        {
          type: 'row',
          fields: [
            { name: 'rentalDaily', type: 'number', min: 0, label: 'ค่าเช่ารายวัน (บาท)', admin: { width: '50%' } },
            { name: 'rentalMonthly', type: 'number', min: 0, label: 'ค่าเช่ารายเดือน (บาท)', admin: { width: '50%' } },
          ],
        },
      ],
    },
    {
      name: 'faq',
      type: 'array',
      label: 'คำถามที่ลูกค้าถามบ่อยเกี่ยวกับรุ่นนี้',
      labels: { singular: 'คำถาม', plural: 'คำถาม' },
      admin: {
        description: 'มีผลกับ Google โดยตรง — คำถามที่ใส่ที่นี่มีโอกาสขึ้นเป็นกล่องคำตอบในหน้าผลค้นหา เขียนคำถามให้เหมือนที่ลูกค้าพิมพ์จริง',
      },
      fields: [
        { name: 'question', type: 'text', required: true, label: 'คำถาม' },
        { name: 'answer', type: 'textarea', required: true, label: 'คำตอบ' },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'sortOrder',
          type: 'number',
          defaultValue: 100,
          label: 'ลำดับการแสดง',
          admin: { width: '50%', description: 'เลขน้อยขึ้นก่อน' },
        },
        {
          name: 'published',
          type: 'checkbox',
          defaultValue: true,
          label: 'แสดงบนเว็บ',
          admin: { width: '50%', description: 'เอาเครื่องหมายออก = ซ่อนรุ่นนี้จากเว็บโดยไม่ต้องลบ' },
        },
      ],
    },
  ],
}
