/** คำนวณค่างวดแบบดอกเบี้ยคงที่ (flat rate) — วิธีที่ไฟแนนซ์รถในไทยใช้ */
export function monthlyPayment(price: number, downPercent: number, term: number, ratePercent: number) {
  const down = Math.round((price * downPercent) / 100)
  const financed = price - down
  if (financed <= 0 || term <= 0) return { down, financed, perMonth: 0 }
  const perMonth = Math.round((financed + financed * (ratePercent / 100) * (term / 12)) / term)
  return { down, financed, perMonth }
}

/** จำนวนงวดที่เว็บแสดง — ต้องตรงกับคอลัมน์ r48/r60/r72/r84 ในหลังบ้าน */
export const TERMS = [48, 60, 72, 84] as const
type Term = (typeof TERMS)[number]

/** เงินดาวน์ที่ใช้เมื่อหลังบ้านยังไม่ได้กรอกตารางดอกเบี้ย */
const FALLBACK_DOWNS = [30, 25, 20, 15, 10]

export type FinanceRateRow = {
  down?: number | null
  r48?: number | null
  r60?: number | null
  r72?: number | null
  r84?: number | null
}

type FinanceSettings = {
  financeRate?: number | null
  financeRates?: FinanceRateRow[] | null
  defaultDownPercent?: number | null
  defaultTerm?: number | null
}

const isNum = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v)
/** numeric จาก Postgres อาจมาเป็นสตริง — แปลงก่อนใช้ */
const toNum = (v: unknown): number | null => {
  if (v === null || v === undefined || v === '') return null
  const n = Number(v)
  return Number.isFinite(n) ? n : null
}

/**
 * ตารางดอกเบี้ยตามเงินดาวน์ × จำนวนงวด (ใช้กับทุกรุ่น) — ตรงกับชีทไฟแนนซ์ของฝ่ายขาย
 * - downs เรียงมากไปน้อย (30% อยู่บนสุด) ตามแถวที่กรอกในหลังบ้าน
 * - ช่องไหนเว้นว่าง → ใช้ "อัตราดอกเบี้ยสำรอง" (financeRate)
 * - ไม่มีตารางเลย → ดาวน์ 10–30% ดอกเท่ากันทุกช่องตาม financeRate
 */
export function financeTable(s: FinanceSettings) {
  const fallback = toNum(s.financeRate) ?? 0
  const seen = new Set<number>()
  const rows = (s.financeRates || [])
    .map((r) => ({ down: toNum(r.down), r48: toNum(r.r48), r60: toNum(r.r60), r72: toNum(r.r72), r84: toNum(r.r84) }))
    .filter((r) => isNum(r.down) && r.down >= 0 && r.down < 100)
    .sort((a, b) => (b.down as number) - (a.down as number))
    .filter((r) => (seen.has(r.down as number) ? false : (seen.add(r.down as number), true)))
  const downs = rows.length ? rows.map((r) => r.down as number) : FALLBACK_DOWNS

  const nearestDown = (d: number) =>
    // ไม่ตรงแถวไหน → ใช้แถวที่ใกล้สุด (เท่ากัน → ดาวน์น้อยกว่า ดอกสูงกว่า ประมาณการแบบไม่เกินจริง)
    downs.reduce((best, x) => {
      const dx = Math.abs(x - d)
      const db = Math.abs(best - d)
      return dx < db || (dx === db && x < best) ? x : best
    }, downs[0])

  const rate = (down: number, term: number) => {
    const row = rows.find((r) => r.down === nearestDown(down))
    const v = row ? row[`r${term as Term}` as keyof FinanceRateRow] : null
    return isNum(v) ? v : fallback
  }

  const all = downs.flatMap((d) => TERMS.map((t) => rate(d, t)))
  const minRate = Math.min(...all)
  const maxRate = Math.max(...all)

  const defaultDown = nearestDown(toNum(s.defaultDownPercent) ?? 20)
  const dt = toNum(s.defaultTerm)
  const defaultTerm = dt !== null && (TERMS as readonly number[]).includes(dt) ? dt : 60

  /** ค่างวด + ดอกเบี้ยที่ใช้ของช่องนั้น */
  const pay = (price: number, down: number, term: number) => {
    const d = nearestDown(down)
    const r = rate(d, term)
    return { ...monthlyPayment(price, d, term, r), rate: r, downPercent: d }
  }

  return { downs, rate, pay, minRate, maxRate, defaultDown, defaultTerm }
}

/** ข้อความช่วงดอกเบี้ย เช่น "1.98–4.79%" หรือ "2.89%" */
export function rateRangeText(t: { minRate: number; maxRate: number }) {
  return t.minRate === t.maxRate ? `${t.minRate}%` : `${t.minRate}–${t.maxRate}%`
}
