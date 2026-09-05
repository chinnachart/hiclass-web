'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import Icon from './Icons'
import { baht } from '@/lib/format'
import { monthlyPayment } from '@/lib/finance'
import type { CarModel, SiteSettings } from '@/lib/types'

const TERMS = [48, 60, 72, 84]

/**
 * เครื่องคำนวณค่างวด — ใช้ทั้งหน้าแรก (เลือกรุ่นได้) และหน้ารุ่นรถ (ล็อกรุ่น)
 */
export default function PaymentCalculator({
  models,
  settings,
  fixedModel,
  compact = false,
}: {
  models: CarModel[]
  settings: SiteSettings
  fixedModel?: CarModel
  compact?: boolean
}) {
  const [modelIdx, setModelIdx] = useState(0)
  const [down, setDown] = useState(settings.defaultDownPercent ?? 20)
  const [term, setTerm] = useState(settings.defaultTerm ?? 60)
  const model = fixedModel ?? models[modelIdx]
  const rate = settings.financeRate ?? 0

  const r = useMemo(
    () => (model ? monthlyPayment(model.priceFrom, down, term, rate) : { down: 0, financed: 0, perMonth: 0 }),
    [model, down, term, rate],
  )
  if (!model) return null

  return (
    <div className="card calc">
      {!compact ? (
        <div>
          <h2>คำนวณค่างวดใน 30 วินาที</h2>
          <p className="hint">เลือกรุ่นและปรับเงื่อนไข ค่างวดขยับทันที</p>
        </div>
      ) : null}

      {!fixedModel ? (
        <div className="field">
          <label htmlFor="calc-model">รุ่นที่สนใจ</label>
          <select id="calc-model" value={modelIdx} onChange={(e) => setModelIdx(Number(e.target.value))}>
            {models.map((m, i) => (
              <option key={m.id} value={i}>{m.name} — {m.tagline}</option>
            ))}
          </select>
        </div>
      ) : null}

      <div className="field">
        <div className="range-head">
          <label htmlFor="calc-down">เงินดาวน์</label>
          <b>{down}% · {baht(r.down)} บาท</b>
        </div>
        <input id="calc-down" type="range" min={0} max={50} step={5} value={down} onChange={(e) => setDown(Number(e.target.value))} />
      </div>

      <div className="field">
        <div className="range-head">
          <span style={{ fontSize: 13, fontWeight: 600 }}>จำนวนงวด</span>
          <b>{term} งวด</b>
        </div>
        <div className="terms" role="group" aria-label="จำนวนงวด">
          {TERMS.map((t) => (
            <button key={t} type="button" className={term === t ? 'on' : ''} onClick={() => setTerm(t)} aria-pressed={term === t}>
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="result">
        <div className="rrow"><span>ราคารถ</span><b>{baht(model.priceFrom)} บาท</b></div>
        <div className="rrow"><span>ยอดจัดไฟแนนซ์</span><b>{baht(r.financed)} บาท</b></div>
        <div className="rrow hi"><span>ผ่อนต่อเดือนประมาณ</span><b>{baht(r.perMonth)} ฿</b></div>
      </div>

      <Link
        className="btn btn-red btn-lg btn-block"
        href={`/test-drive?model=${encodeURIComponent(model.name)}&down=${down}&term=${term}&monthly=${r.perMonth}`}
      >
        <Icon name="wheel" size={20} color="#fff" />
        นัดทดลองขับ {model.name}
      </Link>
      <p className="fineprint">
        ดอกเบี้ย {rate}% ต่อปี (แบบคงที่) · {settings.financeNote || 'ตัวเลขเป็นการประมาณเบื้องต้น เงื่อนไขจริงขึ้นอยู่กับสถาบันการเงิน'}
      </p>
    </div>
  )
}
