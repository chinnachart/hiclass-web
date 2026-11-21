import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { fetchOutingRows, latestPerPerson, outingKeyOk, OUTING_COLS, type OutingRow } from '@/lib/outingData'

// หน้าดูผลแบบสำรวจ Outing 2570 — เข้าได้เฉพาะลิงก์ที่มี ?key= ถูกต้อง (คีย์ผิด = 404)
export const metadata: Metadata = {
  title: 'ผลแบบสำรวจ Outing ปีใหม่ 2570',
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
  referrer: 'no-referrer',
}
export const dynamic = 'force-dynamic'

const count = (rows: OutingRow[], pick: (r: OutingRow) => string | null) => {
  const m = new Map<string, number>()
  rows.forEach((r) => {
    const v = pick(r)
    if (v) m.set(v, (m.get(v) || 0) + 1)
  })
  return [...m.entries()].sort((a, b) => b[1] - a[1])
}

const countMany = (rows: OutingRow[], pick: (r: OutingRow) => string[]) => {
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

export default async function OutingResults({ searchParams }: { searchParams: Promise<{ key?: string }> }) {
  const sp = await searchParams
  const key = sp.key || ''
  if (!outingKeyOk(key)) notFound()
  const all = await fetchOutingRows()
  if (!all) {
    return (
      <main className="container section">
        <p>อ่านข้อมูลไม่สำเร็จ ลองรีเฟรชอีกครั้ง</p>
      </main>
    )
  }
  const rows = latestPerPerson(all)
  const yes = rows.filter((r) => r.attend)
  const no = rows.filter((r) => !r.attend)
  const drinkers = yes.filter((r) => r.alcohol === 'ดื่ม')
  const stat: [string, number][] = [['ตอบแล้ว', rows.length], ['เข้าร่วม', yes.length], ['ไม่เข้าร่วม', no.length], ['รถบัส', yes.filter((r) => r.transport === 'รถบัส').length], ['รถส่วนตัว', yes.filter((r) => r.transport === 'รถส่วนตัว').length]]
  const foods = yes.filter((r) => r.food_limit && !/^(ไม่มี|ไม่แพ้|ไม่|-|no|none)\s*(ครับ|ค่ะ|คะ)?$/i.test(r.food_limit.trim()))
  const th: React.CSSProperties = { textAlign: 'left', padding: '8px 10px', borderBottom: '2px solid var(--line)', whiteSpace: 'nowrap', fontSize: 13 }
  const td: React.CSSProperties = { padding: '8px 10px', borderBottom: '1px solid var(--line)', fontSize: 13, verticalAlign: 'top' }
  const list = rows.slice().reverse()

  return (
    <main className="container section" style={{ display: 'grid', gap: 16 }}>
      <div>
        <h1 style={{ fontSize: 26 }}>ผลแบบสำรวจ Outing ปีใหม่ 2570</h1>
        <p className="mute" style={{ fontSize: 14 }}>
          นับคำตอบล่าสุดของแต่ละคน (คำตอบทั้งหมดที่ส่งเข้ามา {all.length} ครั้ง) |{' '}
          <a href={`/api/outing/export?key=${encodeURIComponent(key)}&dl=1`} style={{ color: 'var(--red)', fontWeight: 600 }}>ดาวน์โหลด CSV ทุกคำตอบ</a>
        </p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 10 }}>
        {stat.map(([k, n]) => (
          <div key={k} className="card" style={{ padding: 14 }}>
            <b style={{ fontSize: 26, display: 'block' }}>{n}</b>
            <span className="mute" style={{ fontSize: 13 }}>{k}</span>
          </div>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 12 }}>
        <Bars title="เข้าร่วม แยกสาขา" data={count(yes, (r) => r.branch)} total={yes.length} />
        <Bars title="เข้าร่วม แยกแผนก" data={count(yes, (r) => r.department)} total={yes.length} />
        <Bars title="ศาสนา (ผู้เข้าร่วม)" data={count(yes, (r) => r.religion)} total={yes.length} />
        <Bars title="แอลกอฮอล์ (ผู้เข้าร่วม)" data={count(yes, (r) => r.alcohol)} total={yes.length} />
        <Bars title="ประเภทที่ดื่ม (คนหนึ่งเลือกได้หลายอย่าง)" data={countMany(drinkers, (r) => r.alcohol_types || (r.alcohol_type ? r.alcohol_type.split(', ') : []))} total={drinkers.length} />
        <Bars title="เบียร์ที่ทานได้สูงสุด" data={count(drinkers, (r) => r.beer_amount)} total={drinkers.filter((r) => r.beer_amount).length} />
        <Bars title="เหล้าที่ทานได้สูงสุด" data={count(drinkers, (r) => r.liquor_amount)} total={drinkers.filter((r) => r.liquor_amount).length} />
        <Bars title="ทานเหล้ากับ" data={countMany(drinkers, (r) => r.mixers || [])} total={drinkers.filter((r) => r.liquor_amount).length} />
        <Bars title="ไม่เข้าร่วม แยกสาขา" data={count(no, (r) => r.branch)} total={no.length} />
      </div>
      <div className="card" style={{ padding: 16 }}>
        <h3 style={{ fontSize: 16, marginBottom: 8 }}>แพ้อาหาร / ข้อจำกัดด้านอาหาร ({foods.length} คน)</h3>
        {foods.length ? (
          <ul style={{ margin: 0, paddingLeft: 20, fontSize: 14, display: 'grid', gap: 4 }}>
            {foods.map((r) => <li key={r.id}><b>{r.full_name}</b> ({r.branch}): {r.food_limit}</li>)}
          </ul>
        ) : (
          <p className="mute" style={{ fontSize: 14 }}>ยังไม่มีข้อมูล</p>
        )}
      </div>
      <div className="card" style={{ padding: 16, overflowX: 'auto' }}>
        <h3 style={{ fontSize: 16, marginBottom: 8 }}>รายชื่อทั้งหมด ({list.length} คน)</h3>
        <table style={{ borderCollapse: 'collapse', width: '100%', minWidth: 900 }}>
          <thead>
            <tr>{OUTING_COLS.map(([h]) => <th key={h} style={th}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {list.map((r) => (
              <tr key={r.id}>{OUTING_COLS.map(([h, f]) => <td key={h} style={td}>{f(r)}</td>)}</tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  )
}
