'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import Icon from './Icons'
import CarImage from './CarImage'
import { baht } from '@/lib/format'
import { monthlyPayment } from '@/lib/finance'
import type { CarModel, SiteSettings } from '@/lib/types'

const MAX = 3

/** เครื่องมือเทียบรุ่น — เลือกชิป 2–3 รุ่น ตารางเรียงแถวตามหัวข้อสเปกที่ทีมกรอกในหลังบ้าน */
export default function CompareTool({ models, settings, initialSlugs }: { models: CarModel[]; settings: SiteSettings; initialSlugs: string[] }) {
  const valid = initialSlugs.filter((s) => models.some((m) => m.slug === s)).slice(0, MAX)
  const [picked, setPicked] = useState<string[]>(valid.length >= 2 ? valid : models.slice(0, 2).map((m) => m.slug))

  // เก็บรุ่นที่เลือกไว้ใน URL ให้แชร์ได้
  useEffect(() => {
    const url = new URL(window.location.href)
    url.searchParams.set('m', picked.join(','))
    window.history.replaceState(null, '', url.toString())
  }, [picked])

  const toggle = (slug: string) =>
    setPicked((p) => (p.includes(slug) ? p.filter((s) => s !== slug) : p.length >= MAX ? [...p.slice(1), slug] : [...p, slug]))

  const chosen = picked.map((s) => models.find((m) => m.slug === s)!).filter(Boolean)
  const rate = settings.financeRate ?? 0
  const down = settings.defaultDownPercent ?? 20
  const term = settings.defaultTerm ?? 60

  // รวมหัวข้อสเปกจากทุกรุ่นที่เลือก (เรียงตามลำดับที่พบครั้งแรก)
  const specLabels = useMemo(() => {
    const seen: string[] = []
    chosen.forEach((m) => (m.specs || []).forEach((s) => { if (!seen.includes(s.label)) seen.push(s.label) }))
    return seen
  }, [chosen])

  const cols = `minmax(120px, 1fr) repeat(${chosen.length}, minmax(140px, 1fr))`
  const cheapest = Math.min(...chosen.map((m) => m.priceFrom))
  const longest = Math.max(...chosen.map((m) => m.rangeKm || 0))

  return (
    <div className="stack" style={{ gap: 16 }}>
      <div className="chips" role="group" aria-label="เลือกรุ่นที่จะเทียบ">
        {models.map((m) => (
          <button key={m.id} type="button" className={`chip${picked.includes(m.slug) ? ' on' : ''}`} onClick={() => toggle(m.slug)} aria-pressed={picked.includes(m.slug)}>
            {m.name}
          </button>
        ))}
      </div>
      <p className="small mute">เลือกได้สูงสุด {MAX} รุ่น · กดซ้ำเพื่อเอาออก</p>

      {chosen.length < 2 ? (
        <div className="notice warn">เลือกอย่างน้อย 2 รุ่นเพื่อเปรียบเทียบ</div>
      ) : (
        <div className="price-table" style={{ display: 'block' }}>
          <div className="card" style={{ overflow: 'hidden', minWidth: 520 }}>
            <div style={{ display: 'grid', gridTemplateColumns: cols, gap: 0, borderBottom: '1px solid var(--line)' }}>
              <div style={{ padding: 14 }} />
              {chosen.map((m) => (
                <div key={m.id} style={{ padding: 14, borderLeft: '1px solid var(--line)', display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center', textAlign: 'center' }}>
                  <div style={{ position: 'relative', width: '100%', height: 70, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <CarImage media={m.heroImage} alt={`BYD ${m.name}`} sizes="200px" fallbackWidth={130} />
                  </div>
                  <Link href={`/car-model/${m.slug}`} className="display" style={{ fontSize: 17 }}>BYD {m.name}</Link>
                  <span className="small mute">{m.tagline}</span>
                </div>
              ))}
            </div>

            <Row label="ราคาเริ่มต้น" cols={cols}>
              {chosen.map((m) => <Cell key={m.id} hi={m.priceFrom === cheapest}>{baht(m.priceFrom)} ฿</Cell>)}
            </Row>
            <Row label={`ผ่อน/เดือน (ดาวน์ ${down}% · ${term} งวด)`} cols={cols}>
              {chosen.map((m) => <Cell key={m.id} hi={m.priceFrom === cheapest}>≈ {baht(monthlyPayment(m.priceFrom, down, term, rate).perMonth)} ฿</Cell>)}
            </Row>
            <Row label="ระยะทางต่อการชาร์จ" cols={cols}>
              {chosen.map((m) => <Cell key={m.id} hi={!!m.rangeKm && m.rangeKm === longest}>{m.rangeKm ? `${m.rangeKm} กม.` : '—'}</Cell>)}
            </Row>
            <Row label="จำนวนสี" cols={cols}>
              {chosen.map((m) => <Cell key={m.id}>{m.colorsCount ? `${m.colorsCount} สี` : '—'}</Cell>)}
            </Row>
            <Row label="รุ่นย่อย" cols={cols}>
              {chosen.map((m) => (
                <Cell key={m.id}>
                  {m.variants && m.variants.length > 0
                    ? m.variants.map((v) => <div key={v.name} style={{ fontSize: 13 }}>{v.name} · {baht(v.price)}</div>)
                    : '—'}
                </Cell>
              ))}
            </Row>
            {specLabels.map((label) => (
              <Row key={label} label={label} cols={cols}>
                {chosen.map((m) => <Cell key={m.id}>{m.specs?.find((s) => s.label === label)?.value || '—'}</Cell>)}
              </Row>
            ))}
            <Row label="ให้เช่า" cols={cols}>
              {chosen.map((m) => <Cell key={m.id}>{m.rentalAvailable && (m.rentalDaily || m.rentalMonthly) ? `มี · ${m.rentalDaily ? baht(m.rentalDaily) + '/วัน' : ''}` : '—'}</Cell>)}
            </Row>
            <div style={{ display: 'grid', gridTemplateColumns: cols }}>
              <div style={{ padding: 14 }} />
              {chosen.map((m) => (
                <div key={m.id} style={{ padding: 12, borderLeft: '1px solid var(--line)', display: 'grid', gap: 6 }}>
                  <Link className="btn btn-red" style={{ height: 40, fontSize: 13 }} href={`/test-drive?model=${encodeURIComponent(m.name)}`}><Icon name="wheel" size={16} color="#fff" />ลองขับ</Link>
                  <Link className="btn btn-soft" style={{ height: 40, fontSize: 13 }} href={`/price/${m.slug}`}>ตารางผ่อน</Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      {specLabels.length === 0 && chosen.length >= 2 ? (
        <p className="small mute">ยังไม่มีสเปกละเอียด — เมื่อทีมกรอก "ตารางสเปก" ในหลังบ้าน แถวสเปกจะเพิ่มขึ้นที่นี่อัตโนมัติ</p>
      ) : null}
    </div>
  )
}

function Row({ label, cols, children }: { label: string; cols: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: cols, borderBottom: '1px solid var(--line)' }}>
      <div style={{ padding: '12px 14px', fontSize: 13, color: 'var(--mute)', fontWeight: 600, background: 'var(--soft)' }}>{label}</div>
      {children}
    </div>
  )
}

function Cell({ children, hi }: { children: React.ReactNode; hi?: boolean }) {
  return (
    <div style={{ padding: '12px 14px', borderLeft: '1px solid var(--line)', textAlign: 'center', fontFamily: 'var(--font-display)', fontWeight: hi ? 600 : 500, color: hi ? 'var(--red)' : 'var(--ink)', fontSize: 15 }}>
      {children}
    </div>
  )
}
