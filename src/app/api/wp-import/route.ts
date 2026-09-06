import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60

/**
 * ดึงรูปจากเว็บ WordPress เก่าเข้ามาในคลังรูปของเว็บใหม่
 *
 * GET  /api/wp-import?domain=hiclassevcar.com&page=1&search=sealion
 *      → รายการรูปจาก WordPress (ผ่าน REST API ของ WordPress เอง) พร้อมบอกว่ารูปไหนนำเข้าแล้ว
 * POST /api/wp-import  { url, alt }
 *      → โหลดรูปนั้นจากเว็บเก่าฝั่งเซิร์ฟเวอร์ แล้วบันทึกเข้าคลังรูป (ทีละรูป กันหมดเวลา)
 *
 * ต้องเข้าสู่ระบบหลังบ้านก่อนถึงจะเรียกได้
 */

const MAX_BYTES = 20_000_000

/** กันไม่ให้ยิงเข้าเครือข่ายภายใน */
const BLOCKED = /^(localhost|127\.|0\.|10\.|192\.168\.|169\.254\.|172\.(1[6-9]|2\d|3[01])\.|\[?::1\]?$)/i

function cleanHost(input: string) {
  const raw = String(input || '').trim().replace(/^https?:\/\//i, '').replace(/\/.*$/, '')
  if (!raw || !/^[a-z0-9.-]+$/i.test(raw) || BLOCKED.test(raw)) return null
  return raw
}

const baseName = (url: string) => {
  try {
    const p = new URL(url).pathname
    return decodeURIComponent(p.split('/').pop() || '')
  } catch {
    return ''
  }
}

/** ตัดนามสกุลออก เพื่อเทียบว่ารูปนี้เคยนำเข้าแล้วหรือยัง (ไฟล์ในคลังถูกแปลงเป็น .webp) */
const stem = (name: string) => name.replace(/\.[a-z0-9]+$/i, '')

async function requireUser(req: Request) {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: req.headers })
  return { payload, user }
}

export async function GET(req: Request) {
  const { payload, user } = await requireUser(req)
  if (!user) return NextResponse.json({ message: 'ต้องเข้าสู่ระบบหลังบ้านก่อน' }, { status: 401 })

  const url = new URL(req.url)
  const host = cleanHost(url.searchParams.get('domain') || '')
  if (!host) return NextResponse.json({ message: 'ชื่อโดเมนไม่ถูกต้อง' }, { status: 400 })

  const page = Math.max(1, Number(url.searchParams.get('page') || 1))
  const search = (url.searchParams.get('search') || '').trim()

  const wp = new URL(`https://${host}/wp-json/wp/v2/media`)
  wp.searchParams.set('media_type', 'image')
  wp.searchParams.set('per_page', '60')
  wp.searchParams.set('page', String(page))
  wp.searchParams.set('orderby', 'date')
  wp.searchParams.set('order', 'desc')
  if (search) wp.searchParams.set('search', search)

  let res: Response
  try {
    res = await fetch(wp.toString(), {
      headers: { accept: 'application/json' },
      signal: AbortSignal.timeout(20_000),
      cache: 'no-store',
    })
  } catch {
    return NextResponse.json(
      { message: `ต่อกับ ${host} ไม่ได้ — ตรวจว่าเว็บเก่ายังเปิดอยู่ และพิมพ์ชื่อโดเมนถูกต้อง` },
      { status: 502 },
    )
  }

  if (!res.ok) {
    const hint =
      res.status === 401 || res.status === 403
        ? 'เว็บเก่าปิดการเข้าถึง REST API อยู่ (บางปลั๊กอินความปลอดภัยจะปิดไว้) — ต้องเปิดชั่วคราว หรือใช้วิธีดาวน์โหลดไฟล์มาอัปโหลดเองแทน'
        : res.status === 404
          ? 'ไม่พบ REST API ของ WordPress ที่โดเมนนี้'
          : `เว็บเก่าตอบกลับรหัส ${res.status}`
    return NextResponse.json({ message: hint }, { status: 502 })
  }

  type WpMedia = {
    id: number
    date?: string
    alt_text?: string
    source_url?: string
    mime_type?: string
    title?: { rendered?: string }
    media_details?: {
      width?: number
      height?: number
      filesize?: number
      sizes?: Record<string, { source_url?: string }>
    }
  }

  const list = (await res.json()) as WpMedia[]
  const totalPages = Number(res.headers.get('x-wp-totalpages') || 1)
  const total = Number(res.headers.get('x-wp-total') || list.length)

  const items = list
    .filter((m) => m.source_url && (m.mime_type || '').startsWith('image/'))
    .map((m) => {
      const src = m.source_url as string
      const sizes = m.media_details?.sizes || {}
      const name = baseName(src)
      return {
        wpId: m.id,
        url: src,
        thumb: sizes.thumbnail?.source_url || sizes.medium?.source_url || src,
        filename: name,
        title: (m.title?.rendered || '').replace(/<[^>]*>/g, '').trim(),
        alt: (m.alt_text || '').trim(),
        width: m.media_details?.width ?? null,
        height: m.media_details?.height ?? null,
        bytes: m.media_details?.filesize ?? null,
        date: m.date ?? null,
        exists: false,
      }
    })

  // ทำเครื่องหมายรูปที่เคยนำเข้าแล้ว เทียบจากชื่อไฟล์ (ในคลังถูกแปลงเป็น .webp)
  if (items.length) {
    const existing = await payload.find({
      collection: 'media',
      limit: 1000,
      depth: 0,
      pagination: false,
      select: { filename: true },
    })
    const have = new Set(
      existing.docs.map((d) => stem(String((d as { filename?: string }).filename || '')).toLowerCase()),
    )
    for (const it of items) if (have.has(stem(it.filename).toLowerCase())) it.exists = true
  }

  return NextResponse.json({ items, page, totalPages, total, host })
}

export async function POST(req: Request) {
  const { payload, user } = await requireUser(req)
  if (!user) return NextResponse.json({ message: 'ต้องเข้าสู่ระบบหลังบ้านก่อน' }, { status: 401 })

  let body: { url?: string; alt?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ message: 'ข้อมูลไม่ถูกต้อง' }, { status: 400 })
  }

  const src = String(body.url || '')
  let parsed: URL
  try {
    parsed = new URL(src)
  } catch {
    return NextResponse.json({ message: 'ลิงก์รูปไม่ถูกต้อง' }, { status: 400 })
  }
  if (!/^https?:$/.test(parsed.protocol) || !cleanHost(parsed.hostname)) {
    return NextResponse.json({ message: 'ลิงก์รูปไม่ถูกต้อง' }, { status: 400 })
  }

  const name = baseName(src) || 'image.jpg'

  // ถ้ามีชื่อไฟล์นี้ในคลังแล้ว ไม่ต้องโหลดซ้ำ
  const dup = await payload.find({
    collection: 'media',
    limit: 1,
    depth: 0,
    where: { filename: { like: stem(name) } },
  })
  if (dup.docs.length) {
    return NextResponse.json({ status: 'skipped', id: dup.docs[0].id, filename: name })
  }

  let res: Response
  try {
    res = await fetch(src, { signal: AbortSignal.timeout(30_000), cache: 'no-store' })
  } catch {
    return NextResponse.json({ message: 'โหลดรูปจากเว็บเก่าไม่สำเร็จ' }, { status: 502 })
  }
  if (!res.ok) return NextResponse.json({ message: `โหลดรูปไม่สำเร็จ (${res.status})` }, { status: 502 })

  const mimetype = res.headers.get('content-type')?.split(';')[0]?.trim() || 'image/jpeg'
  if (!mimetype.startsWith('image/')) {
    return NextResponse.json({ message: 'ลิงก์นี้ไม่ใช่ไฟล์รูป' }, { status: 400 })
  }

  const data = Buffer.from(await res.arrayBuffer())
  if (!data.length) return NextResponse.json({ message: 'ไฟล์ว่าง' }, { status: 400 })
  if (data.length > MAX_BYTES) {
    return NextResponse.json({ message: 'ไฟล์ใหญ่เกิน 20 MB' }, { status: 400 })
  }

  const alt = (body.alt || '').trim() || stem(name).replace(/[-_]+/g, ' ').trim() || 'รูปภาพ'

  try {
    const doc = await payload.create({
      collection: 'media',
      data: { alt },
      file: { data, mimetype, name, size: data.length },
    })
    return NextResponse.json({ status: 'created', id: doc.id, filename: doc.filename })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'บันทึกรูปไม่สำเร็จ'
    return NextResponse.json({ message }, { status: 500 })
  }
}
