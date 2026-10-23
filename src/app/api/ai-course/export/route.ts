import { createHash, timingSafeEqual } from 'crypto'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/** CSV คำตอบแบบสำรวจคอร์ส AI → ให้ Google Sheet ของเจ้าของดึงด้วย =IMPORTDATA("…/api/ai-course/export?key=…")
 *  repo เป็น public จึงเก็บแค่ SHA-256 ของคีย์ · คีย์จริงอยู่ในสูตรของชีตเท่านั้น
 *  เปลี่ยนคีย์: สุ่มคีย์ใหม่ → ใส่ hash ใหม่ตรงนี้ หรือตั้ง env AI_COURSE_EXPORT_KEY_SHA256 */
const KEY_SHA256 =
  process.env.AI_COURSE_EXPORT_KEY_SHA256 || '3c3d436943760db890eefa040f285dd1022b864935eb9b777c7d875d8c5691c6'

type Row = {
  created_at: string
  full_name: string
  nickname: string | null
  home_branch: string
  position: string
  phone: string
  ai_level: string
  known_ais: string[] | null
  known_ais_other: string | null
  topics: string[] | null
  topics_free: string | null
  use_cases: string | null
  pref_branches: string[] | null
  pref_time: string | null
  note: string | null
}

const COLS: [string, (r: Row) => string][] = [
  ['วันที่ส่ง', (r) => new Date(r.created_at).toLocaleString('en-GB', { timeZone: 'Asia/Bangkok', hour12: false }).replace(',', '')],
  ['ชื่อ-นามสกุล', (r) => r.full_name],
  ['ชื่อเล่น', (r) => r.nickname || ''],
  ['สาขาที่สังกัด', (r) => r.home_branch],
  ['ตำแหน่ง', (r) => r.position],
  ['เบอร์โทร', (r) => fmtPhone(r.phone)],
  ['ระดับความรู้ AI', (r) => r.ai_level],
  ['AI ที่รู้จัก', (r) => [...(r.known_ais || []), ...(r.known_ais_other ? [r.known_ais_other] : [])].join(', ')],
  ['หัวข้อที่ติ๊ก', (r) => (r.topics || []).join(', ')],
  ['อยากเรียน (พิมพ์เอง)', (r) => r.topics_free || ''],
  ['อยากเอาไปต่อยอด', (r) => r.use_cases || ''],
  ['สาขาที่สะดวกเรียน', (r) => (r.pref_branches || []).join(', ')],
  ['วัน/เวลาที่สะดวก', (r) => r.pref_time || ''],
  ['หมายเหตุ', (r) => r.note || ''],
]

/** 0812345678 → 081-234-5678 (มีขีด = Sheet เก็บเป็นข้อความ เลข 0 ข้างหน้าไม่หาย) */
const fmtPhone = (p: string) => {
  const d = p.replace(/\D/g, '')
  return d.length === 10 ? `${d.slice(0, 3)}-${d.slice(3, 6)}-${d.slice(6)}` : d.length === 9 ? `${d.slice(0, 2)}-${d.slice(2, 5)}-${d.slice(5)}` : p
}

const cell = (s: string) => {
  const v = s.replace(/^[=+@]/, ' $&') // กันข้อความถูกตีความเป็นสูตร
  return /[",\n\r]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v
}

function keyOk(key: string) {
  const a = Buffer.from(createHash('sha256').update(key).digest('hex'))
  const b = Buffer.from(KEY_SHA256)
  return a.length === b.length && timingSafeEqual(a, b)
}

export async function GET(req: Request) {
  const key = new URL(req.url).searchParams.get('key') || ''
  if (!keyOk(key)) return new Response('not found', { status: 404 })

  const url = process.env.CRM_SUPABASE_URL?.replace(/\/$/, '')
  const sk = process.env.CRM_SUPABASE_SERVICE_KEY
  if (!url || !sk) return new Response('unavailable', { status: 502 })

  const res = await fetch(
    `${url}/rest/v1/ai_course_survey?select=created_at,full_name,nickname,home_branch,position,phone,ai_level,known_ais,known_ais_other,topics,topics_free,use_cases,pref_branches,pref_time,note&order=created_at.asc&limit=5000`,
    { headers: { apikey: sk, Authorization: `Bearer ${sk}` }, cache: 'no-store' },
  )
  if (!res.ok) return new Response('unavailable', { status: 502 })
  const rows = (await res.json()) as Row[]

  const lines = [COLS.map(([h]) => cell(h)).join(','), ...rows.map((r) => COLS.map(([, f]) => cell(f(r))).join(','))]
  return new Response(lines.join('\r\n'), {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Robots-Tag': 'noindex, nofollow',
    },
  })
}
