import { NextResponse } from 'next/server'
import { createInsuranceLead, EV_CARE_REPLY } from '@/lib/evcare'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

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

const str = (v: unknown, max: number) => String(v ?? '').trim().slice(0, max)

/** POST ฟอร์มขอใบเสนอราคาประกัน (/ev-care) → Cinco insurance_leads */
export async function POST(req: Request) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || 'unknown'
  if (rateLimited(ip)) return NextResponse.json({ message: 'ส่งคำขอถี่เกินไป รบกวนรอสักครู่แล้วลองใหม่' }, { status: 429 })

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ message: 'ข้อมูลไม่ถูกต้อง' }, { status: 400 })
  }

  // ช่องล่อบอท: คนจริงมองไม่เห็นและไม่กรอก → ตอบสำเร็จเฉยๆ ไม่บันทึก
  if (str(body.website, 200)) return NextResponse.json({ ok: true, message: EV_CARE_REPLY })

  const customerName = str(body.customerName, 120)
  const phone = str(body.phone, 30)
  if (customerName.length < 2) return NextResponse.json({ message: 'กรุณากรอกชื่อให้ถูกต้อง' }, { status: 400 })
  if (phone.replace(/\D/g, '').length < 9) return NextResponse.json({ message: 'กรุณากรอกเบอร์โทรให้ถูกต้อง' }, { status: 400 })
  if (body.consent !== true) return NextResponse.json({ message: 'กรุณาติ๊กยินยอมให้ติดต่อกลับก่อนส่ง' }, { status: 400 })

  const thisYear = new Date().getFullYear()
  const y = Number(String(body.carYear ?? '').replace(/[^\d]/g, ''))
  const carYear = Number.isFinite(y) && y >= 2015 && y <= thisYear + 1 ? y : null
  const exp = str(body.insuranceExpiry, 10)
  const insuranceExpiry = /^\d{4}-\d{2}-\d{2}$/.test(exp) && !Number.isNaN(Date.parse(exp)) ? exp : null

  const result = await createInsuranceLead({
    customerName,
    phone,
    lineId: str(body.lineId, 60),
    carModel: str(body.carModel, 60),
    carYear,
    plate: str(body.plate, 30),
    insuranceExpiry,
    currentInsurer: str(body.currentInsurer, 80),
    note: str(body.note, 800),
    consentPartner: true,
    source: str(body.source, 300),
    ip,
    userAgent: req.headers.get('user-agent') || '',
  })

  if (!result.ok) return NextResponse.json({ message: 'ระบบขัดข้องชั่วคราว รบกวนลองใหม่ หรือติดต่อทาง LINE' }, { status: 502 })
  return NextResponse.json({ ok: true, message: EV_CARE_REPLY })
}
