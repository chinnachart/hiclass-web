'use client'

import { useState } from 'react'
import Link from 'next/link'
import { baht } from '@/lib/format'
import { monthlyPayment } from '@/lib/finance'
import type { CarModel, SiteSettings } from '@/lib/types'

const TERMS = [48, 60, 72, 84]

export default function PriceTable({
  models,
  settings,
}: {
  models: CarModel[]
  settings: SiteSettings
}) {
  const [down, setDown] = useState(settings.defaultDownPercent ?? 20)
  const [term, setTerm] = useState(settings.defaultTerm ?? 60)
  const rate = settings.financeRate ?? 0

  return (
    <>
      <div className="ctl">
        <div className="ctl-item">
          <label htmlFor="pt-down">เงินดาวน์ <b>{down}%</b></label>
          <input
            id="pt-down" type="range" min={0} max={50} step={5}
            value={down} onChange={(e) => setDown(Number(e.target.value))}
          />
        </div>
        <div className="ctl-item">
          <span className="ctl-label">จำนวนงวด</span>
          <div className="seg">
            {TERMS.map((t) => (
              <button
                key={t} type="button"
                className={`seg-b${term === t ? ' on' : ''}`}
                onClick={() => setTerm(t)}
                aria-pressed={term === t}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
        <p className="ctl-note">ดอกเบี้ยคงที่ {rate}% ต่อปี</p>
      </div>

      <div className="scroller">
        <table className="price">
          <thead>
            <tr>
              <th>รุ่น</th>
              <th className="r">ราคาเริ่มต้น</th>
              <th className="r">เงินดาวน์ {down}%</th>
              <th className="r">ยอดจัด</th>
              <th className="r">ผ่อน/เดือน</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {models.map((m) => {
              const { down: d, financed, perMonth } = monthlyPayment(m.priceFrom, down, term, rate)
              return (
                <tr key={m.id}>
                  <td>
                    <Link href={`/car-model/${m.slug}`} className="mname">BYD {m.name}</Link>
                    <span className="mtag">{m.tagline}</span>
                  </td>
                  <td className="r n">{baht(m.priceFrom)}</td>
                  <td className="r n dim">{baht(d)}</td>
                  <td className="r n dim">{baht(financed)}</td>
                  <td className="r n hi">{baht(perMonth)}</td>
                  <td className="r">
                    <Link className="mini" href={`/test-drive?model=${encodeURIComponent(m.name)}`}>ลองขับ</Link>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </>
  )
}
