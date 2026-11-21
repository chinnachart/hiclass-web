import { NextResponse } from 'next/server'
import { isBotSubmit } from '@/lib/antibot'
import { ALCOHOL, ALCOHOL_TYPES, TRANSPORTS } from '@/lib/outing'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const hits = new Map<string, number[]>()
const WINDOW_MS = 10 * 60 * 1000
const MAX_PER_WINDOW = 30 // พนักงานหลายคนส่งจาก Wi-Fi สาขาเดียวกัน

function rateLimited(ip: string) {
  const now = Date.now()
  const list = (hits.get(ip) || []).filter((t) => now - t < WINDOW_MS)
  list.push(now)
  hits.set(ip, list)
  return list.length > MAX_PER_WINDOW
}

const str = (v: unknown, max: number) => String(v ?? '').trim().slice(0, max)
const bad = (message: string) => NextResponse.json({ message }, { status: 400 })
const oneOf = (v: string, list: readonly string[]) => list.includes(v)

/** แบบสำรวจเข้าร่วม Outing ปีใหม่ 2570 (/outing-2570) → public.outing_survey */
export async function POST(req: Request) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || 'unknown'
  if (rateLimited(ip)) return NextResponse.json({ message: 'ส่งถี่เกินไป รบกวนรอสักครู่แล้วลองใหม่' }, { status: 429 })

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return bad('ข้อมูลไม่ถูกต้อง')
  }
  if (isBotSubmit(body)) return NextResponse.json({ ok: true })

  const fullName = str(body.fullName, 120)
  const department = str(body.department, 80)
  const position = str(body.position, 80)
  const branch = str(body.branch, 80)
  if (fullName.length < 2) return bad('กรุณากรอกชื่อ-นามสกุล')
  if (!department) return bad('กรุณาเลือกแผนก')
  if (!position) return bad('กรุณากรอกตำแหน่ง')
  if (!branch) return bad('กรุณาเลือกสาขา')
  if (body.attend !== true && body.attend !== false) return bad('กรุณาเลือกว่าจะเข้าร่วมกิจกรรมหรือไม่')

  let row: Record<string, unknown> = { full_name: fullName, department, position, branch, attend: body.attend, ip }
  if (body.attend === true) {
    const religion = str(body.religion, 60)
    const foodLimit = str(body.foodLimit, 500)
    const transport = str(body.transport, 30)
    const alcohol = str(body.alcohol, 20)
    const alcoholType = str(body.alcoholType, 20)
    if (!religion) return bad('กรุณาเลือกศาสนา')
    if (!foodLimit) return bad('กรุณาตอบเรื่องแพ้อาหารหรือข้อจำกัดด้านอาหาร (ไม่มีให้พิมพ์ว่า ไม่มี)')
    if (!oneOf(transport, TRANSPORTS)) return bad('กรุณาเลือกวิธีเดินทาง')
    if (!oneOf(alcohol, ALCOHOL)) return bad('กรุณาเลือกว่าดื่มเครื่องดื่มแอลกอฮอล์หรือไม่')
    if (alcohol === 'ดื่ม' && !oneOf(alcoholType, ALCOHOL_TYPES)) return bad('กรุณาเลือกประเภทของแอลกอฮอล์')
    if (body.ackNoOutsider !== true) return bad('กรุณากดรับทราบเรื่องไม่นำบุคคลภายนอกร่วมกิจกรรม')
    if (body.ackCost !== true) return bad('กรุณากดรับทราบและยินยอมข้อตกลง')
    row = { ...row, religion, food_limit: foodLimit, transport, alcohol, alcohol_type: alcohol === 'ดื่ม' ? alcoholType : null, ack_no_outsider: true, ack_cost: true }
  } else {
    const reason = str(body.absentReason, 1000)
    if (body.ackAbsent !== true) return bad('กรุณากดรับทราบและยินยอมเงื่อนไขของบริษัท')
    if (!reason) return bad('กรุณาระบุเหตุผลที่ไม่สามารถร่วมกิจกรรมได้')
    row = { ...row, ack_absent: true, absent_reason: reason }
  }

  const url = process.env.CRM_SUPABASE_URL?.replace(/\/$/, '')
  const key = process.env.CRM_SUPABASE_SERVICE_KEY
  if (!url || !key) return NextResponse.json({ message: 'ระบบขัดข้องชั่วคราว' }, { status: 502 })
  const res = await fetch(`${url}/rest/v1/outing_survey`, {
    method: 'POST',
    headers: { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
    body: JSON.stringify(row),
    cache: 'no-store',
  })
  if (!res.ok) return NextResponse.json({ message: 'ระบบขัดข้องชั่วคราว รบกวนลองใหม่' }, { status: 502 })
  return NextResponse.json({ ok: true })
}
