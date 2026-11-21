import { fetchOutingRows, outingCsv, outingKeyOk } from '@/lib/outingData'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/** CSV คำตอบแบบสำรวจ Outing 2570 | ?dl=1 = ดาวน์โหลดเป็นไฟล์ (มี BOM ให้ Excel อ่านภาษาไทยได้) | คีย์ผิด = 404 */
export async function GET(req: Request) {
  const sp = new URL(req.url).searchParams
  if (!outingKeyOk(sp.get('key') || '')) return new Response('not found', { status: 404 })
  const rows = await fetchOutingRows()
  if (!rows) return new Response('unavailable', { status: 502 })
  const dl = sp.get('dl') === '1'
  const date = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Bangkok' })
  return new Response((dl ? '﻿' : '') + outingCsv(rows), {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Robots-Tag': 'noindex, nofollow',
      ...(dl ? { 'Content-Disposition': `attachment; filename="outing-2570-${date}.csv"` } : {}),
    },
  })
}
