/**
 * รางวัลของ Hi-Class Group — ข้อมูลคงที่ (v1)
 * อัปเดตปีละครั้งหลังงาน Dealer Award — แก้ไฟล์นี้ไฟล์เดียว หน้า /awards, หน้าแรก, JSON-LD เปลี่ยนตาม
 * แหล่งข้อมูล: Hi-Class Group Company Profile 2026
 */

export type AwardLevel = 'national' | 'apac'

export type Award = {
  year: number
  /** ชื่อรางวัลตามใบประกาศ (อังกฤษ) — ใช้ใน JSON-LD */
  title: string
  /** คำอธิบายภาษาไทย 1 ประโยค */
  th: string
  /** เวทีที่มอบ */
  event: string
  level: AwardLevel
  /** จำนวนรางวัล (ถ้าได้หลายใบในหัวข้อเดียว) */
  count?: number
}

export const AWARDS: Award[] = [
  {
    year: 2025,
    title: 'BYD KUNLUN Award',
    th: 'รางวัลสูงสุดของ BYD Dealer of the Year ด้านผลงานการขาย',
    event: 'BYD Dealer of the Year Award 2025',
    level: 'national',
  },
  {
    year: 2025,
    title: 'BYD HUASHAN Award',
    th: 'รางวัลผลงานการขายยอดเยี่ยมระดับประเทศ',
    event: 'BYD Dealer of the Year Award 2025',
    level: 'national',
  },
  {
    year: 2025,
    title: 'BYD NPS Award — After-Sales Service Quality',
    th: 'คุณภาพบริการหลังการขาย วัดจากความพึงพอใจของลูกค้าจริง',
    event: 'BYD Dealer of the Year Award 2025',
    level: 'national',
  },
  {
    year: 2025,
    title: 'BYD Thailand Tech Star & Skill Contest Award',
    th: 'ทีมช่างเทคนิคคว้า 6 รางวัลจากการแข่งขันทักษะช่างระดับประเทศ',
    event: 'BYD Thailand Tech Star & Skill Contest 2025',
    level: 'national',
    count: 6,
  },
  {
    year: 2024,
    title: 'Best Sales Growth Award',
    th: 'ยอดขายเติบโตสูงสุดในกลุ่มดีลเลอร์ BYD เอเชียแปซิฟิก',
    event: 'BYD Asia Pacific Dealer Conference 2025',
    level: 'apac',
  },
  {
    year: 2024,
    title: 'Excellent Channel Development Award',
    th: 'การพัฒนาเครือข่ายโชว์รูมและช่องทางขายยอดเยี่ยม',
    event: 'BYD Asia Pacific Dealer Conference 2025',
    level: 'apac',
  },
  {
    year: 2024,
    title: 'Outstanding After-Sales Service Award',
    th: 'บริการหลังการขายโดดเด่นระดับเอเชียแปซิฟิก',
    event: 'BYD Asia Pacific Dealer Conference 2025',
    level: 'apac',
  },
  {
    year: 2024,
    title: 'BYD Thailand Tech Star & Skill Contest Award',
    th: 'ทีมช่างเทคนิคคว้า 6 รางวัลจากการแข่งขันทักษะช่างระดับประเทศ',
    event: 'BYD Thailand Tech Star & Skill Contest 2024',
    level: 'national',
    count: 6,
  },
  {
    year: 2023,
    title: 'BYD Asia Pacific Outstanding Renovation Award',
    th: 'โชว์รูมสาขากาญจนาภิเษก ได้รับเลือกเป็นโชว์รูมปรับปรุงยอดเยี่ยมระดับเอเชียแปซิฟิก',
    event: 'BYD Award Ceremony 2024',
    level: 'apac',
  },
]

export const LEVEL_LABEL: Record<AwardLevel, string> = {
  national: 'ระดับประเทศ',
  apac: 'ระดับเอเชียแปซิฟิก',
}

/** ตัวเลขที่ใช้ทั้งหน้าแรกและหน้า /awards */
export const AWARD_STATS = {
  /** ปีล่าสุดที่ได้ Dealer of the Year */
  dealerOfYear: 2025,
  nationalAwardsLatest: 3,
  techAwardsTotal: 12,
  deliveredUnits: 10000,
  /** ข้อความกำกับที่มาของตัวเลข — แสดงคู่กับคำเคลม "อันดับ 1" เสมอ */
  asOf: 'ข้อมูล Hi-Class Group รวมทุกสาขา ณ กันยายน 2569',
}

/** ชื่อรางวัลสำหรับ schema.org `award` */
export const AWARD_NAMES = AWARDS.map((a) => `${a.title} ${a.year}${a.count ? ` (${a.count} awards)` : ''}`)

export const AWARD_YEARS = [...new Set(AWARDS.map((a) => a.year))].sort((a, b) => b - a)
