/** ฝั่งเซิร์ฟเวอร์เท่านั้น — อ่านคำตอบแบบสำรวจ Outing 2570 (public.outing_survey) ด้วย service key
 *  repo เป็น public จึงเก็บแค่ SHA-256 ของคีย์ · เปลี่ยนคีย์: ใส่ hash ใหม่ตรงนี้ หรือตั้ง env OUTING_EXPORT_KEY_SHA256 */
import { createHash, timingSafeEqual } from 'crypto'

const KEY_SHA256 = process.env.OUTING_EXPORT_KEY_SHA256 || '15bc975143537cb0e065dc6df26fedef0dc3acd5589a9e4d6768b6746574209a'

export type OutingRow = {
  id: number
  created_at: string
  full_name: string
  department: string
  position: string
  branch: string
  attend: boolean
  religion: string | null
  food_limit: string | null
  transport: string | null
  alcohol: string | null
  alcohol_type: string | null
  alcohol_types: string[] | null
  beer_amount: string | null
  liquor_amount: string | null
  mixers: string[] | null
  ack_no_outsider: boolean | null
  ack_cost: boolean | null
  ack_absent: boolean | null
  absent_reason: string | null
}

export const OUTING_COLS: [string, (r: OutingRow) => string][] = [
  ['วันที่ส่ง', (r) => new Date(r.created_at).toLocaleString('en-GB', { timeZone: 'Asia/Bangkok', hour12: false }).replace(',', '')],
  ['ชื่อ-นามสกุล', (r) => r.full_name],
  ['แผนก', (r) => r.department],
  ['ตำแหน่ง', (r) => r.position],
  ['สาขา', (r) => r.branch],
  ['เข้าร่วม', (r) => (r.attend ? 'เข้าร่วม' : 'ไม่เข้าร่วม')],
  ['ศาสนา', (r) => r.religion || ''],
  ['แพ้อาหาร / ข้อจำกัดด้านอาหาร', (r) => r.food_limit || ''],
  ['เดินทางโดย', (r) => r.transport || ''],
  ['แอลกอฮอล์', (r) => r.alcohol || ''],
  ['ประเภทแอลกอฮอล์', (r) => r.alcohol_type || ''],
  ['เบียร์ที่ทานได้', (r) => r.beer_amount || ''],
  ['เหล้าที่ทานได้', (r) => r.liquor_amount || ''],
  ['ทานเหล้ากับ', (r) => (r.mixers || []).join(', ')],
  ['รับทราบห้ามนำบุคคลภายนอก', (r) => (r.ack_no_outsider ? 'รับทราบ' : '')],
  ['ยินยอมค่าใช้จ่ายกรณีไม่ไป', (r) => (r.ack_cost ? 'รับทราบและยินยอม' : '')],
  ['ยินยอมเงื่อนไขไม่เข้าร่วม', (r) => (r.ack_absent ? 'รับทราบและยินยอม' : '')],
  ['เหตุผลที่ไม่เข้าร่วม', (r) => r.absent_reason || ''],
]

const cell = (s: string) => {
  const v = s.replace(/^[=+@-]/, ' $&') // กันข้อความถูกตีความเป็นสูตร
  return /[",\n\r]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v
}

export function outingKeyOk(key: string) {
  const a = Buffer.from(createHash('sha256').update(key).digest('hex'))
  const b = Buffer.from(KEY_SHA256)
  return a.length === b.length && timingSafeEqual(a, b)
}

export async function fetchOutingRows(): Promise<OutingRow[] | null> {
  const url = process.env.CRM_SUPABASE_URL?.replace(/\/$/, '')
  const sk = process.env.CRM_SUPABASE_SERVICE_KEY
  if (!url || !sk) return null
  const res = await fetch(
    `${url}/rest/v1/outing_survey?select=id,created_at,full_name,department,position,branch,attend,religion,food_limit,transport,alcohol,alcohol_type,alcohol_types,beer_amount,liquor_amount,mixers,ack_no_outsider,ack_cost,ack_absent,absent_reason&order=created_at.asc&limit=5000`,
    { headers: { apikey: sk, Authorization: `Bearer ${sk}` }, cache: 'no-store' },
  )
  if (!res.ok) return null
  return (await res.json()) as OutingRow[]
}

/** คนเดียวส่งหลายรอบ (ชื่อเดียวกัน) นับคำตอบล่าสุด */
export function latestPerPerson(rows: OutingRow[]): OutingRow[] {
  const m = new Map<string, OutingRow>()
  rows.forEach((r) => m.set(r.full_name.replace(/\s+/g, ' ').trim().toLowerCase(), r))
  return [...m.values()]
}

export function outingCsv(rows: OutingRow[]) {
  return [OUTING_COLS.map(([h]) => cell(h)).join(','), ...rows.map((r) => OUTING_COLS.map(([, f]) => cell(f(r))).join(','))].join('\r\n')
}
