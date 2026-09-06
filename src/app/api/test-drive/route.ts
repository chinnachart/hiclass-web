import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { createLead, isAppointmentSlot } from '@/lib/crm'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// กันสแปมแบบง่ายในหน่วยความจำ — ถ้าเจอสแปมจริงจังค่อยเพิ่ม CAPTCHA
const hits = new Map<string, number[]>()
const WINDOW_MS = 10 * 60 * 1000
const MAX_PER_WINDOW = 5

function rateLimited(ip: string) {
  const now = Date.now()
  const list = (hits.get(ip) || []).filter((t) => now - t < WINDOW_MS)
  list.push(now)
  hits.set(ip, list)
  return list.length > MAX_PER_WINDOW
}

export async function POST(req: Request) {
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'unknown'

  if (rateLimited(ip)) {
    return NextResponse.json(
      { message: 'ส่งคำขอถี่เกินไป รบกวนรอสักครู่แล้วลองใหม่' },
      { status: 429 },
    )
  }

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ message: 'ข้อมูลไม่ถูกต้อง' }, { status: 400 })
  }

  const customerName = String(body.customerName || '').trim()
  const phone = String(body.phone || '').trim()
  const branch = String(body.branch || '').trim()
  const model = String(body.model || '').trim()
  const appointmentDate = String(body.appointmentDate || '').trim().slice(0, 10) // YYYY-MM-DD
  const appointmentSlotRaw = String(body.appointmentSlot || '').trim()
  const appointmentSlot = isAppointmentSlot(appointmentSlotRaw) ? appointmentSlotRaw : ''
  const offerNote = String(body.offerNote || '').trim().slice(0, 300)

  if (customerName.length < 2 || customerName.length > 120) {
    return NextResponse.json({ message: 'กรุณากรอกชื่อให้ถูกต้อง' }, { status: 400 })
  }
  if (phone.replace(/\D/g, '').length < 9) {
    return NextResponse.json({ message: 'กรุณากรอกเบอร์โทรให้ถูกต้อง' }, { status: 400 })
  }
  if (!branch) {
    return NextResponse.json({ message: 'กรุณาเลือกสาขา' }, { status: 400 })
  }

  const payload = await getPayload({ config })
  const settings = await payload.findGlobal({ slug: 'site-settings', depth: 0 })

  const result = await createLead({
    customerName,
    phone,
    model,
    branch,
    appointmentDate,
    appointmentSlot,
    offerNote,
    // lead_source ตายตัว 'Website' ใน lib/crm.ts (ค่า leadSourceLabel ในหลังบ้านไม่ใช้แล้ว — Cinco นับกองกลางเฉพาะ 'Website')
    holderName: (settings as { leadHolderName?: string })?.leadHolderName || 'เว็บไซต์ - รอรับ',
  })

  if (!result.ok) {
    return NextResponse.json(
      { message: 'ระบบขัดข้องชั่วคราว รบกวนโทรหาสาขาโดยตรง' },
      { status: 502 },
    )
  }

  return NextResponse.json({ ok: true })
}
