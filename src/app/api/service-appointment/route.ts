import { NextResponse } from 'next/server'
import { SERVICE_TYPES, TIME_SLOTS, cincoBranch, createServiceAppointment } from '@/lib/serviceAppt'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// กันสแปมแบบง่ายในหน่วยความจำ (แบบเดียวกับ /api/test-drive และ /api/register)
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

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const bad = (message: string, status = 400) => NextResponse.json({ message }, { status })

/** ฟอร์มนัดหมายศูนย์บริการ (/service#appointment) → public.service_appointments */
export async function POST(req: Request) {
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'unknown'

  if (rateLimited(ip)) return bad('ส่งคำขอถี่เกินไป รบกวนรอสักครู่แล้วลองใหม่', 429)

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return bad('ข้อมูลไม่ถูกต้อง')
  }

  const s = (k: string, max = 120) => String(body[k] ?? '').trim().slice(0, max)
  const consent = body.consent === true
  const customerName = s('customerName')
  const email = s('email')
  const phone = s('phone', 30)
  const model = s('model', 40)
  const subModel = s('subModel', 60)
  const plate = s('plate', 40)
  const vin = s('vin', 30).toUpperCase()
  const mileageRaw = s('mileage', 12).replace(/[^\d]/g, '')
  const branchCode = s('branch', 30)
  const serviceType = s('serviceType', 80)
  const timeSlot = s('timeSlot', 40)
  const detail = s('detail', 1000)

  if (!consent) return bad('กรุณายอมรับข้อตกลงและเงื่อนไขการใช้งาน')
  if (customerName.length < 2) return bad('กรุณากรอกชื่อให้ถูกต้อง')
  if (phone.replace(/\D/g, '').length < 9) return bad('กรุณากรอกเบอร์โทรให้ถูกต้อง')
  if (email && !EMAIL_RE.test(email)) return bad('กรุณากรอกอีเมลให้ถูกต้อง')
  if (!model) return bad('กรุณาเลือกรุ่นรถ')
  if (!plate) return bad('กรุณากรอกเลขทะเบียน')
  if (vin && !/^[A-HJ-NPR-Z0-9]{11,17}$/.test(vin)) return bad('เลข VIN ไม่ถูกต้อง (ตัวอักษร/ตัวเลข 17 หลัก)')
  const branch = cincoBranch(branchCode)
  if (!branch) return bad('กรุณาเลือกสาขาที่มีศูนย์บริการ')
  if (!(SERVICE_TYPES as readonly string[]).includes(serviceType)) return bad('กรุณาเลือกประเภทงาน')
  if (timeSlot && !(TIME_SLOTS as readonly string[]).includes(timeSlot)) return bad('ช่วงเวลาไม่ถูกต้อง')
  const mileage = mileageRaw ? Math.min(Number(mileageRaw), 9_999_999) : null

  const result = await createServiceAppointment({
    customerName,
    email: email || undefined,
    phone,
    model,
    subModel: subModel || undefined,
    plate,
    vin: vin || undefined,
    mileage,
    branch,
    serviceType,
    timeSlot: timeSlot || undefined,
    detail: detail || undefined,
    ip,
    userAgent: req.headers.get('user-agent') || undefined,
  })

  if (!result.ok) return bad('ระบบขัดข้องชั่วคราว รบกวนโทรหาสาขาโดยตรง', 502)
  return NextResponse.json({ ok: true, ref: result.ref })
}
