import type { Metadata } from 'next'
import Link from 'next/link'
import { getPayload, type Where } from 'payload'
import config from '@payload-config'
import SmartIssueEditor from '@/components/SmartIssueEditor'
import { checkViewKey, DEPTS, deptLabel, isDept, isStatus, signPhotos, STATUSES, statusLabel, ticketNo } from '@/lib/smartReport'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'รายการแจ้งปัญหา SMART',
  robots: { index: false, follow: false, nocache: true },
  referrer: 'no-referrer',
}

type SP = Promise<{ key?: string; dept?: string; status?: string }>

const fmt = (iso?: string | null) =>
  iso
    ? new Date(iso).toLocaleString('th-TH', { day: 'numeric', month: 'short', year: '2-digit', hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Bangkok' })
    : ''

const STATUS_COLOR: Record<string, string> = { new: '#c8102e', in_progress: '#b26a00', need_info: '#5b4bc4', done: '#1a8a4a' }

export default async function SmartReportList({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams
  const key = String(sp.key || '')
  if (!(await checkViewKey(key))) {
    return (
      <main className="container" style={{ paddingTop: 48, paddingBottom: 64, maxWidth: 560 }}>
        <h1 style={{ fontSize: 24, marginBottom: 8 }}>รายการแจ้งปัญหา SMART</h1>
        <p className="mute">ลิงก์ไม่ถูกต้องหรือหมดอายุ ขอลิงก์ใหม่จากผู้ดูแลเว็บ Hi-Class</p>
        <form method="get" style={{ display: 'flex', gap: 8, marginTop: 16 }}>
          <input name="key" type="password" placeholder="รหัส" required style={{ flex: 1, height: 44, borderRadius: 10, border: '1px solid var(--line)', padding: '0 12px', fontSize: 16 }} />
          <button className="btn btn-dark" type="submit">เข้าดู</button>
        </form>
      </main>
    )
  }

  const dept = isDept(String(sp.dept || '')) ? String(sp.dept) : ''
  const status = isStatus(String(sp.status || '')) ? String(sp.status) : ''

  const payload = await getPayload({ config })
  const and: Where[] = []
  if (dept) and.push({ dept: { equals: dept } })
  if (status) and.push({ status: { equals: status } })
  const [res, counts] = await Promise.all([
    payload.find({ collection: 'smart-issues', where: and.length ? { and } : {}, sort: '-createdAt', limit: 200, depth: 0, overrideAccess: true }),
    payload.find({ collection: 'smart-issues', limit: 2000, depth: 0, overrideAccess: true, select: { dept: true, status: true } }),
  ])
  const all = counts.docs as { dept?: string; status?: string }[]
  const nDept = (d: string) => all.filter((x) => !d || x.dept === d).length
  const nStatus = (s: string) => all.filter((x) => (!dept || x.dept === dept) && (!s || x.status === s)).length

  const paths = res.docs.flatMap((d) => (Array.isArray(d.photos) ? (d.photos as string[]) : []))
  const urls = await signPhotos(paths)

  const href = (p: { dept?: string; status?: string }) => {
    const q = new URLSearchParams({ key })
    const d = p.dept ?? dept
    const s = p.status ?? status
    if (d) q.set('dept', d)
    if (s) q.set('status', s)
    return `/smart-report/list?${q.toString()}`
  }

  return (
    <main className="container" style={{ paddingTop: 24, paddingBottom: 64, maxWidth: 900 }}>
      <h1 style={{ fontSize: 26, marginBottom: 4 }}>รายการแจ้งปัญหา SMART</h1>
      <p className="mute" style={{ marginBottom: 16 }}>Hi-Class EV Car | พนักงานแจ้งที่ hiclassevcar.com/smart-report</p>

      <div className="chips" style={{ marginBottom: 8, flexWrap: 'wrap' }}>
        {[{ value: '', label: 'ทุกฝ่าย' }, ...DEPTS].map((d) => (
          <Link key={d.value || 'all'} href={href({ dept: d.value })} className={`chip${dept === d.value ? ' on' : ''}`} style={{ display: 'inline-flex', alignItems: 'center', fontSize: 15 }}>
            {d.label} ({nDept(d.value)})
          </Link>
        ))}
      </div>
      <div className="chips" style={{ marginBottom: 20, flexWrap: 'wrap' }}>
        {[{ value: '', label: 'ทุกสถานะ' }, ...STATUSES].map((s) => (
          <Link key={s.value || 'all'} href={href({ status: s.value })} className={`chip${status === s.value ? ' on' : ''}`} style={{ display: 'inline-flex', alignItems: 'center' }}>
            {s.label} ({nStatus(s.value)})
          </Link>
        ))}
      </div>

      {res.docs.length === 0 ? <p className="mute">ยังไม่มีรายการ</p> : null}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {res.docs.map((d) => {
          const photos = (Array.isArray(d.photos) ? (d.photos as string[]) : []).filter((p) => urls[p])
          return (
            <article key={d.id} className="card" style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center', fontSize: 13 }}>
                <strong>{ticketNo(d.id)}</strong>
                <span style={{ padding: '2px 10px', borderRadius: 999, background: d.dept === 'service' ? '#e8f0fe' : '#fdecef', color: d.dept === 'service' ? '#1a56c4' : '#c8102e', fontWeight: 600 }}>{deptLabel(d.dept)}</span>
                <span style={{ padding: '2px 10px', borderRadius: 999, border: `1px solid ${STATUS_COLOR[d.status] || '#999'}`, color: STATUS_COLOR[d.status] || '#999', fontWeight: 600 }}>{statusLabel(d.status)}</span>
                <span className="mute">{fmt(d.createdAt)}</span>
              </div>
              <h2 style={{ fontSize: 19, margin: 0 }}>{d.title}</h2>
              <div className="mute" style={{ fontSize: 14 }}>
                {d.reporterName}
                {d.branch ? ` | สาขา${d.branch}` : ''}
                {d.contact ? ` | ${d.contact}` : ''}
              </div>
              {d.menu ? <div style={{ fontSize: 14 }}>เมนู: {d.menu}</div> : null}
              <p style={{ whiteSpace: 'pre-wrap', margin: 0 }}>{d.detail}</p>
              {photos.length ? (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {photos.map((p) => (
                    <a key={p} href={urls[p]} target="_blank" rel="noopener noreferrer">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={urls[p]} alt="" loading="lazy" style={{ width: 120, height: 120, objectFit: 'cover', borderRadius: 10, border: '1px solid var(--line)' }} />
                    </a>
                  ))}
                </div>
              ) : null}
              <SmartIssueEditor id={d.id} viewKey={key} status={d.status} reply={d.reply || ''} repliedAt={fmt(d.repliedAt)} />
            </article>
          )
        })}
      </div>
    </main>
  )
}
