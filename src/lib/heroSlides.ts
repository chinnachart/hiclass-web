/**
 * สไลด์หน้าแรก (hero) — หมุนอัตโนมัติ
 *
 * ตั้งแต่ zip #32 ทีมการตลาดแก้เองได้ที่ ตั้งค่าเว็บไซต์ → หน้าแรก → สไลด์ข้อเสนอหน้าแรก
 * ค่าในไฟล์นี้เป็น "ค่าตั้งต้น" ที่หน้าเว็บใช้เมื่อหลังบ้านยังไม่มีสไลด์ (หรือปิดหมดทุกใบ)
 * กติกา:
 * - ครอบคำด้วยเครื่องหมาย * เพื่อให้คำนั้นเป็นสีทอง เช่น  'ดีลที่ลงหน้าเว็บ *ไม่ได้*'
 * - ขึ้นบรรทัดใหม่ด้วย \n
 * - accent เปลี่ยนสีปุ่มหลักและเส้นบนหัวเรื่อง
 * - ห้ามใส่ตัวเลขที่ยังไม่ยืนยัน — ถ้ายังไม่มี ให้ตัดประโยคนั้นออก อย่าใส่ XX,XXX ขึ้นจริง
 */

export type HeroAccent = 'gold' | 'line' | 'red'

export type HeroSlide = {
  /** ข้อความเล็กเหนือหัวเรื่อง */
  kicker: string
  /** หัวเรื่อง — ใช้ * ครอบคำที่อยากให้เป็นสีทอง · \n = ขึ้นบรรทัด */
  title: string
  /** ย่อหน้าใต้หัวเรื่อง · \n = ขึ้นบรรทัด */
  sub: string
  /** ปุ่มหลัก */
  cta: { label: string; href: string; kind: HeroAccent }
  /** ปุ่มรอง (โปร่ง) */
  cta2?: { label: string; href: string }
  /** บรรทัดเล็กใต้ปุ่ม */
  note?: string
  /** ป้ายชิปใต้ปุ่ม */
  chips?: string[]
  accent: HeroAccent
  /** จัดกลางแทนชิดซ้าย */
  center?: boolean
}

/** `line:` = แทนที่ด้วย LINE กลางจากหลังบ้านตอนเรนเดอร์ (ตั้งค่าเว็บไซต์ → ติดต่อ) */
export const LINE_TOKEN = 'line:'

export const DEFAULT_HERO_SLIDES: HeroSlide[] = [
  {
    kicker: 'Private Offer',
    title: 'ดีลที่เราลงหน้าเว็บ\n*ไม่ได้* แต่บอกในแชทได้',
    sub: 'ส่วนลด ของแถม และดอกเบี้ยพิเศษรอบนี้ ทำได้เฉพาะรายคัน\nทักแชทแจ้งรุ่นที่สนใจ ทีมขายส่งใบเสนอราคาจริงให้ภายใน 1 ชั่วโมง',
    cta: { label: 'ปลดล็อกดีลลับ ทักแชทเลย', href: LINE_TOKEN, kind: 'gold' },
    cta2: { label: 'ดูรุ่นและราคา', href: '/car-model' },
    note: 'ตอบกลับ 08.00–20.00 ทุกวัน · ไม่ต้องกรอกเบอร์ก็คุยได้',
    accent: 'gold',
  },
  {
    kicker: 'Trade-in Privilege',
    title: 'รถคันเดิมของคุณ\nมีค่ากว่าที่คิด',
    sub: 'ประเมินราคารถเก่าฟรีจากรูป 4 มุม รู้ราคาภายใน 1 วันทำการ\nเทิร์นกับ Hi-Class รับสิทธิพิเศษเพิ่มจากราคาประเมิน',
    cta: { label: 'ส่งรูปรถ ประเมินราคาทางแชท', href: '/trade-in', kind: 'line' },
    cta2: { label: 'ดูเงื่อนไขการเทิร์น', href: '/trade-in' },
    chips: ['5 สาขาในกรุงเทพฯ', 'ดีลเลอร์ BYD ยอดขายอันดับ 1 ของประเทศ'],
    accent: 'line',
  },
  {
    kicker: 'BYD ATTO 2 · For the way you move',
    title: 'ข้อเสนอที่ไม่ได้มีให้ทุกคน',
    sub: 'ลงทะเบียนวันนี้ รับสิทธิ์ *Private Offer* ก่อนประกาศหน้าเพจ\nพร้อมนัดทดลองขับสาขาใกล้บ้าน ฟรี ไม่มีเงื่อนไข',
    cta: { label: 'ลงทะเบียนรับสิทธิ์', href: '/register', kind: 'gold' },
    cta2: { label: 'ทักแชทถามก่อนก็ได้', href: LINE_TOKEN },
    note: 'ใช้เวลา 30 วินาที · ทีมขายโทรยืนยันภายใน 1 ชั่วโมง',
    accent: 'gold',
    center: true,
  },
  {
    kicker: 'Flash Deal · เฉพาะเดือนนี้',
    title: 'ราคานี้...\nให้ภาพเล่าแทนไม่ได้',
    sub: 'เป็นดีลที่ลงเป็นตัวเลขหน้าเว็บไม่ได้ เพราะขึ้นกับรุ่น สี และรอบส่งมอบ\nแคปหน้านี้ทักแชทมา เดี๋ยวทีมขายคิดให้เป็นคันๆ',
    cta: { label: 'แคปหน้านี้ ทักแชทรับดีล', href: LINE_TOKEN, kind: 'red' },
    cta2: { label: 'ดูโปรโมชันเดือนนี้', href: '/promotion' },
    chips: ['ฟรีประกันภัยชั้น 1', 'มีรถพร้อมส่งมอบ'],
    accent: 'red',
  },
]

/** 1 แถวของ "สไลด์ข้อเสนอหน้าแรก" ที่อ่านมาจากหลังบ้าน — ทุกช่องเว้นว่างได้ */
export type HeroSlideRow = {
  enabled?: boolean | null
  kicker?: string | null
  title?: string | null
  sub?: string | null
  ctaLabel?: string | null
  ctaHref?: string | null
  ctaKind?: HeroAccent | null
  ghostLabel?: string | null
  ghostHref?: string | null
  note?: string | null
  chips?: string | null
  accent?: HeroAccent | null
  center?: boolean | null
}

const clean = (v?: string | null) => (v || '').trim()

/**
 * แปลงแถวจากหลังบ้านเป็นสไลด์ที่หน้าเว็บใช้
 * - ข้ามแถวที่ปิดสวิตช์ หรือไม่มีทั้งพาดหัวและปุ่ม (กันสไลด์ว่างเปล่าโผล่บนหน้าแรก)
 * - ไม่เหลือสักแถว → คืนค่าตั้งต้น
 */
export function heroSlidesFrom(rows?: HeroSlideRow[] | null): HeroSlide[] {
  const out: HeroSlide[] = []
  for (const r of rows || []) {
    if (r.enabled === false) continue
    const title = clean(r.title)
    const ctaLabel = clean(r.ctaLabel)
    if (!title && !ctaLabel) continue
    const accent: HeroAccent = r.accent || 'gold'
    const ghostLabel = clean(r.ghostLabel)
    out.push({
      kicker: clean(r.kicker),
      title,
      sub: clean(r.sub),
      cta: { label: ctaLabel || 'ทักแชทสอบถาม', href: clean(r.ctaHref) || LINE_TOKEN, kind: r.ctaKind || accent },
      cta2: ghostLabel ? { label: ghostLabel, href: clean(r.ghostHref) || '/contact' } : undefined,
      note: clean(r.note) || undefined,
      chips: clean(r.chips)
        ? clean(r.chips).split('\n').map((c) => c.trim()).filter(Boolean).slice(0, 3)
        : undefined,
      accent,
      center: !!r.center,
    })
  }
  return out.length ? out : DEFAULT_HERO_SLIDES
}
