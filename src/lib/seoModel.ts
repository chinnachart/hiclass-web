/**
 * SEO ของหน้ารุ่นรถ (zip #39)
 * ที่มา: Search Console ก.ย. 2569 — คนค้น "<รุ่น> ราคา / ตารางผ่อน / สเปค / สี / ดาวน์" เยอะ แต่ CTR ของเราต่ำกว่า 1%
 * เพราะ title ไม่มีคำพวกนี้ · ไฟล์นี้ทำ 3 อย่าง: title/description ที่ตอบคำค้น, FAQ สำรองเมื่อหลังบ้านยังไม่ได้กรอก,
 * และปีที่ใช้ในหัวข้อ (ปีปัจจุบันตามเวลาไทย ไม่ต้องมาแก้ทุกปี)
 */
import type { CarModel, Branch } from './types'
import { baht } from './format'

/** ปี ค.ศ. ตามเวลาไทย — Google เห็นคำว่า "2026" ในหัวข้อแล้วมองว่าหน้าอัปเดต */
export function seoYear(now = new Date()): number {
  return Number(new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Bangkok', year: 'numeric' }).format(now))
}

/** Google ตัดหัวข้อที่ ~60 ตัวอักษร — วางคำที่คนค้นไว้หน้าสุด แบรนด์ไว้ท้าย */
export function modelTitle(m: CarModel, year = seoYear()): string {
  return `BYD ${m.name} ${year} ราคา ตารางผ่อน สเปค สี | Hi-Class ทดลองขับฟรี 5 สาขา`
}

export function modelDescription(m: CarModel, perMonth: number, year = seoYear()): string {
  const range = m.rangeKm
    ? m.powertrain === 'phev'
      ? ` ระยะทางรวม ${m.rangeKm.toLocaleString('th-TH')} กม.`
      : ` วิ่งได้ ${m.rangeKm.toLocaleString('th-TH')} กม./ชาร์จ`
    : ''
  const colors = m.colors?.length ? ` ${m.colors.length} สี` : m.colorsCount ? ` ${m.colorsCount} สี` : ''
  return `BYD ${m.name} ${year} ราคาเริ่ม ${baht(m.priceFrom)} บาท ผ่อนเริ่ม ${baht(perMonth)} บาท/เดือน${range}${colors} ดูสเปคทุกรุ่นย่อย ตารางผ่อนทุกดาวน์ โปรเดือนนี้ และนัดทดลองขับฟรีที่ Hi-Class 5 สาขาทั่วกรุงเทพฯ`
}

/** ข้อมูลสีที่จะแสดง — ใช้ของหลังบ้านก่อน ถ้าไม่มีค่อยถอยไปใช้จำนวนสี */
export function colorList(m: CarModel): { name: string; hex: string }[] {
  const FALLBACK = ['#E8E9EC', '#2B2D31', '#8A96A8', '#4A6B8A', '#B8322A', '#5B6B5A']
  if (m.colors && m.colors.length) {
    return m.colors.map((c, i) => ({ name: c.name, hex: c.hex && /^#[0-9a-f]{3,8}$/i.test(c.hex) ? c.hex : FALLBACK[i % FALLBACK.length] }))
  }
  return []
}

type FaqCtx = {
  m: CarModel
  branches: Branch[]
  perMonth: number
  defaultDown: number
  defaultTerm: number
  year?: number
}

/**
 * FAQ สำรอง — ใช้เมื่อหลังบ้านยังไม่ได้กรอก "คำถามที่ลูกค้าถามบ่อย" ของรุ่นนี้
 * คำถามเรียงตามที่คนพิมพ์ใน Google จริง (ราคา → ผ่อน → ระยะทาง → สี → ทดลองขับ → รับประกัน)
 * ตอบเฉพาะจากข้อมูลที่มีในหลังบ้าน ไม่เดาตัวเลขที่ไม่มี · การรับประกันใช้เงื่อนไขมาตรฐาน BYD ประเทศไทย
 */
export function defaultFaq({ m, branches, perMonth, defaultDown, defaultTerm, year = seoYear() }: FaqCtx): { question: string; answer: string }[] {
  const items: { question: string; answer: string }[] = []
  const bn = branches.length || 5
  const branchNames = branches.map((b) => b.name).join(' / ')

  const variants = (m.variants || []).filter((v) => v && v.price > 0)
  items.push({
    question: `BYD ${m.name} ${year} ราคาเท่าไหร่`,
    answer: variants.length
      ? `BYD ${m.name} มี ${variants.length} รุ่นย่อย ${variants.map((v) => `${v.name} ${baht(v.price)} บาท`).join(', ')} (ราคาอาจเปลี่ยนตามแคมเปญของ BYD ประเทศไทย เช็กโปรล่าสุดกับสาขาได้ทุกวัน)`
      : `BYD ${m.name} ราคาเริ่มต้น ${baht(m.priceFrom)} บาท (ราคาอาจเปลี่ยนตามแคมเปญของ BYD ประเทศไทย เช็กโปรล่าสุดกับสาขาได้ทุกวัน)`,
  })

  items.push({
    question: `BYD ${m.name} ผ่อนเดือนละเท่าไหร่`,
    answer: `ดาวน์ ${defaultDown}% ผ่อน ${defaultTerm} งวด ค่างวดประมาณ ${baht(perMonth)} บาท/เดือน ดาวน์มากกว่านี้หรือผ่อนสั้นกว่านี้ค่างวดจะต่างออกไป ดูตารางผ่อนทุกดาวน์ได้ในหน้านี้ หรือให้ทีมขายคำนวณตามเงื่อนไขไฟแนนซ์จริงของคุณ`,
  })

  if (m.rangeKm) {
    items.push(
      m.powertrain === 'phev'
        ? {
            question: `BYD ${m.name} วิ่งได้กี่กิโล`,
            answer: `BYD ${m.name} เป็นไฮบริด DM-i ระยะทางรวม (ไฟฟ้า + น้ำมัน) ประมาณ ${m.rangeKm.toLocaleString('th-TH')} กม. ต่อการชาร์จเต็มและน้ำมันเต็มถัง ใช้ไฟฟ้าล้วนในเมืองได้ และวิ่งทางไกลได้โดยไม่ต้องหาที่ชาร์จ`,
          }
        : {
            question: `BYD ${m.name} ชาร์จเต็มวิ่งได้กี่กิโล`,
            answer: `BYD ${m.name} วิ่งได้ประมาณ ${m.rangeKm.toLocaleString('th-TH')} กม. ต่อการชาร์จเต็ม (มาตรฐาน NEDC) ระยะทางจริงขึ้นกับความเร็ว การเปิดแอร์ และเส้นทาง`,
          },
    )
  }

  const colors = colorList(m)
  if (colors.length) {
    items.push({
      question: `BYD ${m.name} มีสีอะไรบ้าง`,
      answer: `BYD ${m.name} มี ${colors.length} สี ได้แก่ ${colors.map((c) => c.name).join(', ')} บางสีอาจต้องรอคิว สอบถามสต็อกสีที่ต้องการกับสาขาได้ทันที`,
    })
  } else if (m.colorsCount) {
    items.push({ question: `BYD ${m.name} มีกี่สี`, answer: `BYD ${m.name} มี ${m.colorsCount} สีให้เลือก สอบถามสีที่มีในสต็อกกับสาขาได้ทันที` })
  }

  items.push({
    question: `ทดลองขับ BYD ${m.name} ได้ที่ไหน`,
    answer: `ทดลองขับฟรีได้ที่ Hi-Class ทั้ง ${bn} สาขา${branchNames ? ` (${branchNames})` : ''} กรอกชื่อกับเบอร์ในหน้านี้ ทีมขายโทรยืนยันคิวภายใน 1 ชั่วโมงในเวลาทำการ ไม่มีข้อผูกมัด`,
  })

  items.push({
    question: `BYD ${m.name} รับประกันอะไรบ้าง`,
    answer: `BYD ประเทศไทยรับประกันตัวรถ 6 ปีหรือ 150,000 กม. และแบตเตอรี่ 8 ปีหรือ 160,000 กม. (แล้วแต่อย่างใดถึงก่อน) เข้าศูนย์บริการมาตรฐาน BYD ของ Hi-Class ได้ทุกสาขา และมีศูนย์ซ่อมสีและตัวถังในเครือ`,
  })

  items.push({
    question: `ซื้อ BYD ${m.name} กับ Hi-Class ต่างจากที่อื่นยังไง`,
    answer: `Hi-Class เป็นดีลเลอร์ BYD อย่างเป็นทางการ ${bn} สาขาในกรุงเทพฯ และนนทบุรี มีโชว์รูม ศูนย์บริการ และศูนย์ซ่อมสีตัวถังในเครือเดียวกัน ราคาและโปรเป็นไปตามแคมเปญ BYD ประเทศไทย ส่วนที่ต่างคือมีรถให้ทดลองขับทุกสาขา บริการหลังการขายใกล้บ้าน และทีมขายที่ดูแลต่อเนื่องหลังรับรถ`,
  })

  return items
}
