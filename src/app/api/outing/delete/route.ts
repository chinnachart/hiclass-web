import { NextResponse } from 'next/server'
import { outingKeyOk } from '@/lib/outingData'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/** ลบคำตอบแบบสำรวจ Outing 2570 ทีละรายการ (เช่น คำตอบทดสอบ) — ใช้จากหน้าดูผล ต้องมีคีย์เดียวกับหน้าดูผล | คีย์ผิด = 404 */
export async function POST(req: Request) {
  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ message: 'ข้อมูลไม่ถูกต้อง' }, { status: 400 })
  }
  if (!outingKeyOk(String(body.key || ''))) return new Response('not found', { status: 404 })
  const id = Number(body.id)
  if (!Number.isInteger(id) || id <= 0) return NextResponse.json({ message: 'ไม่พบรายการ' }, { status: 400 })

  const url = process.env.CRM_SUPABASE_URL?.replace(/\/$/, '')
  const sk = process.env.CRM_SUPABASE_SERVICE_KEY
  if (!url || !sk) return NextResponse.json({ message: 'ระบบขัดข้องชั่วคราว' }, { status: 502 })
  const res = await fetch(`${url}/rest/v1/outing_survey?id=eq.${id}`, {
    method: 'DELETE',
    headers: { apikey: sk, Authorization: `Bearer ${sk}`, Prefer: 'return=representation' },
    cache: 'no-store',
  })
  if (!res.ok) return NextResponse.json({ message: 'ลบไม่สำเร็จ รบกวนลองใหม่' }, { status: 502 })
  const gone = (await res.json().catch(() => [])) as unknown[]
  if (!gone.length) return NextResponse.json({ message: 'รายการนี้ถูกลบไปแล้ว' }, { status: 404 })
  return NextResponse.json({ ok: true })
}
