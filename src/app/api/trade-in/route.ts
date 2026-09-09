import { NextResponse } from 'next/server'
import { createTradeIn, getReplyMessage, isPhotoPath, MAX_PHOTOS } from '@/lib/tradein'

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
const int = (v: unknown, min: number, max: number) => {
  const n = Number(String(v ?? '').replace(/[^\d]/g, ''))
  return Number.isFinite(n) && n >= min && n <= max ? Math.round(n) : null
}

export async function POST(req: Request) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || 'unknown'
  if (rateLimited(ip)) return NextResponse.json({ message: 'ส่งคำขอถี่เกินไป รบกวนรอสักครู่แล้วลองใหม่' }, { status: 429 })

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ message: 'ข้อมูลไม่ถูกต้อง' }, { status: 400 })
  }

  const customerName = str(body.customerName, 120)
  const phone = str(body.phone, 30)
  const brand = str(body.brand, 60)
  const model = str(body.model, 80)
  const photos = Array.isArray(body.photos) ? body.photos.map((p) => String(p)).filter(isPhotoPath).slice(0, MAX_PHOTOS) : []

  if (customerName.length < 2) return NextResponse.json({ message: 'กรุณากรอกชื่อให้ถูกต้อง' }, { status: 400 })
  if (phone.replace(/\D/g, '').length < 9) return NextResponse.json({ message: 'กรุณากรอกเบอร์โทรให้ถูกต้อง' }, { status: 400 })
  if (!brand || !model) return NextResponse.json({ message: 'กรุณากรอกยี่ห้อและรุ่นรถ' }, { status: 400 })

  const thisYear = new Date().getFullYear()
  const result = await createTradeIn({
    customerName,
    phone,
    lineId: str(body.lineId, 60),
    brand,
    model,
    subModel: str(body.subModel, 80),
    year: int(body.year, 1990, thisYear + 1),
    mileage: int(body.mileage, 0, 2_000_000),
    color: str(body.color, 40),
    plate: str(body.plate, 20),
    plateProvince: str(body.plateProvince, 40),
    conditionNote: str(body.conditionNote, 1000),
    expectedPrice: int(body.expectedPrice, 0, 50_000_000),
    interestedModel: str(body.interestedModel, 40),
    branch: str(body.branch, 40),
    photos,
    ip,
    userAgent: req.headers.get('user-agent') || '',
  })

  if (!result.ok) return NextResponse.json({ message: 'ระบบขัดข้องชั่วคราว รบกวนลองใหม่ หรือติดต่อทาง LINE' }, { status: 502 })
  return NextResponse.json({ ok: true, message: await getReplyMessage() })
}
