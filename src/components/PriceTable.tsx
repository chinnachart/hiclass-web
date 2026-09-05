'use client'

import { useState } from 'react'
import Link from 'next/link'
import { baht } from '@/lib/format'
import { monthlyPayment } from '@/lib/finance'
import type { CarModel, SiteSettings } from '@/lib/types'

const TERMS = [48, 60, 72, 84]

/** ตารางราคา/ค่างวดทุกรุ่น — เดสก์ท็อปเป็นตาราง มือถือเป็นการ์ด */
export default function PriceTable({ models, settings }: { models: CarModel[]; settings: SiteSettings }) {
  const [down, setDown] = useState(settings.defaultDownPercent ?? 20)
  const [term, setTerm] = useState(settings.defaultTerm ?? 60)
  const rate = settings.financeRate ?? 0
  const rows = models.map((m) => ({ m, ...monthlyPayment(m.priceFrom, down, term, rate) }))

  return (
    <div className="stack" style={{ gap: 14 }}>
      <div className="card calc" style={{ gap: 12 }}>
        <div className="grid-2">
          <div className="field">
            <div className="range-head">
              <label htmlFor="pt-down">เงินดาวน์</label>
              <b>{down}%</b>
            </div>
            <input id="pt-down" type="range" min={0} max={50} step={5} value={down} onChange={(e) => setDown(Number(e.target.value))} />
          </div>
          <div className="field">
            <div className="range-head">
              <span style={{ fontSize: 13, fontWeight: 600 }}>จำนวนงวด</span>
              <b>{term} งวด</b>
            </div>
            <div className="terms">
              {TERMS.map((t) => (
                <button key={t} type="button" className={term === t ? 'on' : ''} onClick={() => setTerm(t)} aria-pressed={term === t}>{t}</button>
              ))}
            </div>
          </div>
        </div>
        <p className="fineprint">ดอกเบี้ยคงที่ {rate}% ต่อปี · ตัวเลขเป็นการประมาณเบื้องต้น เงื่อนไขจริงขึ้นกับสถาบันการเงิน</p>
      </div>

      <div className="price-table">
        <table>
          <thead>
            <tr>
              <th>รุ่น</th>
              <th style={{ textAlign: 'right' }}>ราคาเริ่มต้น</th>
              <th style={{ textAlign: 'right' }}>ดาวน์ {down}%</th>
              <th style={{ textAlign: 'right' }}>ยอดจัด</th>
              <th style={{ textAlign: 'right' }}>ผ่อน/เดือน</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ m, down: d, financed, perMonth }) => (
              <tr key={m.id}>
                <td>
                  <Link href={`/car-model/${m.slug}`} style={{ fontWeight: 600 }}>BYD {m.name}</Link>
                  <span className="mute small" style={{ display: 'block' }}>{m.tagline}</span>
                </td>
                <td className="num">{baht(m.priceFrom)}</td>
                <td className="num mute">{baht(d)}</td>
                <td className="num mute">{baht(financed)}</td>
                <td className="num hi">{baht(perMonth)}</td>
                <td style={{ textAlign: 'right' }}>
                  <Link className="btn btn-red" style={{ height: 36, padding: '0 14px', fontSize: 13 }} href={`/test-drive?model=${encodeURIComponent(m.name)}`}>ลองขับ</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="price-cards">
        {rows.map(({ m, financed, perMonth }) => (
          <div className="card price-card" key={m.id}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <Link href={`/car-model/${m.slug}`} className="display" style={{ fontSize: 17 }}>BYD {m.name}</Link>
              <span className="mute small">{m.tagline}</span>
            </div>
            <div className="r"><span>ราคาเริ่มต้น</span><b>{baht(m.priceFrom)}</b></div>
            <div className="r"><span>ยอดจัด (ดาวน์ {down}%)</span><b>{baht(financed)}</b></div>
            <div className="r hi"><span>ผ่อน {term} งวด</span><b>{baht(perMonth)} ฿/เดือน</b></div>
            <Link className="btn btn-red" href={`/test-drive?model=${encodeURIComponent(m.name)}`}>นัดทดลองขับ</Link>
          </div>
        ))}
      </div>
    </div>
  )
}
