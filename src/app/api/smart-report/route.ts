import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { isBotSubmit } from '@/lib/antibot'
import { isDept, isPhotoPath, MAX_PHOTOS, ticketNo } from '@/lib/smartReport'

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

const bad = (message: string, status = 400) => NextResponse.json({ message }, { status })

/** พนักงานแจ้งปัญหา SMART (/smart-report) → cms.smart_issues สถานะ "ใหม่" */
export async function POST(req: Request) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || 'unknown'
  if (rateLimited(ip)) return bad('ส่งถี่เกินไป รบกวนรอสักครู่แล้วลองใหม่', 429)

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return bad('ข้อมูลไม่ถูกต้อง')
  }
  if (isBotSubmit({ hp: body.website, t: body._t })) return NextResponse.json({ ok: true, ticket: '-' })

  const s = (k: string, max = 120) => String(body[k] ?? '').replace(/\s+/g, ' ').trim().slice(0, max)
  const dept = s('dept', 20)
  const title = s('title', 150)
  const reporterName = s('reporterName', 80)
  const detail = String(body.detail ?? '').trim().slice(0, 4000)
  const photos = Array.isArray(body.photos) ? body.photos.map(String).filter(isPhotoPath).slice(0, MAX_PHOTOS) : []

  if (!isDept(dept)) return bad('กรุณาเลือกฝ่าย')
  if (reporterName.length < 2) return bad('กรุณากรอกชื่อผู้แจ้ง')
  if (title.length < 3) return bad('กรุณากรอกปัญหาที่พบ')
  if (detail.length < 5) return bad('กรุณาอธิบายปัญหาเพิ่มเติม')

  try {
    const payload = await getPayload({ config })
    const doc = await payload.create({
      collection: 'smart-issues',
      data: {
        status: 'new',
        dept,
        title,
        reporterName,
        contact: s('contact', 60) || undefined,
        branch: s('branch', 40) || undefined,
        menu: s('menu', 150) || undefined,
        detail,
        photos,
      },
      overrideAccess: true,
    })
    return NextResponse.json({ ok: true, ticket: ticketNo(doc.id) })
  } catch (e) {
    console.error('[smart-report] create failed', e)
    return bad('บันทึกไม่สำเร็จ รบกวนลองใหม่อีกครั้ง', 500)
  }
}
