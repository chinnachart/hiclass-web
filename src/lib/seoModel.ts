/**
 * SEO ของหน้ารุ่นรถ (zip #39)
 * ที่มา: Search Console ก.ย. 2569 — คนค้น "<รุ่น> ราคา / ตารางผ่อน / สเปค / สี / ดาวน์" เยอะ แต่ CTR ของเราต่ำกว่า 1%
 * เพราะ title ไม่มีคำพวกนี้ · ไฟล์นี้ทำ 3 อย่าง: title/description ที่ตอบคำค้น, FAQ สำรองเมื่อหลังบ้านยังไม่ได้กรอก,
 * และปีที่ใช้ในหัวข้อ (ปีปัจจุบันตามเวลาไทย ไม่ต้องมาแก้ทุกปี)
 */
import type { CarModel, Branch } from './types'
import { baht, BODY_TYPES } from './format'

/** ปี ค.ศ. ตามเวลาไทย — Google เห็นคำว่า "2026" ในหัวข้อแล้วมองว่าหน้าอัปเดต */
export function seoYear(now = new Date()): number {
  return Number(new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Bangkok', year: 'numeric' }).format(now))
}

/**
 * Google ตัดหัวข้อที่ ~60 ตัวอักษร — วางคำที่คนค้นไว้หน้าสุด แบรนด์ไว้ท้าย
 * ★ 1 พ.ย. 2026 เดิมยาว ~93 ตัว (ต่อท้าย template "| BYD Hi-Class EV Car" อีกรอบ → Hi-Class ซ้ำ) — หน้ารุ่นใช้ title.absolute
 */
export function modelTitle(m: CarModel, year = seoYear()): string {
  return `BYD ${m.name} ${year} ราคา ตารางผ่อน สเปค สี | Hi-Class`
}

export function modelDescription(m: CarModel, perMonth: number, year = seoYear()): string {
  const range = m.rangeKm
    ? m.powertrain === 'phev'
      ? ` ระยะทางรวม ${m.rangeKm.toLocaleString('th-TH')} กม.`
      : ` วิ่งได้ ${m.rangeKm.toLocaleString('th-TH')} กม./ชาร์จ`
    : ''
  const colors = m.colors?.length ? ` ${m.colors.length} สี` : m.colorsCount ? ` ${m.colorsCount} สี` : ''
  // ★ 1 พ.ย. 2026 Google ตัดคำอธิบายที่ ~155 ตัว (เดิม ~190) — ตัวเลขสำคัญไว้หน้า ข้อความชวนกดไว้ท้าย
  return `BYD ${m.name} ${year} ราคาเริ่ม ${baht(m.priceFrom)} บาท ผ่อน ${baht(perMonth)}/เดือน${range}${colors} ดูสเปค ตารางผ่อน นัดทดลองขับฟรี Hi-Class 6 สาขา`
}

/**
 * ★ 1 พ.ย. 2026 เนื้อหาหน้ารุ่นบางกว่าคู่แข่ง (~900 คำ vs ~2,700) — ส่วนด้านล่างสร้างข้อความจากข้อมูลหลังบ้านล้วน
 * (ราคา รุ่นย่อย ระยะทาง สเปค สี ตำแหน่งในไลน์อัป) ไม่เดาตัวเลขที่ไม่มี — ทุกรุ่นได้เนื้อหาไม่ซ้ำกันอัตโนมัติ
 */
const pt = (m: Pick<CarModel, 'powertrain'>) => (m.powertrain === 'phev' ? 'ไฮบริดปลั๊กอิน DM-i' : 'ไฟฟ้า 100%')
const rangeTxt = (m: Pick<CarModel, 'powertrain' | 'rangeKm'>) =>
  m.rangeKm ? (m.powertrain === 'phev' ? `ระยะทางรวม ${m.rangeKm.toLocaleString('th-TH')} กม.` : `${m.rangeKm.toLocaleString('th-TH')} กม./ชาร์จ`) : '–'
/** เว้นวรรคหน้าคำอังกฤษ ("รถ SUV") แต่ไม่เว้นหน้าคำไทย ("รถแฮทช์แบ็ก") */
const sp = (t: string) => (/^[A-Za-z]/.test(t) ? ' ' : '') + t
const colorCount = (m: CarModel) => m.colors?.length || m.colorsCount || 0

/** รุ่นใกล้เคียงสำหรับเทียบ: ตัวถังเดียวกันก่อน (ราคาใกล้สุด) แล้วเติมด้วยรุ่นราคาใกล้เคียงต่างตัวถัง */
export function nearestModels(m: CarModel, models: CarModel[], n = 3): CarModel[] {
  const byGap = (a: CarModel, b: CarModel) => Math.abs(a.priceFrom - m.priceFrom) - Math.abs(b.priceFrom - m.priceFrom)
  const others = models.filter((x) => x.id !== m.id && x.priceFrom > 0)
  const same = others.filter((x) => x.bodyType === m.bodyType).sort(byGap)
  const rest = others.filter((x) => x.bodyType !== m.bodyType).sort(byGap)
  return [...same, ...rest].slice(0, n)
}

/** ย่อหน้า "ภาพรวม" — ตำแหน่งของรุ่นนี้ในไลน์อัป Hi-Class คำนวณจากราคาและระยะทางจริง */
export function modelOverview(m: CarModel, models: CarModel[], perMonth: number, defaultDown: number, defaultTerm: number): string[] {
  const body = BODY_TYPES[m.bodyType] || m.bodyType
  const variants = (m.variants || []).filter((v) => v && v.price > 0)
  const priced = models.filter((x) => x.priceFrom > 0).sort((a, b) => a.priceFrom - b.priceFrom)
  const rank = priced.findIndex((x) => x.id === m.id) + 1
  const sameBody = priced.filter((x) => x.bodyType === m.bodyType)
  const cc = colorCount(m)
  const out: string[] = []

  const vTxt =
    variants.length > 1
      ? ` มี ${variants.length} รุ่นย่อย ราคา ${baht(Math.min(...variants.map((v) => v.price)))}–${baht(Math.max(...variants.map((v) => v.price)))} บาท`
      : ''
  out.push(
    `BYD ${m.name} เป็นรถ${sp(body)} ขุมพลัง${pt(m)} ราคาเริ่มต้น ${baht(m.priceFrom)} บาท${vTxt}` +
      `${m.rangeKm ? ` ${m.powertrain === 'phev' ? 'ระยะทางรวมไฟฟ้าและน้ำมันประมาณ' : 'วิ่งได้ประมาณ'} ${m.rangeKm.toLocaleString('th-TH')} กม.${m.powertrain === 'phev' ? '' : ' ต่อการชาร์จเต็ม'}` : ''}` +
      `${cc ? ` มีให้เลือก ${cc} สี` : ''}`,
  )

  if (rank > 0 && priced.length > 1) {
    const pos = rank === 1 ? 'ราคาเริ่มต้นถูกที่สุด' : rank === priced.length ? 'ราคาสูงที่สุด' : `ราคาอยู่อันดับ ${rank} จาก ${priced.length} รุ่น (เรียงจากถูกไปแพง)`
    const bodyTxt = sameBody.length > 1 ? ` ในกลุ่ม${sp(body)} มีให้เลือก ${sameBody.length} รุ่น ได้แก่ ${sameBody.map((x) => x.name).join(', ')}` : ''
    let rangePos = ''
    if (m.rangeKm && m.powertrain !== 'phev') {
      const evs = models.filter((x) => x.powertrain !== 'phev' && x.rangeKm).sort((a, b) => (b.rangeKm || 0) - (a.rangeKm || 0))
      // อันดับแบบนับรุ่นที่วิ่งไกลกว่าจริง (ระยะเท่ากันได้อันดับเดียวกัน) · บอกเฉพาะ 3 อันดับแรก
      const r = 1 + evs.filter((x) => (x.rangeKm || 0) > (m.rangeKm || 0)).length
      if (r === 1 && evs.length > 1) rangePos = ` และวิ่งได้ไกลที่สุดในกลุ่มรถไฟฟ้า 100% ที่ Hi-Class มีขาย`
      else if (r <= 3 && evs.length > 3) rangePos = ` ระยะทางต่อการชาร์จติด ${r} อันดับแรกจากรถไฟฟ้า 100% ทั้งหมด ${evs.length} รุ่น`
    }
    out.push(`ในไลน์อัป BYD ${priced.length} รุ่นที่ Hi-Class จำหน่าย ${m.name} ${pos}${bodyTxt}${rangePos}`)
  }

  out.push(
    `ถ้าดาวน์ ${defaultDown}% และผ่อน ${defaultTerm} งวด ค่างวดประมาณ ${baht(perMonth)} บาทต่อเดือน (ยังไม่รวมประกันและค่าธรรมเนียม) ` +
      `ทดลองขับฟรีได้ทุกสาขาของ Hi-Class ก่อนตัดสินใจ`,
  )
  return out
}

/** "เหมาะกับใคร" — อิงตัวถัง ขุมพลัง และช่วงราคา (ไม่อ้างสเปคที่ไม่มีในหลังบ้าน) */
export function modelFitFor(m: CarModel, models: CarModel[]): string[] {
  const out: string[] = []
  if (m.powertrain === 'phev') {
    out.push('คนที่ขับทางไกลหรือต่างจังหวัดบ่อย อยากใช้ไฟฟ้าในเมืองแต่ไม่อยากกังวลเรื่องหาที่ชาร์จ เพราะเติมน้ำมันได้')
  } else {
    out.push('คนที่ชาร์จไฟที่บ้านหรือที่ทำงานได้ อยากประหยัดค่าพลังงานและค่าบำรุงรักษาแบบรถไฟฟ้า 100%')
  }
  const byBody: Record<string, string> = {
    suv: 'คนที่ชอบตำแหน่งนั่งสูง ขึ้นลงสะดวก และต้องการพื้นที่เก็บของสำหรับครอบครัว',
    sedan: 'คนที่ชอบรถทรงต่ำ ขับนิ่ง และเน้นการเดินทางไกลบนทางหลวง',
    hatch: 'คนที่ขับในเมืองเป็นหลัก ต้องการรถคล่องตัว หาที่จอดง่าย',
    mpv: 'ครอบครัวใหญ่ที่ต้องการพื้นที่นั่งหลายแถวและห้องโดยสารกว้าง',
  }
  if (byBody[m.bodyType]) out.push(byBody[m.bodyType])
  const prices = models.filter((x) => x.priceFrom > 0).map((x) => x.priceFrom).sort((a, b) => a - b)
  if (prices.length > 2) {
    const third = prices[Math.floor(prices.length / 3)]
    // รุ่นท็อป = ราคาสูงสุดรุ่นเดียว (กันรุ่นกลางๆ ถูกเรียกว่าท็อป)
    if (m.priceFrom === prices[prices.length - 1]) out.push('คนที่มองหารุ่นท็อปในไลน์อัป BYD และให้ความสำคัญกับสมรรถนะและความพรีเมียม')
    else if (m.priceFrom <= third) out.push(`คนที่มีงบเริ่มต้นไม่เกินราว ${baht(Math.ceil(m.priceFrom / 100000) * 100000)} บาท และอยากเริ่มใช้รถ BYD`)
    else out.push('คนที่อยากได้ความสมดุลระหว่างราคา พื้นที่ใช้สอย และออปชัน')
  }
  return out
}

/** คำถามเพิ่ม (ต่อท้าย FAQ สำรอง): รุ่นย่อยต่างกันยังไง · เทียบกับรุ่นใกล้เคียง · ชาร์จเร็ว */
export function extraFaq(m: CarModel, models: CarModel[]): { question: string; answer: string }[] {
  const items: { question: string; answer: string }[] = []
  const variants = (m.variants || []).filter((v) => v && v.price > 0)
  if (variants.length > 1) {
    const lo = Math.min(...variants.map((v) => v.price))
    items.push({
      question: `BYD ${m.name} แต่ละรุ่นย่อยต่างกันยังไง`,
      answer: `${m.name} มี ${variants.length} รุ่นย่อย: ${variants
        .map((v) => `${v.name} ${baht(v.price)} บาท${v.price > lo ? ` (แพงกว่ารุ่นเริ่มต้น ${baht(v.price - lo)} บาท)` : ''}${v.note ? ` — ${v.note}` : ''}`)
        .join(' | ')} ทีมขายช่วยเทียบออปชันจริงของแต่ละรุ่นย่อยให้ได้ที่สาขา`,
    })
  }
  const charge = (m.specs || []).find((s) => /ชาร์จ/.test(s.label))
  if (charge && charge.value) {
    items.push({ question: `BYD ${m.name} ชาร์จเร็วใช้เวลาเท่าไหร่`, answer: `${charge.label}: ${charge.value} (ตามข้อมูลผู้ผลิต เวลาจริงขึ้นกับกำลังของตู้ชาร์จและอุณหภูมิแบตเตอรี่)` })
  }
  // 14 พ.ย. 2569: คำถามจากคำค้นจริงใน Search Console (แบต / แรงม้า) — ตอบจากสเปกที่กรอกในหลังบ้านเท่านั้น ไม่มีข้อมูลก็ไม่แสดง
  const batt = (m.specs || []).find((s) => /แบต/.test(s.label))
  if (batt && batt.value) {
    items.push({ question: `BYD ${m.name} แบตเตอรี่ขนาดเท่าไหร่`, answer: `BYD ${m.name} ใช้แบตเตอรี่ขนาด ${batt.value} (ตามข้อมูลผู้ผลิต บางรุ่นย่อยอาจต่างกัน สอบถามสเปกของรุ่นย่อยที่สนใจกับสาขาได้)` })
  }
  const power = (m.specs || []).find((s) => /แรงม้า|กำลังสูงสุด|มอเตอร์/.test(s.label))
  const accel = (m.specs || []).find((s) => /อัตราเร่ง|0.100/.test(s.label))
  if (power && power.value) {
    items.push({
      question: `BYD ${m.name} กี่แรงม้า`,
      answer: `BYD ${m.name} ${power.value}${accel && accel.value ? ` อัตราเร่ง 0-100 กม./ชม. ${accel.value}` : ''} (ตามข้อมูลผู้ผลิต บางรุ่นย่อยอาจต่างกัน)`,
    })
  }
  const near = nearestModels(m, models, 1)[0]
  if (near) {
    const diff = near.priceFrom - m.priceFrom
    items.push({
      question: `BYD ${m.name} กับ ${near.name} ต่างกันยังไง`,
      answer:
        `${m.name} เป็น${sp(BODY_TYPES[m.bodyType] || m.bodyType)} ${pt(m)} ราคาเริ่ม ${baht(m.priceFrom)} บาท ${rangeTxt(m)} ` +
        `ส่วน ${near.name} เป็น${sp(BODY_TYPES[near.bodyType] || near.bodyType)} ${pt(near)} ราคาเริ่ม ${baht(near.priceFrom)} บาท ${rangeTxt(near)} ` +
        `${diff === 0 ? 'ราคาเริ่มต้นเท่ากัน' : `${near.name} ${diff > 0 ? 'แพงกว่า' : 'ถูกกว่า'} ${baht(Math.abs(diff))} บาท`} ` +
        `เทียบสเปคแบบละเอียดได้ที่หน้าเปรียบเทียบรุ่น หรือนัดลองขับทั้งสองรุ่นในวันเดียวกัน`,
    })
  }
  return items
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
    answer: `ทดลองขับฟรีได้ที่ Hi-Class ทั้ง ${bn} สาขา${branchNames ? ` (${branchNames})` : ''} กรอกชื่อกับเบอร์ในหน้านี้ ทีมขายโทรยืนยันคิวภายใน 25 นาทีในเวลาทำการ ไม่มีข้อผูกมัด`,
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
