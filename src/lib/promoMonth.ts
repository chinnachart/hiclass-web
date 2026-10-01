// zip #40 — หน้าโปรรายเดือน /promotion/YYYY-MM
// คำค้น "โปร byd เดือนตุลาคม" / "โปรโมชั่น byd ตุลาคม 2569" คู่แข่ง (Metromobile) ทำหน้าลงวันที่แบบนี้แล้วชนะอยู่คนเดียว

export const TH_MONTHS = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม']

export type PromoMonth = { key: string; year: number; month: number; label: string; labelBE: string; startIso: string; endIso: string }

/** เดือนแรกที่มีหน้า (เว็บใหม่ขึ้นโดเมนจริง ก.ย. 2569) */
export const FIRST_MONTH = '2026-09'

export function parseMonth(key: string): PromoMonth | null {
  const m = /^(\d{4})-(\d{2})$/.exec(key)
  if (!m) return null
  const year = Number(m[1])
  const month = Number(m[2])
  if (month < 1 || month > 12) return null
  // เวลาไทย (+07): ต้นเดือน 00:00 → สิ้นเดือน 23:59:59
  const startIso = new Date(Date.UTC(year, month - 1, 1, -7, 0, 0)).toISOString()
  const endIso = new Date(Date.UTC(year, month, 1, -7, 0, 0) - 1000).toISOString()
  return { key, year, month, label: `${TH_MONTHS[month - 1]} ${year}`, labelBE: `${TH_MONTHS[month - 1]} ${year + 543}`, startIso, endIso }
}

export function monthKey(d = new Date()): string {
  // เวลาไทย
  const t = new Date(d.getTime() + 7 * 60 * 60 * 1000)
  return `${t.getUTCFullYear()}-${String(t.getUTCMonth() + 1).padStart(2, '0')}`
}

export function shiftMonth(key: string, delta: number): string {
  const [y, m] = key.split('-').map(Number)
  const d = new Date(Date.UTC(y, m - 1 + delta, 1))
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`
}

/** เดือนที่เปิดให้ดู: ตั้งแต่ FIRST_MONTH ถึงเดือนหน้า (กัน URL มั่ว) */
export function isMonthAllowed(key: string, now = new Date()): boolean {
  return key >= FIRST_MONTH && key <= shiftMonth(monthKey(now), 1)
}

/** รายการเดือนสำหรับ sitemap / ลิงก์ย้อนหลัง: เดือนนี้ + ย้อนหลังถึง FIRST_MONTH */
export function listMonths(now = new Date()): string[] {
  const out: string[] = []
  let k = monthKey(now)
  while (k >= FIRST_MONTH && out.length < 24) {
    out.push(k)
    k = shiftMonth(k, -1)
  }
  return out
}
