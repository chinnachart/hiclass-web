'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { toast } from '@payloadcms/ui'
import { AdminIcon as Ic } from './AdminIcons'
import { monthlyPayment } from '@/lib/finance'

export type PriceRow = {
  id: number
  name: string
  tagline: string
  priceFrom: number
  rangeKm: number | null
  published: boolean
  hasImage: boolean
  rentalAvailable: boolean
  rentalDaily: number | null
  rentalMonthly: number | null
}

type Draft = { priceFrom: string; rangeKm: string; rentalDaily: string; rentalMonthly: string; published: boolean }

const fmt = (n: number) => n.toLocaleString('th-TH', { maximumFractionDigits: 0 })
const num = (s: string) => {
  const v = Number(String(s).replace(/[^0-9.]/g, ''))
  return Number.isFinite(v) ? v : 0
}

/**
 * ตารางแก้ราคาทุกรุ่น — พิมพ์ตัวเลข ค่างวดคำนวณให้ กดบันทึกทีเดียว
 * บันทึกผ่าน REST ของ Payload (ใช้ cookie login ของหลังบ้าน) แล้วเว็บอัปเดตทันที
 */
export function PriceEditor({ rows, rate, downPercent, term }: { rows: PriceRow[]; rate: number; downPercent: number; term: number }) {
  const initial = useMemo(
    () =>
      Object.fromEntries(
        rows.map((r) => [
          r.id,
          {
            priceFrom: String(r.priceFrom ?? ''),
            rangeKm: r.rangeKm != null ? String(r.rangeKm) : '',
            rentalDaily: r.rentalDaily != null ? String(r.rentalDaily) : '',
            rentalMonthly: r.rentalMonthly != null ? String(r.rentalMonthly) : '',
            published: r.published,
          } satisfies Draft,
        ]),
      ) as Record<number, Draft>,
    [rows],
  )
  const [draft, setDraft] = useState<Record<number, Draft>>(initial)
  const [saved, setSaved] = useState<Record<number, Draft>>(initial)
  const [saving, setSaving] = useState(false)
  const [showRental, setShowRental] = useState(rows.some((r) => r.rentalAvailable))

  const changed = rows.filter((r) => JSON.stringify(draft[r.id]) !== JSON.stringify(saved[r.id]))

  const set = (id: number, key: keyof Draft, value: string | boolean) =>
    setDraft((d) => ({ ...d, [id]: { ...d[id], [key]: value } }))

  async function save() {
    if (changed.length === 0) return
    setSaving(true)
    let ok = 0
    const failed: string[] = []
    for (const r of changed) {
      const d = draft[r.id]
      const body: Record<string, unknown> = {
        priceFrom: num(d.priceFrom),
        rangeKm: d.rangeKm ? num(d.rangeKm) : null,
        published: d.published,
      }
      if (showRental) {
        body.rentalDaily = d.rentalDaily ? num(d.rentalDaily) : null
        body.rentalMonthly = d.rentalMonthly ? num(d.rentalMonthly) : null
        body.rentalAvailable = !!(d.rentalDaily || d.rentalMonthly)
      }
      try {
        const res = await fetch(`/api/car-models/${r.id}`, {
          method: 'PATCH',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        })
        if (!res.ok) throw new Error(await res.text())
        ok++
        setSaved((s) => ({ ...s, [r.id]: d }))
      } catch {
        failed.push(r.name)
      }
    }
    setSaving(false)
    if (ok) toast.success(`บันทึกแล้ว ${ok} รุ่น — เว็บอัปเดตทันที`)
    if (failed.length) toast.error(`บันทึกไม่สำเร็จ: ${failed.join(', ')}`)
  }

  return (
    <div>
      <div className="hc-dash__head">
        <div>
          <h1 className="hc-dash__title">รุ่นรถ &amp; ราคา</h1>
          <p className="hc-dash__sub">
            พิมพ์ตัวเลขในช่องแล้วกดบันทึก ค่างวดคำนวณให้อัตโนมัติ (ดาวน์ {downPercent}% · {term} งวด · {rate}%)
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <label className="hc-check">
            <input type="checkbox" checked={showRental} onChange={(e) => setShowRental(e.target.checked)} />
            แสดงช่องค่าเช่า
          </label>
          <button
            type="button"
            className="hc-btn hc-btn--ghost"
            disabled={changed.length === 0 || saving}
            onClick={() => setDraft(saved)}
          >
            ยกเลิก
          </button>
          <button type="button" className="hc-btn hc-btn--red" disabled={changed.length === 0 || saving} onClick={save}>
            <Ic name="check" size={16} color="#fff" />
            {saving ? 'กำลังบันทึก…' : changed.length ? `บันทึก ${changed.length} รายการที่แก้` : 'ไม่มีอะไรเปลี่ยน'}
          </button>
        </div>
      </div>

      <div className="hc-table">
        <div className={`hc-tr hc-tr--head${showRental ? ' hc-tr--rental' : ''}`}>
          <span>รุ่น</span>
          <span>ราคาเริ่มต้น (บาท)</span>
          <span>ระยะทาง/ชาร์จ (กม.)</span>
          {showRental ? <span>เช่า/วัน</span> : null}
          {showRental ? <span>เช่า/เดือน</span> : null}
          <span>ค่างวดโดยประมาณ</span>
          <span>แสดงบนเว็บ</span>
        </div>
        {rows.map((r) => {
          const d = draft[r.id]
          const dirty = JSON.stringify(d) !== JSON.stringify(saved[r.id])
          const { perMonth } = monthlyPayment(num(d.priceFrom), downPercent, term, rate)
          return (
            <div className={`hc-tr${dirty ? ' hc-tr--dirty' : ''}${showRental ? ' hc-tr--rental' : ''}`} key={r.id}>
              <span className="hc-td-name">
                <Link href={`/admin/collections/car-models/${r.id}`}>{r.name}</Link>
                <small>{r.tagline}{!r.hasImage ? ' · ยังไม่มีรูป' : ''}</small>
              </span>
              <span>
                <input
                  className="hc-input hc-input--num"
                  inputMode="numeric"
                  value={d.priceFrom}
                  onChange={(e) => set(r.id, 'priceFrom', e.target.value)}
                  aria-label={`ราคา ${r.name}`}
                />
              </span>
              <span>
                <input
                  className="hc-input hc-input--num"
                  inputMode="numeric"
                  value={d.rangeKm}
                  placeholder="—"
                  onChange={(e) => set(r.id, 'rangeKm', e.target.value)}
                  aria-label={`ระยะทาง ${r.name}`}
                />
              </span>
              {showRental ? (
                <span>
                  <input className="hc-input hc-input--num" inputMode="numeric" value={d.rentalDaily} placeholder="—" onChange={(e) => set(r.id, 'rentalDaily', e.target.value)} aria-label={`ค่าเช่ารายวัน ${r.name}`} />
                </span>
              ) : null}
              {showRental ? (
                <span>
                  <input className="hc-input hc-input--num" inputMode="numeric" value={d.rentalMonthly} placeholder="—" onChange={(e) => set(r.id, 'rentalMonthly', e.target.value)} aria-label={`ค่าเช่ารายเดือน ${r.name}`} />
                </span>
              ) : null}
              <span className="hc-td-calc">
                ≈ <strong>{fmt(perMonth)}</strong> ฿/เดือน
              </span>
              <span>
                <label className="hc-check">
                  <input type="checkbox" checked={d.published} onChange={(e) => set(r.id, 'published', e.target.checked)} />
                  {d.published ? 'แสดง' : 'ซ่อน'}
                </label>
              </span>
            </div>
          )
        })}
      </div>
      <p className="hc-muted" style={{ marginTop: 12 }}>
        กรอกตัวเลขล้วน ไม่ต้องใส่ลูกน้ำ · ต้องการแก้สเปก รูป หรือคำถามที่พบบ่อยของรุ่นไหน กดที่ชื่อรุ่น
      </p>
    </div>
  )
}
