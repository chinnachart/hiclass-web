import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { fetchRows, keyOk, COLS, type Row } from '@/lib/aiCourseData'
import { AI_LEVELS } from '@/lib/aiCourse'

// หน้าดูผลแบบสำรวจคอร์ส AI — เข้าได้เฉพาะลิงก์ที่มี ?key= ถูกต้อง (คีย์ผิด = 404) · ไม่ให้ Google เก็บ
export const metadata: Metadata = {
  title: 'ผลแบบสำรวจคอร์ส AI',
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
  referrer: 'no-referrer',
}
export const dynamic = 'force-dynamic'

const count = (rows: Row[], pick: (r: Row) => string[]) => {
  const m = new Map<string, number>()
  rows.forEach((r) => pick(r).forEach((v) => v && m.set(v, (m.get(v) || 0) + 1)))
  return [...m.entries()].sort((a, b) => b[1] - a[1])
}

function Bars({ title, data, total }: { title: string; data: [string, number][]; total: number }) {
  return (
    <div className="card" style={{ padding: 16 }}>
      <h3 style={{ fontSize: 16, marginBottom: 10 }}>{title}</h3>
      {data.length ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {data.map(([k, n]) => (
            <div key={k} style={{ fontSize: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                <span>{k}</span>
                <b>{n}</b>
              </div>
              <div style={{ height: 6, borderRadius: 3, background: 'var(--line)', marginTop: 3 }}>
                <div style={{ height: 6, borderRadius: 3, background: 'var(--red)', width: `${Math.round((n / Math.max(total, 1)) * 100)}%` }} />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="mute" style={{ fontSize: 14 }}>ยังไม่มีข้อมูล</p>
      )}
    </div>
  )
}

export default async function AiCourseResults({ searchParams }: { searchParams: Promise<{ key?: string; branch?: string }> }) {
  const sp = await searchParams
  const key = sp.key || ''
  if (!keyOk(key)) notFound()
  const all = await fetchRows()
  if (!all) {
    return (
      <main className="container section">
        <p>อ่านข้อมูลไม่สำเร็จ ลองรีเฟรชอีกครั้ง</p>
      </main>
    )
  }
  const branch = sp.branch || ''
  const rows = (branch ? all.filter((r) => (r.pref_branches || []).includes(branch)) : all).slice().reverse()
  const total = rows.length
  const branches = count(all, (r) => r.pref_branches || []).map(([k]) => k)
  const levelOrder = (k: string) => (AI_LEVELS as readonly string[]).indexOf(k)
  const q = (b?: string) => `/ai-course/results?key=${encodeURIComponent(key)}${b ? `&branch=${encodeURIComponent(b)}` : ''}`
  const field = (label: string, v: string) =>
    v ? (
      <div style={{ fontSize: 14 }}>
        <span className="mute">{label}: </span>
        <span style={{ whiteSpace: 'pre-wrap' }}>{v}</span>
      </div>
    ) : null
  const col = (name: string, r: Row) => COLS.find(([h]) => h === name)![1](r)

  return (
    <>
      <section className="page-head">
        <div className="container">
          <p className="kicker">เฉพาะผู้ดูแล — ห้ามแชร์ลิงก์นี้</p>
          <h1>ผลแบบสำรวจคอร์ส AI</h1>
          <p className="lead">ตอบแล้ว {all.length} คน{branch ? ` · กรองสาขา ${branch}: ${total} คน` : ''}</p>
        </div>
      </section>
      <main className="container">
        <section className="section" style={{ paddingTop: 16, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <a className="btn btn-red btn-block" href={`/api/ai-course/export?key=${encodeURIComponent(key)}&dl=1`}>
            ดาวน์โหลดไฟล์ (เปิดใน Google Sheets / Excel ได้)
          </a>

          <div className="chips">
            <a className={`chip${!branch ? ' on' : ''}`} href={q()} style={{ display: 'inline-flex', alignItems: 'center' }}>ทุกสาขา</a>
            {branches.map((b) => (
              <a key={b} className={`chip${branch === b ? ' on' : ''}`} href={q(b)} style={{ display: 'inline-flex', alignItems: 'center' }}>{b}</a>
            ))}
          </div>

          <div className="grid-2" style={{ gap: 16, alignItems: 'start' }}>
            <Bars title="สาขาที่สะดวกเรียน" data={count(rows, (r) => r.pref_branches || [])} total={total} />
            <Bars title="ระดับความรู้ AI" data={count(rows, (r) => [r.ai_level]).sort((a, b) => levelOrder(a[0]) - levelOrder(b[0]))} total={total} />
            <Bars title="หัวข้อที่ติ๊ก" data={count(rows, (r) => r.topics || [])} total={total} />
            <Bars title="AI ที่รู้จัก" data={count(rows, (r) => r.known_ais || [])} total={total} />
          </div>

          <h2 style={{ fontSize: 20, marginTop: 8 }}>คำตอบรายคน (ล่าสุดก่อน)</h2>
          {rows.length ? (
            rows.map((r, i) => (
              <div key={i} className="card" style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
                  <b style={{ fontSize: 16 }}>
                    {r.full_name}
                    {r.nickname ? ` (${r.nickname})` : ''}
                  </b>
                  <span className="mute" style={{ fontSize: 13 }}>{col('วันที่ส่ง', r)}</span>
                </div>
                <div style={{ fontSize: 14 }}>
                  {r.home_branch} · {r.position} · <a href={`tel:${r.phone.replace(/[^\d+]/g, '')}`}>{col('เบอร์โทร', r)}</a>
                </div>
                {field('ระดับ', r.ai_level)}
                {field('AI ที่รู้จัก', col('AI ที่รู้จัก', r))}
                {field('อยากเรียน', r.topics_free || '')}
                {field('หัวข้อที่ติ๊ก', col('หัวข้อที่ติ๊ก', r))}
                {field('อยากเอาไปต่อยอด', r.use_cases || '')}
                {field('สาขาที่สะดวก', col('สาขาที่สะดวกเรียน', r))}
                {field('วัน/เวลาที่สะดวก', r.pref_time || '')}
                {field('หมายเหตุ', r.note || '')}
              </div>
            ))
          ) : (
            <p className="mute">ยังไม่มีคนตอบ</p>
          )}
        </section>
      </main>
    </>
  )
}
