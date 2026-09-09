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
            { name: 'heroHeadline', type: 'text', required: true, label: 'พาดหัวใหญ่', defaultValue: 'ลองขับ BYD ใกล้บ้าน' },
            { name: 'heroHeadline2', type: 'text', label: 'พาดหัวบรรทัดที่สอง', defaultValue: 'วันนี้ ฟรี' },
            { name: 'heroSub', type: 'textarea', label: 'ข้อความรอง', defaultValue: '5 สาขาในกรุงเทพฯ นัดออนไลน์ 1 นาที ทีมขายโทรยืนยันภายใน 1 ชั่วโมง' },
            { name: 'heroBlurb', type: 'textarea', label: 'ย่อหน้าแนะนำบริษัท' },
          ],
        },
        {
          label: 'ความน่าเชื่อถือ',
          description: 'ตัวเลขจริงของบริษัท ใส่แล้วขึ้นหน้าแรกอัตโนมัติ ช่องไหนเว้นว่างจะไม่แสดง',
          fields: [
            {
              type: 'row',
              fields: [
                { name: 'deliveredCount', type: 'number', min: 0, label: 'ส่งมอบแล้ว (คัน)', admin: { width: '33%', description: 'เช่น 3500 — เว็บจะแสดงเป็น "3,500+ คัน"' } },
                { name: 'yearsOpen', type: 'number', min: 0, label: 'เปิดมาแล้ว (ปี)', admin: { width: '33%' } },
                { name: 'googleRating', type: 'number', min: 0, max: 5, label: 'คะแนนรีวิว Google (เช่น 4.8)', admin: { width: '34%', step: 0.1 } },
              ],
            },
            { name: 'trustNote', type: 'text', label: 'ประโยคเสริมความมั่นใจ', admin: { description: 'เช่น ศูนย์บริการมาตรฐาน BYD ครบทั้ง 5 สาขา ช่างผ่านการอบรมจากโรงงาน' } },
          ],
        },
        {
          label: 'Google & การวัดผล',
          description: 'ค่าจาก Google Analytics และ Search Console — ใส่ครั้งเดียว',
          fields: [
            {
              name: 'gaMeasurementId',
              type: 'text',
              label: 'Google Analytics Measurement ID',
              admin: { description: 'ขึ้นต้นด้วย G- เช่น G-ABC123XYZ (Analytics → Admin → Data Streams) — จะโหลดเฉพาะเมื่อผู้ใช้กดยอมรับคุกกี้ตาม PDPA' },
            },
            {
              name: 'googleSiteVerification',
              type: 'text',
              label: 'รหัสยืนยัน Google Search Console',
              admin: { description: 'เฉพาะค่าใน content="..." ของ meta tag ที่ Search Console ให้มา' },
            },
          ],
        },
        {
          label: 'ติดต่อ',
          fields: [
            { name: 'mainPhone', type: 'text', required: true, label: 'เบอร์กลาง', defaultValue: '062-673-1999' },
            { name: 'lineUrl', type: 'text', label: 'ลิงก์ LINE Official', admin: { description: 'สำคัญ — ปุ่ม "แอด LINE" ทุกหน้าใช้ลิงก์นี้ เช่น https://lin.ee/xxxxx (ถ้าเว้นว่างปุ่มจะกลายเป็น "ติดต่อเรา")' } },
            { name: 'facebookUrl', type: 'text', label: 'ลิงก์ Facebook' },
            {
              name: 'contactEmail',
              type: 'email',
              label: 'อีเมลกลางสำหรับลูกค้าติดต่อ',
              defaultValue: 'bydhiclass.online@gmail.com',
              admin: { description: 'แสดงท้ายเว็บ หน้าติดต่อเรา และส่งให้ Google เป็นอีเมลของธุรกิจ' },
            },
            { name: 'footerAbout', type: 'textarea', label: 'ย่อหน้าแนะนำบริษัท', admin: { description: 'แสดงท้ายเว็บทุกหน้า และหัวหน้าติดต่อเรา — เล่าว่า Hi-Class ต่างจากดีลเลอร์อื่นยังไง' } },
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
