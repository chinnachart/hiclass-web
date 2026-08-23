import type { GlobalConfig } from 'payload'
import { revalidateSite } from '../lib/revalidate'

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: 'ตั้งค่าเว็บไซต์',
  admin: { group: 'ตั้งค่าระบบ', description: 'ข้อความและตัวเลขที่ใช้ร่วมกันทั้งเว็บ' },
  access: { read: () => true },
  hooks: { afterChange: [revalidateSite] },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'หน้าแรก',
          fields: [
            { name: 'heroHeadline', type: 'text', required: true, label: 'พาดหัวใหญ่', defaultValue: 'Build Your Dream' },
            { name: 'heroHeadline2', type: 'text', label: 'พาดหัวบรรทัดที่สอง', defaultValue: 'เริ่มที่คันที่ใช่' },
            { name: 'heroSub', type: 'textarea', label: 'ข้อความรอง', defaultValue: 'เลือกรุ่น ดูค่างวดจริง แล้วนัดลองขับที่สาขาใกล้บ้าน — จบได้ในหน้าเดียว' },
            { name: 'heroBlurb', type: 'textarea', label: 'ย่อหน้าแนะนำบริษัท' },
          ],
        },
        {
          label: 'ติดต่อ',
          fields: [
            { name: 'mainPhone', type: 'text', required: true, label: 'เบอร์กลาง', defaultValue: '062-673-1999' },
            { name: 'lineUrl', type: 'text', label: 'ลิงก์ LINE Official' },
            { name: 'facebookUrl', type: 'text', label: 'ลิงก์ Facebook' },
            { name: 'footerAbout', type: 'textarea', label: 'ข้อความแนะนำท้ายเว็บ' },
          ],
        },
        {
          label: 'คำนวณค่างวด',
          fields: [
            {
              name: 'financeRate',
              type: 'number',
              required: true,
              defaultValue: 2.89,
              label: 'อัตราดอกเบี้ยคงที่ต่อปี (%)',
              admin: { description: 'ใส่เป็นเปอร์เซ็นต์ เช่น 2.89 — เครื่องคำนวณบนเว็บจะใช้ค่านี้ทันทีที่บันทึก' },
            },
            {
              name: 'defaultDownPercent',
              type: 'number',
              defaultValue: 20,
              label: 'เงินดาวน์เริ่มต้น (%)',
            },
            {
              name: 'defaultTerm',
              type: 'number',
              defaultValue: 60,
              label: 'จำนวนงวดเริ่มต้น',
            },
            {
              name: 'financeNote',
              type: 'text',
              label: 'ข้อความกำกับใต้ผลคำนวณ',
              defaultValue: 'ตัวเลขเป็นการประมาณเบื้องต้น เงื่อนไขจริงขึ้นอยู่กับการอนุมัติของสถาบันการเงิน',
            },
          ],
        },
        {
          label: 'ลีดทดลองขับ',
          fields: [
            {
              name: 'leadSourceLabel',
              type: 'text',
              required: true,
              defaultValue: 'Website - ทดลองขับ',
              label: 'ชื่อแหล่งที่มาที่บันทึกลง CRM',
              admin: { description: 'ค่านี้จะถูกเขียนลงช่อง lead_source ในระบบ CRM เพื่อให้แยกออกว่าลีดมาจากเว็บ' },
            },
            {
              name: 'leadHolderName',
              type: 'text',
              required: true,
              defaultValue: 'เว็บไซต์ - รอรับ',
              label: 'ชื่อผู้รับลีดตั้งต้น',
              admin: { description: 'ลีดจากเว็บจะลงชื่อนี้ก่อน แล้วให้หัวหน้าสาขากดรับในพอร์ทัล' },
            },
          ],
        },
      ],
    },
  ],
}
