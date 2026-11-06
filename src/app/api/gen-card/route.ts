import { NextResponse } from 'next/server'
import { loginWithPassword, profileFromToken } from '@/lib/genCard'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const hits = new Map<string, number[]>()
const WINDOW_MS = 10 * 60 * 1000
const MAX_PER_WINDOW = 10

function rateLimited(ip: string) {
  const now = Date.now()
  const list = (hits.get(ip) || []).filter((t) => now - t < WINDOW_MS)
  list.push(now)
  hits.set(ip, list)
  return list.length > MAX_PER_WINDOW
}

/** POST { token } (ส่งต่อจาก Cinco) หรือ { email, password } → { token, profile } */
export async function POST(req: Request) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || 'unknown'
  if (rateLimited(ip)) return NextResponse.json({ message: 'ลองถี่เกินไป รอสักครู่แล้วลองใหม่' }, { status: 429 })

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ message: 'ข้อมูลไม่ถูกต้อง' }, { status: 400 })
  }

  let token = String(body.token || '').trim()
  if (!token) {
    const email = String(body.email || '').trim().slice(0, 120)
    const password = String(body.password || '').slice(0, 200)
    if (!email || !password) return NextResponse.json({ message: 'กรอกอีเมลและรหัสผ่าน Cinco' }, { status: 400 })
    const r = await loginWithPassword(email, password)
    if (!r.ok || !r.token) {
      return NextResponse.json({ message: r.reason === 'bad-credentials' ? 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' : 'เข้าสู่ระบบไม่สำเร็จ ลองใหม่อีกครั้ง' }, { status: 401 })
    }
    token = r.token
  }
  if (token.length > 4000) return NextResponse.json({ message: 'ข้อมูลไม่ถูกต้อง' }, { status: 400 })

  const p = await profileFromToken(token)
  if (!p.ok || !p.profile) {
    const msg = p.reason === 'inactive' ? 'บัญชีนี้ถูกปิดใช้งาน' : p.reason === 'bad-token' ? 'เซสชันหมดอายุ เข้าสู่ระบบใหม่' : 'โหลดข้อมูลพนักงานไม่สำเร็จ'
    return NextResponse.json({ message: msg }, { status: 401 })
  }
  return NextResponse.json({ ok: true, token, profile: p.profile })
}
