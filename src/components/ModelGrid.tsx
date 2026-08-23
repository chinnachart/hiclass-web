'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { baht } from '@/lib/format'
import type { CarModel, Media } from '@/lib/types'

const FILTERS = [
  { key: 'all', label: 'ทั้งหมด' },
  { key: 'suv', label: 'SUV' },
  { key: 'sedan', label: 'ซีดาน' },
  { key: 'hatch', label: 'แฮทช์แบ็ก' },
  { key: 'mpv', label: 'MPV / 7 ที่นั่ง' },
]

const img = (v: CarModel['heroImage']): Media | null =>
  v && typeof v === 'object' ? (v as Media) : null

export default function ModelGrid({ models }: { models: CarModel[] }) {
  const [filter, setFilter] = useState('all')
  const shown = models.filter((m) => filter === 'all' || m.bodyType === filter)

  return (
    <>
      <div className="pills">
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

      <div className="models">
        {shown.map((m) => {
          const hero = img(m.heroImage)
          return (
            <article className="model" key={m.id}>
              <div className="model-stage">
                <span className="model-name">{m.name}</span>
                {hero?.url ? (
                  <Image
                    src={hero.url}
                    alt={hero.alt || m.name}
                    fill
                    sizes="(max-width: 700px) 100vw, 300px"
                    style={{ objectFit: 'contain', objectPosition: 'center 70%' }}
                  />
                ) : (
                  <span className="ph">ยังไม่ได้ใส่รูป</span>
                )}
              </div>
              <div className="model-body">
                <span className="model-type">{m.tagline}</span>
                <div className="specs">
                  <div>
                    <b>{baht(m.priceFrom)}</b>
                    <span>เริ่มต้น (บาท)</span>
                  </div>
                  {m.rangeKm ? (
                    <div>
                      <b>{m.rangeKm}</b>
                      <span>กม./ชาร์จ</span>
                    </div>
                  ) : null}
                  {m.colorsCount ? (
                    <div>
                      <b>{m.colorsCount}</b>
                      <span>สีให้เลือก</span>
                    </div>
                  ) : null}
                </div>
                <div className="card-acts">
                  <Link className="a1" href={`/test-drive?model=${encodeURIComponent(m.name)}`}>
                    นัดลองขับ
                  </Link>
                  <Link className="a2" href={`/car-model/${m.slug}`}>
                    รายละเอียด →
                  </Link>
                </div>
              </div>
            </article>
          )
        })}
      </div>
    </>
  )
}
