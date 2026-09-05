/**
 * ใส่ข้อมูลตั้งต้นให้หลังบ้าน — รันครั้งเดียวตอนติดตั้ง:  npx tsx src/scripts/seed.ts
 * ราคาและระยะทางเป็นค่าตั้งต้น ทีมการตลาดแก้เองได้จากหลังบ้าน
 */
import 'dotenv/config'
import { getPayload } from 'payload'
import config from '../payload.config.js'

const MODELS = [
  { name: 'Sealion 7', slug: 'sealion-7', bodyType: 'suv',   tagline: 'SUV ไฟฟ้า',            priceFrom: 1249900, rangeKm: 482,  colorsCount: 4, sortOrder: 10 },
  { name: 'Sealion 6', slug: 'sealion-6', bodyType: 'suv',   tagline: 'SUV ไฮบริด DM-i',      priceFrom: 939900,  rangeKm: 1090, colorsCount: 3, sortOrder: 20 },
  { name: 'Sealion 5', slug: 'sealion-5', bodyType: 'suv',   tagline: 'SUV ไฟฟ้า',            priceFrom: 899900,  rangeKm: 430,  colorsCount: 3, sortOrder: 30 },
  { name: 'Atto 3',    slug: 'atto-3',    bodyType: 'suv',   tagline: 'SUV ไฟฟ้า',            priceFrom: 899900,  rangeKm: 480,  colorsCount: 4, sortOrder: 40 },
  { name: 'Atto 2',    slug: 'atto-2',    bodyType: 'suv',   tagline: 'SUV ไฟฟ้าขนาดเล็ก',    priceFrom: 799900,  rangeKm: 420,  colorsCount: 4, sortOrder: 50 },
  { name: 'Atto 1',    slug: 'atto-1',    bodyType: 'hatch', tagline: 'ซิตี้คาร์ไฟฟ้า',        priceFrom: 569900,  rangeKm: 300,  colorsCount: 4, sortOrder: 60 },
  { name: 'Dolphin',   slug: 'dolphin',   bodyType: 'hatch', tagline: 'แฮทช์แบ็กไฟฟ้า',       priceFrom: 659900,  rangeKm: 410,  colorsCount: 4, sortOrder: 70 },
  { name: 'Seal 5',    slug: 'seal-5',    bodyType: 'sedan', tagline: 'ซีดานไฮบริด DM-i',     priceFrom: 769900,  rangeKm: 1200, colorsCount: 3, sortOrder: 80 },
  { name: 'Seal 6',    slug: 'seal-6',    bodyType: 'sedan', tagline: 'ซีดานไฮบริด DM-i',     priceFrom: 829900,  rangeKm: 1250, colorsCount: 3, sortOrder: 90 },
  { name: 'M6',        slug: 'm6',        bodyType: 'mpv',   tagline: 'MPV 7 ที่นั่ง',         priceFrom: 829900,  rangeKm: 530,  colorsCount: 3, sortOrder: 100 },
]

// รหัสสาขาตรงกับตาราง branches ในระบบ CRM
const BRANCHES = [
  { code: 'ratchada', name: 'รัชดา',        nameEn: 'Ratchada',       phone: '062-673-1999', domain: 'bydhiclassratchada.com', sortOrder: 10 },
  { code: 'ladprao',  name: 'ลาดพร้าว',     nameEn: 'Ladprao',        phone: '063-464-6222', domain: 'bydhiclassladprao.com',  sortOrder: 20 },
  { code: 'rama5',    name: 'พระราม 5',     nameEn: 'Rama 5',         phone: '095-048-9555', domain: 'bydhiclassrama5.com',    sortOrder: 30 },
  { code: 'bonmarche',name: 'บองมาร์เช่',   nameEn: 'Bon Marche',     phone: '083-117-8176', domain: '',                       sortOrder: 40 },
  { code: 'kanchana', name: 'กาญจนาภิเษก',  nameEn: 'Kanchanaphisek', phone: '02-454-8545',  domain: '',                       sortOrder: 50 },
]

const run = async () => {
  const payload = await getPayload({ config })

  const existing = await payload.find({ collection: 'users', limit: 1 })
  if (existing.totalDocs === 0) {
    await payload.create({
      collection: 'users',
      data: {
        email: 'admin@hiclassevcar.com',
        password: 'ChangeMe123!',
        fullName: 'ผู้ดูแลระบบ',
        role: 'admin',
      },
    })
    console.log('สร้างผู้ใช้ admin@hiclassevcar.com / ChangeMe123!  <-- เปลี่ยนรหัสผ่านทันทีหลังล็อกอิน')
  }

  // คำถามตั้งต้น — อิงจากคำที่คนค้นเจอเว็บจริงใน Search Console
  const faqFor = (name: string, price: number) => [
    {
      question: `BYD ${name} ผ่อนเดือนละเท่าไหร่`,
      answer: `ขึ้นอยู่กับเงินดาวน์และจำนวนงวดที่เลือก ใช้เครื่องคำนวณค่างวดในหน้านี้ปรับดูได้ทันที ราคาเริ่มต้นของรุ่นนี้อยู่ที่ ${price.toLocaleString('th-TH')} บาท ตัวเลขเป็นการประมาณเบื้องต้น เงื่อนไขจริงขึ้นอยู่กับการอนุมัติของสถาบันการเงิน`,
    },
    {
      question: `BYD ${name} มีสีอะไรบ้าง`,
      answer: 'สีที่มีจำหน่ายเปลี่ยนแปลงตามรอบการผลิต สอบถามสาขาที่สะดวกเพื่อเช็คสีที่พร้อมส่งมอบได้เลย',
    },
    {
      question: `ทดลองขับ BYD ${name} ได้ที่ไหน`,
      answer: 'นัดทดลองขับฟรีได้ที่ทั้ง 5 สาขาในกรุงเทพฯ และปริมณฑล กรอกฟอร์มบนเว็บแล้วทีมขายติดต่อกลับเพื่อยืนยันวันเวลา',
    },
  ]

  for (const m of MODELS) {
    const found = await payload.find({ collection: 'car-models', where: { slug: { equals: m.slug } }, limit: 1 })
    if (found.totalDocs === 0) {
      await payload.create({
        collection: 'car-models',
        data: { ...m, published: true, faq: faqFor(m.name, m.priceFrom) } as never,
      })
      console.log('เพิ่มรุ่น', m.name)
    }
  }

  for (const b of BRANCHES) {
    const found = await payload.find({ collection: 'branches', where: { code: { equals: b.code } }, limit: 1 })
    if (found.totalDocs === 0) {
      await payload.create({
        collection: 'branches',
        data: { ...b, openHours: 'จ.–อา. 08:30–18:30', published: true } as never,
      })
      console.log('เพิ่มสาขา', b.name)
    }
  }

  const promos = await payload.find({ collection: 'promotions', limit: 1 })
  if (promos.totalDocs === 0) {
    await payload.create({
      collection: 'promotions',
      data: {
        title: 'ดาวน์เริ่มต้น 0% พร้อมประกันชั้น 1',
        summary: 'สำหรับรุ่นที่ร่วมรายการและรับรถภายในเดือนนี้ เงื่อนไขเป็นไปตามที่บริษัทกำหนด',
        badge: 'ไฮไลต์', featured: true, sortOrder: 10,
      } as never,
    })
    await payload.create({
      collection: 'promotions',
      data: {
        title: 'ทดลองขับรับของที่ระลึก',
        summary: 'นัดผ่านเว็บ เลือกวันเวลาและสาขาที่สะดวก ไม่ต้องรอโทรกลับเพื่อยืนยัน',
        badge: 'ทดลองขับ', sortOrder: 20,
      } as never,
    })
    console.log('เพิ่มโปรโมชันตัวอย่าง')
  }

  await payload.updateGlobal({
    slug: 'site-settings',
    data: {
      heroHeadline: 'Build Your Dream',
      heroHeadline2: 'เริ่มที่คันที่ใช่',
      heroSub: 'เลือกรุ่น ดูค่างวดจริง แล้วนัดลองขับที่สาขาใกล้บ้าน — จบได้ในหน้าเดียว',
      heroBlurb:
        'Hi-Class EV Car ดูแลลูกค้า BYD ตั้งแต่เลือกคัน จัดไฟแนนซ์ ส่งมอบ ไปจนถึงศูนย์บริการและรถเช่าระหว่างซ่อม',
      mainPhone: '062-673-1999',
      footerAbout:
        'ผู้จำหน่ายรถยนต์ไฟฟ้า BYD อย่างเป็นทางการ พร้อมศูนย์บริการมาตรฐานและบริการรถเช่าระหว่างซ่อม',
      financeRate: 2.89,
      defaultDownPercent: 20,
      defaultTerm: 60,
      financeNote:
        'ตัวเลขเป็นการประมาณเบื้องต้น เงื่อนไขจริงขึ้นอยู่กับการอนุมัติของสถาบันการเงิน',
      leadSourceLabel: 'Website - ทดลองขับ',
      leadHolderName: 'เว็บไซต์ - รอรับ',
    } as never,
  })
  console.log('ตั้งค่าเว็บไซต์เรียบร้อย')
  process.exit(0)
}

run().catch((e) => { console.error(e); process.exit(1) })
