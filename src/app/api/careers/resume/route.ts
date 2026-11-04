import { NextResponse } from 'next/server'
import { isDraftId, uploadResume, RESUME_MAX_BYTES, RESUME_TYPES } from '@/lib/careers'

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

/** อัปเรซูเม่ 1 ไฟล์: multipart { draft, file } → { path } */
export async function POST(req: Request) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || 'unknown'
  if (rateLimited(ip)) return NextResponse.json({ message: 'ส่งไฟล์ถี่เกินไป รอสักครู่' }, { status: 429 })

  let fd: FormData
  try {
    fd = await req.formData()
  } catch {
    return NextResponse.json({ message: 'ข้อมูลไม่ถูกต้อง' }, { status: 400 })
  }
  const draft = String(fd.get('draft') || '')
  const file = fd.get('file')
  if (!isDraftId(draft)) return NextResponse.json({ message: 'ข้อมูลไฟล์ไม่ถูกต้อง' }, { status: 400 })
  if (!(file instanceof Blob) || file.size === 0) return NextResponse.json({ message: 'ไม่พบไฟล์' }, { status: 400 })
  if (file.size > RESUME_MAX_BYTES) return NextResponse.json({ message: 'ไฟล์ใหญ่เกินไป (สูงสุด 5MB)' }, { status: 400 })
  if (!RESUME_TYPES[file.type]) return NextResponse.json({ message: 'รองรับไฟล์ PDF หรือรูป (JPG, PNG) เท่านั้น' }, { status: 400 })

  const r = await uploadResume(draft, file.type, await file.arrayBuffer())
  if (!r.ok) return NextResponse.json({ message: 'อัปโหลดไฟล์ไม่สำเร็จ ลองใหม่อีกครั้ง' }, { status: 502 })
  return NextResponse.json({ ok: true, path: r.path })
}
