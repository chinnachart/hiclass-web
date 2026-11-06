import { NextResponse } from 'next/server'
import { logCard } from '@/lib/genCard'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const hits = new Map<string, number[]>()
const WINDOW_MS = 10 * 60 * 1000
const MAX_PER_WINDOW = 30

/** POST { token, action: 'download' | 'share' } → บันทึกลง gen_card_logs (ตรวจ token กับ Supabase ก่อน) */
export async function POST(req: Request) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || 'unknown'
  const now = Date.now()
  const list = (hits.get(ip) || []).filter((t) => now - t < WINDOW_MS)
  list.push(now)
  hits.set(ip, list)
  if (list.length > MAX_PER_WINDOW) return NextResponse.json({ ok: false }, { status: 429 })

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 })
  }
  const token = String(body.token || '').trim()
  const action = body.action === 'share' ? 'share' : body.action === 'download' ? 'download' : null
  if (!token || token.length > 4000 || !action) return NextResponse.json({ ok: false }, { status: 400 })
  const r = await logCard(token, action)
  return NextResponse.json({ ok: r.ok }, { status: r.ok ? 200 : 401 })
}
