import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { checkViewKey, isStatus } from '@/lib/smartReport'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const hits = new Map<string, number[]>()
function rateLimited(ip: string) {
  const now = Date.now()
  const list = (hits.get(ip) || []).filter((t) => now - t < 10 * 60 * 1000)
  list.push(now)
  hits.set(ip, list)
  return list.length > 60
}

/** ผู้ดูแลระบบ SMART เปลี่ยนสถานะ + ตอบกลับ จากหน้า /smart-report/list (ต้องมีรหัส key) */
export async function POST(req: Request) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || 'unknown'
  if (rateLimited(ip)) return NextResponse.json({ message: 'ถี่เกินไป รอสักครู่' }, { status: 429 })

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ message: 'ข้อมูลไม่ถูกต้อง' }, { status: 400 })
  }
  if (!(await checkViewKey(String(body.key || '')))) return NextResponse.json({ message: 'รหัสไม่ถูกต้อง' }, { status: 401 })

  const id = Number(body.id)
  const status = String(body.status || '')
  const reply = String(body.reply ?? '').trim().slice(0, 4000)
  if (!Number.isInteger(id) || id < 1 || !isStatus(status)) return NextResponse.json({ message: 'ข้อมูลไม่ถูกต้อง' }, { status: 400 })

  try {
    const payload = await getPayload({ config })
    const old = await payload.findByID({ collection: 'smart-issues', id, depth: 0, overrideAccess: true })
    const replyChanged = (old.reply || '') !== reply
    const doc = await payload.update({
      collection: 'smart-issues',
      id,
      data: { status, reply: reply || null, ...(replyChanged ? { repliedAt: new Date().toISOString() } : {}) },
      overrideAccess: true,
    })
    return NextResponse.json({ ok: true, status: doc.status, reply: doc.reply || '', repliedAt: doc.repliedAt || null })
  } catch (e) {
    console.error('[smart-report] update failed', e)
    return NextResponse.json({ message: 'บันทึกไม่สำเร็จ' }, { status: 500 })
  }
}
