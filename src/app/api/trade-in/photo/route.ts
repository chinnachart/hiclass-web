import { NextResponse } from 'next/server'
import { isDraftId, uploadPhoto, MAX_PHOTOS } from '@/lib/tradein'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const MAX_BYTES = 2 * 1024 * 1024 // เบราว์เซอร์บีบให้เหลือ ~200–400KB อยู่แล้ว
const hits = new Map<string, number[]>()
const WINDOW_MS = 10 * 60 * 1000
const MAX_PER_WINDOW = 40

function rateLimited(ip: string) {
  const now = Date.now()
  const list = (hits.get(ip) || []).filter((t) => now - t < WINDOW_MS)
  list.push(now)
  hits.set(ip, list)
  return list.length > MAX_PER_WINDOW
}

/** อัปรูปทีละใบ: multipart { draft, n, file } → { path } */
export async function POST(req: Request) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || 'unknown'
  if (rateLimited(ip)) return NextResponse.json({ message: 'ส่งรูปถี่เกินไป รอสักครู่' }, { status: 429 })

  let fd: FormData
  try {
    fd = await req.formData()
  } catch {
    return NextResponse.json({ message: 'ข้อมูลไม่ถูกต้อง' }, { status: 400 })
  }
  const draft = String(fd.get('draft') || '')
  const n = Number(fd.get('n') || 0)
  const file = fd.get('file')
  if (!isDraftId(draft) || !Number.isInteger(n) || n < 1 || n > MAX_PHOTOS) {
    return NextResponse.json({ message: 'ข้อมูลรูปไม่ถูกต้อง' }, { status: 400 })
  }
  if (!(file instanceof Blob) || file.size === 0 || file.size > MAX_BYTES) {
    return NextResponse.json({ message: 'รูปใหญ่เกินไป (สูงสุด 2MB ต่อรูป)' }, { status: 400 })
  }
  if (!/^image\/(jpeg|jpg|png|webp)$/.test(file.type)) {
    return NextResponse.json({ message: 'รองรับเฉพาะไฟล์รูป' }, { status: 400 })
  }
  const r = await uploadPhoto(draft, n, await file.arrayBuffer())
  if (!r.ok) return NextResponse.json({ message: 'อัปโหลดรูปไม่สำเร็จ ลองใหม่อีกครั้ง' }, { status: 502 })
  return NextResponse.json({ ok: true, path: r.path })
}
