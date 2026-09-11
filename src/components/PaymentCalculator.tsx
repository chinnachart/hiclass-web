'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import Icon from './Icons'
import { baht } from '@/lib/format'
import { financeTable, TERMS } from '@/lib/finance'
import type { CarModel, SiteSettings } from '@/lib/types'

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
  const ft = useMemo(() => financeTable(settings), [settings])
  const downOpts = useMemo(() => [...ft.downs].sort((a, b) => a - b), [ft])
  const [modelIdx, setModelIdx] = useState(0)
  const [down, setDown] = useState(ft.defaultDown)
  const [term, setTerm] = useState(ft.defaultTerm)
  const model = fixedModel ?? models[modelIdx]

  const r = useMemo(
    () => (model ? ft.pay(model.priceFrom, down, term) : { down: 0, financed: 0, perMonth: 0, rate: 0 }),
    [model, down, term, ft],
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
          <span style={{ fontSize: 13, fontWeight: 600 }}>เงินดาวน์</span>
          <b>{down}% · {baht(r.down)} บาท</b>
        </div>
        <div className="terms" role="group" aria-label="เงินดาวน์" style={{ gridTemplateColumns: `repeat(${downOpts.length}, minmax(0, 1fr))` }}>
          {downOpts.map((d) => (
            <button key={d} type="button" className={down === d ? 'on' : ''} onClick={() => setDown(d)} aria-pressed={down === d}>
              {d}%
            </button>
          ))}
        </div>
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
        <div className="rrow"><span>ดอกเบี้ยคงที่ต่อปี</span><b>{r.rate}%</b></div>
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
        ดอกเบี้ยคงที่ {r.rate}% ต่อปี ตามเงินดาวน์และจำนวนงวดที่เลือก · {settings.financeNote || 'ตัวเลขเป็นการประมาณเบื้องต้น เงื่อนไขจริงขึ้นอยู่กับสถาบันการเงิน'}
      </p>
    </div>
  )
}
