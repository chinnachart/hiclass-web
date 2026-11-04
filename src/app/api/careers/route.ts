import { NextResponse } from 'next/server'
import { isBotSubmit } from '@/lib/antibot'
import { createApplication, isResumePath } from '@/lib/careers'
import { canon } from '@/lib/crm'

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
const num = (v: unknown, min: number, max: number) => {
  const s = String(v ?? '').replace(/[^\d.]/g, '')
  if (!s) return null
  const n = Number(s)
  return Number.isFinite(n) && n >= min && n <= max ? n : null
}
const yesNo = (v: unknown) => (v === 'yes' || v === true ? true : v === 'no' || v === false ? false : null)

const POSITIONS = ['ที่ปรึกษาการขาย']

export async function POST(req: Request) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || 'unknown'
  if (rateLimited(ip)) return NextResponse.json({ message: 'ส่งใบสมัครถี่เกินไป รบกวนรอสักครู่แล้วลองใหม่' }, { status: 429 })

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ message: 'ข้อมูลไม่ถูกต้อง' }, { status: 400 })
  }
  if (isBotSubmit(body)) return NextResponse.json({ ok: true })

  const fullName = str(body.fullName, 120)
  const phone = str(body.phone, 30)
  const email = str(body.email, 120)
  const position = POSITIONS.includes(str(body.position, 60)) ? str(body.position, 60) : POSITIONS[0]
  const branchRaw = str(body.branch, 60)
  const resumePath = str(body.resumePath, 120)

  if (fullName.length < 2) return NextResponse.json({ message: 'กรุณากรอกชื่อ-นามสกุล' }, { status: 400 })
  if (phone.replace(/\D/g, '').length < 9) return NextResponse.json({ message: 'กรุณากรอกเบอร์โทรให้ถูกต้อง' }, { status: 400 })
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return NextResponse.json({ message: 'รูปแบบอีเมลไม่ถูกต้อง' }, { status: 400 })
  if (body.consent !== true) return NextResponse.json({ message: 'กรุณายินยอมให้บริษัทใช้ข้อมูลเพื่อการพิจารณารับสมัครงาน' }, { status: 400 })

  const result = await createApplication({
    position,
    fullName,
    nickname: str(body.nickname, 40),
    phone,
    lineId: str(body.lineId, 60),
    email,
    age: num(body.age, 15, 80),
    branch: branchRaw && branchRaw !== 'any' ? canon(branchRaw) : null,
    expYears: num(body.expYears, 0, 50),
    expBrands: str(body.expBrands, 200),
    hasLicense: yesNo(body.hasLicense),
    canLive: yesNo(body.canLive),
    intro: str(body.intro, 1500),
    source: str(body.source, 60),
    resumePath: resumePath && isResumePath(resumePath) ? resumePath : null,
    ip,
    userAgent: req.headers.get('user-agent') || '',
  })

  if (!result.ok) return NextResponse.json({ message: 'ระบบขัดข้องชั่วคราว รบกวนลองใหม่ หรือโทรหาสาขาที่ต้องการสมัคร' }, { status: 502 })
  return NextResponse.json({ ok: true })
}
