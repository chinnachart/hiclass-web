import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// กันสแปมแบบง่ายในหน่วยความจำ (แบบเดียวกับฟอร์มอื่น) — รีวิวไม่ต้องส่งถี่ จำกัด 3 ครั้ง / 30 นาที / IP
const hits = new Map<string, number[]>()
const WINDOW_MS = 30 * 60 * 1000
const MAX_PER_WINDOW = 3

function rateLimited(ip: string) {
  const now = Date.now()
  const list = (hits.get(ip) || []).filter((t) => now - t < WINDOW_MS)
  list.push(now)
  hits.set(ip, list)
  return list.length > MAX_PER_WINDOW
}

const bad = (message: string, status = 400) => NextResponse.json({ message }, { status })

/** ลูกค้าเขียนรีวิว (/reviews) → cms.reviews สถานะ "รออนุมัติ" — ยังไม่ขึ้นเว็บจนแอดมินอนุมัติ */
export async function POST(req: Request) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || 'unknown'
  if (rateLimited(ip)) return bad('ส่งรีวิวถี่เกินไป รบกวนรอสักครู่แล้วลองใหม่', 429)

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return bad('ข้อมูลไม่ถูกต้อง')
  }
  const s = (k: string, max = 120) => String(body[k] ?? '').replace(/\s+/g, ' ').trim().slice(0, max)

  // ช่องล่อบอท — คนจริงมองไม่เห็นช่องนี้ ถ้ามีค่า = บอท → ตอบว่าสำเร็จแต่ไม่บันทึก
  if (s('website')) return NextResponse.json({ ok: true })

  const name = s('name', 60)
  const model = s('model', 40)
  const branch = s('branch', 40)
  const message = String(body.message ?? '').trim().slice(0, 1000)

  if (body.consent !== true) return bad('กรุณายินยอมให้แสดงชื่อและข้อความรีวิวบนเว็บไซต์')
  if (name.length < 2) return bad('กรุณากรอกชื่อ')
  if (message.length < 10) return bad('กรุณาเขียนรีวิวอย่างน้อย 10 ตัวอักษร')
  if (/https?:\/\/|www\./i.test(message)) return bad('ไม่รับรีวิวที่มีลิงก์เว็บไซต์')

  try {
    const payload = await getPayload({ config })
    await payload.create({
      collection: 'reviews',
      data: { status: 'pending', name, model: model || undefined, branch: branch || undefined, message },
      overrideAccess: true,
    })
  } catch (e) {
    console.error('[reviews] create failed', e)
    return bad('บันทึกไม่สำเร็จ รบกวนลองใหม่อีกครั้ง', 500)
  }
  return NextResponse.json({ ok: true })
}
