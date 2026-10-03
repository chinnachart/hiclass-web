export const baht = (v: number | null | undefined) =>
  typeof v === 'number' ? v.toLocaleString('th-TH', { maximumFractionDigits: 0 }) : '—'

/** เบอร์ไทยให้รูปแบบเดียวกันทั้งเว็บ: 0XX-XXX-XXXX (มือถือ 10 หลัก) / 02-XXX-XXXX (9 หลัก) */
export const fmtPhone = (phone?: string | null) => {
  if (!phone) return ''
  const d = phone.replace(/\D/g, '')
  if (d.length === 10) return `${d.slice(0, 3)}-${d.slice(3, 6)}-${d.slice(6)}`
  if (d.length === 9 && d.startsWith('02')) return `02-${d.slice(2, 5)}-${d.slice(5)}`
  return phone.trim()
}

export const telHref = (phone?: string | null) =>
  phone ? `tel:${phone.replace(/[^0-9+]/g, '')}` : '#'

export const BODY_TYPES: Record<string, string> = {
  suv: 'SUV',
  sedan: 'ซีดาน',
  hatch: 'แฮทช์แบ็ก',
  mpv: 'MPV / 7 ที่นั่ง',
}

/**
 * แทนที่ตัวยึด {สาขา} ในข้อความที่ทีมการตลาดพิมพ์จากหลังบ้าน ด้วยจำนวนสาขาที่เปิดอยู่จริง
 * ทำให้ประโยคอย่าง "รับรถได้ที่ {สาขา} สาขา" ไม่ล้าสมัยเมื่อเปิดสาขาเพิ่ม
 */
export const fillTokens = (text: string, branchCount: number) =>
  text.replaceAll('{สาขา}', String(branchCount))

/** ป้ายระยะทาง: รถไฟฟ้าล้วน = ต่อการชาร์จ · ไฮบริด DM-i = ระยะทางรวม (ไฟฟ้า+น้ำมัน) */
export const rangeLabel = (m: { powertrain?: 'ev' | 'phev' | null }) =>
  m.powertrain === 'phev' ? 'ระยะทางรวม' : 'ระยะทางต่อการชาร์จ'
