/**
 * แปลงที่อยู่และเวลาทำการภาษาไทยให้อยู่ในรูปแบบที่ Google อ่านได้ (zip #25)
 * แก้คำเตือน Non-critical issues ของ Local businesses ใน Rich Results Test
 * ทั้งหมดแยกออกมาเป็นฟังก์ชันล้วน ไม่แตะข้อมูลในหลังบ้าน ทีมยังกรอกที่อยู่แบบเดิมได้ตามปกติ
 */

/** ที่อยู่ไทย เช่น "396/4-6 ถ.กาญจนาภิเษก แขวงบางแคเหนือ เขตบางแค กรุงเทพมหานคร 10160" */
export function thaiAddressLd(address?: string | null) {
  if (!address) return null
  const clean = address.replace(/\s+/g, ' ').trim()

  const postalCode = clean.match(/(\d{5})\s*$/)?.[1]
  // เขต/อำเภอ — Google ใช้เป็น addressLocality
  const locality = clean.match(/(เขต[^\s]+|อำเภอ[^\s]+|อ\.[^\s]+)/)?.[1]
  // จังหวัด — คำก่อนรหัสไปรษณีย์
  const region =
    clean.match(/(กรุงเทพมหานคร|กรุงเทพฯ)/)?.[1] ||
    clean.match(/จังหวัด([^\s]+)/)?.[1] ||
    clean.match(/([^\s]+)\s+\d{5}\s*$/)?.[1]

  return {
    '@type': 'PostalAddress' as const,
    streetAddress: clean,
    ...(locality ? { addressLocality: locality } : {}),
    ...(region ? { addressRegion: region } : {}),
    ...(postalCode ? { postalCode } : {}),
    addressCountry: 'TH',
  }
}

const DAYS: Record<string, string> = {
  'จ': 'Monday',
  'อ': 'Tuesday',
  'พ': 'Wednesday',
  'พฤ': 'Thursday',
  'ศ': 'Friday',
  'ส': 'Saturday',
  'อา': 'Sunday',
}
const ORDER = ['จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส', 'อา']

/** เวลาทำการไทย เช่น "จ.–อา. 08:00–18:00" → รูปแบบ OpeningHoursSpecification */
export function openingHoursLd(openHours?: string | null) {
  if (!openHours) return null
  const time = openHours.match(/(\d{1,2}[:.]\d{2})\s*[–\-−ถึง\s]+\s*(\d{1,2}[:.]\d{2})/)
  if (!time) return null
  const opens = time[1].replace('.', ':')
  const closes = time[2].replace('.', ':')

  const dayPart = openHours.slice(0, time.index ?? 0)
  const range = dayPart.match(/(อา|พฤ|[จอพศส])\.?\s*[–\-−ถึง]+\s*(อา|พฤ|[จอพศส])\.?/)

  let days: string[]
  if (/ทุกวัน/.test(dayPart) || !range) {
    days = ORDER.map((d) => DAYS[d])
  } else {
    const from = ORDER.indexOf(range[1])
    const to = ORDER.indexOf(range[2])
    if (from < 0 || to < 0) return null
    days = (from <= to ? ORDER.slice(from, to + 1) : [...ORDER.slice(from), ...ORDER.slice(0, to + 1)]).map((d) => DAYS[d])
  }

  return { '@type': 'OpeningHoursSpecification' as const, dayOfWeek: days, opens, closes }
}

/** ช่วงราคาโดยประมาณของรถในโชว์รูม — Google ขอฟิลด์นี้กับธุรกิจที่มีหน้าร้าน */
export function priceRangeOf(prices: number[]) {
  const valid = prices.filter((p) => p > 0)
  if (valid.length === 0) return '฿฿฿'
  const fmt = (n: number) => `฿${n.toLocaleString('en-US')}`
  return `${fmt(Math.min(...valid))} - ${fmt(Math.max(...valid))}`
}
