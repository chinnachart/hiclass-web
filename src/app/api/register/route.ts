import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { createLead } from '@/lib/crm'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// กันสแปมแบบง่ายในหน่วยความจำ (แบบเดียวกับ /api/test-drive)
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

/** ฟอร์มลงทะเบียนความสนใจ (/register) → public.crm_leads kind='register' */
export async function POST(req: Request) {
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'unknown'

  if (rateLimited(ip)) {
    return NextResponse.json({ message: 'ส่งคำขอถี่เกินไป รบกวนรอสักครู่แล้วลองใหม่' }, { status: 429 })
  }

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ message: 'ข้อมูลไม่ถูกต้อง' }, { status: 400 })
  }

  const consent = body.consent === true
  const customerName = String(body.customerName || '').trim()
  const phone = String(body.phone || '').trim()
  const email = String(body.email || '').trim().slice(0, 120)
  const model = String(body.model || '').trim()
  const lineId = String(body.lineId || '').trim().slice(0, 60)
  const branch = String(body.branch || '').trim()
  const comment = String(body.comment || '').trim().slice(0, 500)

  if (!consent) {
    return NextResponse.json({ message: 'กรุณายอมรับเงื่อนไขการเก็บข้อมูลส่วนบุคคล' }, { status: 400 })
  }
  if (customerName.length < 2 || customerName.length > 120) {
    return NextResponse.json({ message: 'กรุณากรอกชื่อให้ถูกต้อง' }, { status: 400 })
  }
  if (phone.replace(/\D/g, '').length < 9) {
    return NextResponse.json({ message: 'กรุณากรอกเบอร์โทรให้ถูกต้อง' }, { status: 400 })
  }
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ message: 'กรุณากรอกอีเมลให้ถูกต้อง' }, { status: 400 })
  }
  if (!model) {
    return NextResponse.json({ message: 'กรุณาเลือกรุ่นที่สนใจ' }, { status: 400 })
  }
  if (!branch) {
    return NextResponse.json({ message: 'กรุณาเลือกสาขา' }, { status: 400 })
  }

  const payload = await getPayload({ config })
  const settings = await payload.findGlobal({ slug: 'site-settings', depth: 0 })

  const result = await createLead({
    kind: 'register',
    customerName,
    phone,
    email,
    lineId,
    comment,
    model,
    branch,
    holderName: (settings as { leadHolderName?: string })?.leadHolderName || 'เว็บไซต์ - รอรับ',
  })

  if (!result.ok) {
    return NextResponse.json({ message: 'ระบบขัดข้องชั่วคราว รบกวนโทรหาสาขาโดยตรง' }, { status: 502 })
  }

  return NextResponse.json({ ok: true })
}
