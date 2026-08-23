'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { baht } from '@/lib/format'
import type { CarModel, SiteSettings } from '@/lib/types'

export default function PaymentCalculator({
  models,
  settings,
}: {
  models: CarModel[]
  settings: SiteSettings
}) {
  const [modelIdx, setModelIdx] = useState(0)
  const [down, setDown] = useState(settings.defaultDownPercent ?? 20)
  const [term, setTerm] = useState(settings.defaultTerm ?? 60)

  const model = models[modelIdx]

  const { downAmount, financed, perMonth } = useMemo(() => {
    if (!model) return { downAmount: 0, financed: 0, perMonth: 0 }
    const rate = (settings.financeRate ?? 0) / 100
    const d = Math.round((model.priceFrom * down) / 100)
    const f = model.priceFrom - d
    const p = f > 0 ? Math.round((f + f * rate * (term / 12)) / term) : 0
    return { downAmount: d, financed: f, perMonth: p }
  }, [model, down, term, settings.financeRate])

  if (!model) return null

  return (
    <div className="finder">
      <h2>คำนวณค่างวดใน 30 วินาที</h2>
      <p className="hint">เลือกรุ่นและปรับเงื่อนไข ดูค่างวดขยับทันที</p>

      <div className="field">
        <label htmlFor="calc-model">รุ่นที่สนใจ</label>
        <select
          id="calc-model"
          value={modelIdx}
          onChange={(e) => setModelIdx(Number(e.target.value))}
        >
          {models.map((m, i) => (
            <option key={m.id} value={i}>
              {m.name} — {m.tagline}
            </option>
          ))}
        </select>
      </div>

      <div className="field">
        <label htmlFor="calc-down">เงินดาวน์</label>
        <div className="range-head">
          <span style={{ fontSize: 13, color: 'var(--dimmer)' }}>เปอร์เซ็นต์ของราคารถ</span>
          <span className="range-val">{down}%</span>
        </div>
        <input
          id="calc-down"
          type="range"
          min={0}
          max={50}
          step={5}
          value={down}
          onChange={(e) => setDown(Number(e.target.value))}
        />
      </div>

      <div className="field">
        <label htmlFor="calc-term">จำนวนงวด</label>
        <div className="range-head">
          <span style={{ fontSize: 13, color: 'var(--dimmer)' }}>ระยะเวลาผ่อน</span>
          <span className="range-val">{term} งวด</span>
        </div>
        <input
          id="calc-term"
          type="range"
          min={12}
          max={84}
          step={12}
          value={term}
          onChange={(e) => setTerm(Number(e.target.value))}
        />
      </div>

      <div className="result">
        <div className="rrow"><span>ราคารถ</span><b>{baht(model.priceFrom)} บาท</b></div>
        <div className="rrow"><span>เงินดาวน์</span><b>{baht(downAmount)} บาท</b></div>
        <div className="rrow"><span>ยอดจัดไฟแนนซ์</span><b>{baht(financed)} บาท</b></div>
        <div className="rrow hi"><span>ผ่อนต่อเดือน</span><b>{baht(perMonth)} ฿/เดือน</b></div>
      </div>

      <Link
        className="btn"
        href={`/test-drive?model=${encodeURIComponent(model.name)}&down=${down}&term=${term}&monthly=${perMonth}`}
      >
        ให้เซลส์ติดต่อกลับพร้อมข้อเสนอนี้
      </Link>
      {settings.financeNote ? <p className="fineprint">{settings.financeNote}</p> : null}
    </div>
  )
}
