'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import s from './ModelCarousel.module.css'
import CallPicker from './CallPicker'
import type { Branch } from '@/lib/types'

export type CarouselModel = {
  name: string
  slug: string
  tagline: string
  priceFrom: number
  rangeKm?: number | null
  powertrain?: 'ev' | 'phev' | null
  img?: string | null
  alt?: string | null
}

/** Hero หน้าแรก: การ์ดรถปัดซ้าย-ขวาทุกรุ่น (แทนสไลด์ข้อเสนอเดิม · 1 พ.ย. 2026) */
export default function ModelCarousel({ models, lineUrl, branches = [] }: { models: CarouselModel[]; lineUrl?: string | null; branches?: Branch[] }) {
  const track = useRef<HTMLDivElement>(null)
  const chips = useRef<HTMLDivElement>(null)
  const [cur, setCur] = useState(0)
  const [auto, setAuto] = useState(true)

  const go = (i: number) => {
    const t = track.current
    const c = t?.children[i] as HTMLElement | undefined
    if (t && c) t.scrollTo({ left: c.offsetLeft - 20, behavior: 'smooth' })
  }

  useEffect(() => {
    const t = track.current
    if (!t) return
    const onScroll = () => {
      const first = t.children[0] as HTMLElement | undefined
      if (!first) return
      const i = Math.round(t.scrollLeft / (first.offsetWidth + 12))
      setCur(Math.max(0, Math.min(models.length - 1, i)))
    }
    t.addEventListener('scroll', onScroll, { passive: true })
    return () => t.removeEventListener('scroll', onScroll)
  }, [models.length])

  useEffect(() => {
    const c = chips.current?.children[cur] as HTMLElement | undefined
    const box = chips.current
    if (c && box) box.scrollTo({ left: c.offsetLeft - box.clientWidth / 2 + c.offsetWidth / 2, behavior: 'smooth' })
  }, [cur])

  useEffect(() => {
    if (!auto || models.length < 2) return
    const id = setInterval(() => go((cur + 1) % models.length), 4000)
    return () => clearInterval(id)
  }, [auto, cur, models.length])

  const stop = () => setAuto(false)
  const line = lineUrl || '/contact'

  return (
    <section className={s.hero}>
      <div className={s.kicker}>BYD Hi-Class EV Car · ยอดส่งมอบทั้งกรุ๊ป 10,000+ คัน</div>
      {/* เจ้าของสั่ง 13 พ.ย. 2569: เหลือหัวข้อบรรทัดเดียว ตัด "เลือก BYD ที่ใช่" และบรรทัดรอง */}
      <h1 className={s.title}>
        <em>รับดีลพิเศษ Motor Expo</em>
      </h1>

      <div className={s.chips} ref={chips}>
        {models.map((m, i) => (
          <button key={m.slug} type="button" className={`${s.chip} ${i === cur ? s.chipOn : ''}`} onClick={() => { stop(); go(i) }}>
            {m.name}
          </button>
        ))}
      </div>

      <div className={s.track} ref={track} onTouchStart={stop} onPointerDown={stop} onWheel={stop}>
        {models.map((m, i) => (
          <article key={m.slug} className={s.card}>
            <div className={s.top}>
              <span className={`${s.tag} ${m.powertrain === 'phev' ? s.tagPhev : ''}`}>{m.powertrain === 'phev' ? 'ไฮบริด DM-i' : 'ไฟฟ้า 100%'}</span>
              <span className={s.count}>{i + 1}/{models.length}</span>
            </div>
            <div className={s.name}>{m.name}</div>
            <div className={s.tl}>{m.tagline}</div>
            <Link href={`/car-model/${m.slug}`} className={s.car}>
              {m.img?.startsWith('http') ? (
                // eslint-disable-next-line @next/next/no-img-element -- รูปจากโดเมนจริง (ใช้ในหน้าทดลองเท่านั้น)
                <img src={m.img} alt={m.alt || `BYD ${m.name}`} loading={i < 2 ? 'eager' : 'lazy'} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'contain' }} />
              ) : m.img ? (
                <Image src={m.img} alt={m.alt || `BYD ${m.name}`} fill sizes="(max-width: 700px) 86vw, 420px" priority={i < 2} style={{ objectFit: 'contain' }} />
              ) : null}
            </Link>
            <div className={s.specs}>
              <div className={s.spec}><small>ราคาเริ่มต้น</small><b>฿{m.priceFrom.toLocaleString('en-US')}</b></div>
              {m.rangeKm ? <div className={s.spec}><small>{m.powertrain === 'phev' ? 'วิ่งรวมสูงสุด' : 'วิ่งได้สูงสุด'}</small><b>{m.rangeKm.toLocaleString('en-US')} กม.</b></div> : null}
            </div>
            <div className={s.btns}>
              <Link className={`${s.btn} ${s.btnRed}`} href={`/test-drive?model=${encodeURIComponent(m.name)}`}>ทดลองขับ</Link>
              {!lineUrl && branches.some((b) => b.lineUrl) ? (
                // ไม่มี LINE กลาง → ให้เลือก LINE สาขา (เดิมพาไปหน้าติดต่อเรา)
                <CallPicker branches={branches} kind="line" noIcon label="ทักแชทรับดีล" className={`${s.btn} ${s.btnLine}`} />
              ) : (
                <a className={`${s.btn} ${s.btnLine}`} href={line} target={lineUrl ? '_blank' : undefined} rel="noopener">ทักแชทรับดีล</a>
              )}
            </div>
            <div className={s.deal}>มีดีลพิเศษเฉพาะรายคัน ถามในแชทได้</div>
          </article>
        ))}
      </div>

      <div className={s.nav}>
        <div className={s.dots}>{models.map((m, i) => <span key={m.slug} className={`${s.dot} ${i === cur ? s.dotOn : ''}`} />)}</div>
        <div className={s.hint}>ปัดเพื่อดูรุ่นอื่น →</div>
      </div>
      <Link className={s.all} href="/car-model">ดูรุ่นและราคาทั้งหมด</Link>
    </section>
  )
}
