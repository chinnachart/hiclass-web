export const baht = (v: number | null | undefined) =>
  typeof v === 'number' ? v.toLocaleString('th-TH', { maximumFractionDigits: 0 }) : '—'

export const telHref = (phone?: string | null) =>
  phone ? `tel:${phone.replace(/[^0-9+]/g, '')}` : '#'

export const BODY_TYPES: Record<string, string> = {
  suv: 'SUV',
  sedan: 'ซีดาน',
  hatch: 'แฮทช์แบ็ก',
  mpv: 'MPV / 7 ที่นั่ง',
}
