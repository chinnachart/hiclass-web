import { NextResponse } from 'next/server'
import { isBotSubmit } from '@/lib/antibot'
import { AI_LEVELS, KNOWN_AIS, TOPICS, pickList } from '@/lib/aiCourse'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const hits = new Map<string, number[]>()
const WINDOW_MS = 10 * 60 * 1000
const MAX_PER_WINDOW = 10 // พนักงานหลายคนอาจส่งจาก Wi-Fi สาขาเดียวกัน

function rateLimited(ip: string) {
  const now = Date.now()
  const list = (hits.get(ip) || []).filter((t) => now - t < WINDOW_MS)
  list.push(now)
  hits.set(ip, list)
  return list.length > MAX_PER_WINDOW
}

const str = (v: unknown, max: number) => String(v ?? '').trim().slice(0, max)
const strList = (v: unknown, maxItems = 10, maxLen = 40) =>
  Array.isArray(v) ? [...new Set(v.map((x) => str(x, maxLen)).filter(Boolean))].slice(0, maxItems) : []

/** แบบสำรวจคอร์ส AI พนักงาน (/ai-course) → public.ai_course_survey */
export async function POST(req: Request) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || 'unknown'
  if (rateLimited(ip)) return NextResponse.json({ message: 'ส่งถี่เกินไป รบกวนรอสักครู่แล้วลองใหม่' }, { status: 429 })

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ message: 'ข้อมูลไม่ถูกต้อง' }, { status: 400 })
  }
  if (isBotSubmit(body)) return NextResponse.json({ ok: true })

  const row = {
    full_name: str(body.fullName, 120),
    nickname: str(body.nickname, 60) || null,
    home_branch: str(body.homeBranch, 60),
    position: str(body.position, 80),
    phone: str(body.phone, 30),
    ai_level: str(body.aiLevel, 60),
    known_ais: pickList(body.knownAis, KNOWN_AIS),
    known_ais_other: str(body.knownAisOther, 200) || null,
    topics: pickList(body.topics, TOPICS),
    topics_free: str(body.topicsFree, 2000) || null,
    use_cases: str(body.useCases, 2000) || null,
    pref_branches: strList(body.prefBranches),
    pref_time: str(body.prefTime, 500) || null,
    note: str(body.note, 1000) || null,
    ip,
  }

  if (row.full_name.length < 2) return NextResponse.json({ message: 'กรุณากรอกชื่อ-นามสกุล' }, { status: 400 })
  if (!row.home_branch) return NextResponse.json({ message: 'กรุณาเลือกสาขาที่สังกัด' }, { status: 400 })
  if (!row.position) return NextResponse.json({ message: 'กรุณากรอกตำแหน่ง' }, { status: 400 })
  if (row.phone.replace(/\D/g, '').length < 9) return NextResponse.json({ message: 'กรุณากรอกเบอร์โทรให้ถูกต้อง' }, { status: 400 })
  if (!(AI_LEVELS as readonly string[]).includes(row.ai_level)) return NextResponse.json({ message: 'กรุณาเลือกระดับความรู้ AI' }, { status: 400 })
  if (!row.topics.length && !row.topics_free) return NextResponse.json({ message: 'กรุณาบอกหัวข้อที่อยากเรียนอย่างน้อย 1 อย่าง' }, { status: 400 })
  if (!row.pref_branches.length) return NextResponse.json({ message: 'กรุณาเลือกสาขาที่สะดวกเรียน' }, { status: 400 })

  const url = process.env.CRM_SUPABASE_URL?.replace(/\/$/, '')
  const key = process.env.CRM_SUPABASE_SERVICE_KEY
  if (!url || !key) return NextResponse.json({ message: 'ระบบขัดข้องชั่วคราว' }, { status: 502 })

  const res = await fetch(`${url}/rest/v1/ai_course_survey`, {
    method: 'POST',
    headers: { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
    body: JSON.stringify(row),
    cache: 'no-store',
  })
  if (!res.ok) return NextResponse.json({ message: 'ระบบขัดข้องชั่วคราว รบกวนลองใหม่' }, { status: 502 })
  return NextResponse.json({ ok: true })
}
