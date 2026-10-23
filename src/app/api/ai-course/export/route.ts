import { fetchRows, keyOk, toCsv } from '@/lib/aiCourseData'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/** CSV คำตอบแบบสำรวจคอร์ส AI · ?dl=1 = ดาวน์โหลดเป็นไฟล์ (มี BOM ให้ Excel/Numbers อ่านภาษาไทยถูก) */
export async function GET(req: Request) {
  const sp = new URL(req.url).searchParams
  if (!keyOk(sp.get('key') || '')) return new Response('not found', { status: 404 })
  const rows = await fetchRows()
  if (!rows) return new Response('unavailable', { status: 502 })
  const dl = sp.get('dl') === '1'
  const date = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Bangkok' })
  return new Response((dl ? '\uFEFF' : '') + toCsv(rows), {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Robots-Tag': 'noindex, nofollow',
      ...(dl ? { 'Content-Disposition': `attachment; filename="ai-course-survey-${date}.csv"` } : {}),
    },
  })
}
