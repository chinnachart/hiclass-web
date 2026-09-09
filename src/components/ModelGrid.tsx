'use client'

import { useState } from 'react'
import Link from 'next/link'
import CarImage from './CarImage'
import { baht } from '@/lib/format'
import type { CarModel } from '@/lib/types'

const FILTERS = [
  { key: 'all', label: 'ทั้งหมด' },
  { key: 'suv', label: 'SUV' },
  { key: 'sedan', label: 'ซีดาน' },
  { key: 'hatch', label: 'แฮทช์แบ็ก' },
  { key: 'mpv', label: 'MPV / 7 ที่นั่ง' },
]

export function ModelCard({ m }: { m: CarModel }) {
  return (
    <article className="card model">
      <Link href={`/car-model/${m.slug}`} className="model-stage" aria-label={`ดูรายละเอียด BYD ${m.name}`}>
        <CarImage media={m.heroImage} alt={`BYD ${m.name}`} />
      </Link>
      <div>
        <Link href={`/car-model/${m.slug}`} className="model-name">{m.name}</Link>
        <div className="model-type">
          {m.tagline}
          {m.rangeKm ? ` · ${m.rangeKm} กม.` : ''}
        </div>
      </div>
      <div className="model-price">
        <small>เริ่มต้น</small>
        <b>{baht(m.priceFrom)}</b>
      </div>
      <div className="model-acts">
        <Link className="btn btn-red" href={`/test-drive?model=${encodeURIComponent(m.name)}`}>นัดลองขับ</Link>
        <Link className="btn btn-soft" href={`/car-model/${m.slug}`}>รายละเอียด</Link>
      </div>
    </article>
  )
}

export default function ModelGrid({ models, limit, wide }: { models: CarModel[]; limit?: number; wide?: boolean }) {
  const [filter, setFilter] = useState('all')
  const shown = models.filter((m) => filter === 'all' || m.bodyType === filter).slice(0, limit ?? 100)

  return (
    <div className="stack" style={{ gap: 14 }}>
      <div className="pills" role="tablist">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            type="button"
            className={`pill${filter === f.key ? ' on' : ''}`}
            onClick={() => setFilter(f.key)}
            aria-pressed={filter === f.key}
          >
            {f.label}
          </button>
        ))}
      </div>
      <div className={`models${wide ? ' wide' : ''}`}>
        {shown.map((m) => <ModelCard key={m.id} m={m} />)}
      </div>
      {shown.length === 0 ? <p className="mute small">ยังไม่มีรุ่นในหมวดนี้</p> : null}
    </div>
  )
}
