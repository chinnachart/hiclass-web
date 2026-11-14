'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useRef, useState, type CSSProperties } from 'react'
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

/** สีเรืองใต้รถของแต่ละรุ่น (ตามสีรถในรูปหลัก) — รุ่นที่ไม่อยู่ในรายการใช้สีเงินกลาง */
const ACCENT: Record<string, string> = {
  'atto-3': '#7f9bc4',
  'sealion-6': '#8a94a6',
  'sealion-7': '#e23a4a',
  'sealion-5': '#5f8fd6',
  'atto-2': '#cfdcae',
  'atto-1': '#c8e63c',
  dolphin: '#6aa2e8',
}
const ACCENT_DEFAULT = '#b8c0cc'

/** ฉากหลังของการ์ด (ภาพสร้างด้วย AI ไม่มีรถ) — มีเฉพาะรุ่นที่ทำฉากแล้ว ไฟล์อยู่ใน public/scenes/ */
const SCENES: Record<string, string> = Object.fromEntries(
  ['atto-3', 'sealion-6', 'sealion-7', 'sealion-5', 'atto-2', 'atto-1', 'dolphin', 'seal-5', 'seal-6', 'm6'].map((x) => [x, `/scenes/${x}.webp`]),
)

/** ราคาไล่ขึ้นสั้นๆ ตอนการ์ดถูกเลือก (ปิดเองถ้าเครื่องตั้งค่าลดการเคลื่อนไหว) */
function CountUp({ value, active }: { value: number; active: boolean }) {
  const [v, setV] = useState(value)
  const first = useRef(true)
  useEffect(() => {
    if (first.current) { first.current = false; return }
    if (!active) { setV(value); return }
    if (typeof window === 'undefined' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const t0 = performance.now()
    const from = Math.round(value * 0.9)
    let raf = 0
    const tick = (t: number) => {
      const k = Math.min(1, (t - t0) / 450)
      const e = 1 - Math.pow(1 - k, 3)
      setV(k < 1 ? Math.round((from + (value - from) * e) / 100) * 100 : value)
      if (k < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [active, value])
  return <>฿{v.toLocaleString('en-US')}</>
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
      {/* 14 พ.ย. 2569: บรรทัดนี้เป็น h1 ของหน้าแรก (มีคำว่า BYD สำหรับ Google) หน้าตาเหมือนเดิม ส่วนหัวข้อใหญ่ด้านล่างเป็น p */}
      <div className={s.head}>
        <div>
          <h1 className={s.kicker}>BYD Hi-Class EV Car | ยอดส่งมอบทั้งกรุ๊ป 10,000+ คัน</h1>
          {/* เจ้าของสั่ง 13 พ.ย. 2569: เหลือหัวข้อบรรทัดเดียว ตัด "เลือก BYD ที่ใช่" และบรรทัดรอง */}
          <p className={s.title}>
            <em>รับดีลพิเศษ Motor Expo</em>
          </p>
        </div>
        {/* 14 พ.ย. 2569: ป้ายรางวัลด้านขวาของหัวกระดาษ ลิงก์ไปหน้ารางวัล */}
        <Link href="/awards" className={s.award}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M8 4h8v5a4 4 0 0 1-8 0V4z" /><path d="M8 6H5a3 3 0 0 0 3 4M16 6h3a3 3 0 0 1-3 4M12 13v4M8.5 20h7M10 17h4" /></svg>
          <span><b>BYD Dealer of the Year 2025</b><small>ดูรางวัลทั้งหมด</small></span>
        </Link>
      </div>

      <div className={s.chips} ref={chips}>
        {models.map((m, i) => (
          <button key={m.slug} type="button" className={`${s.chip} ${i === cur ? s.chipOn : ''}`} onClick={() => { stop(); go(i) }}>
            <span className={`${s.cdot} ${m.powertrain === 'phev' ? s.cdotPhev : ''}`} aria-hidden="true" />
            {m.name}
          </button>
        ))}
      </div>

      <div className={s.track} ref={track} onTouchStart={stop} onPointerDown={stop} onWheel={stop}>
        {models.map((m, i) => (
          <article key={m.slug} className={`${s.card} ${i === cur ? s.cardOn : ''}`} style={{ '--acc': ACCENT[m.slug] || ACCENT_DEFAULT } as CSSProperties}>
            <div className={s.top}>
              <span className={`${s.tag} ${m.powertrain === 'phev' ? s.tagPhev : ''}`}>{m.powertrain === 'phev' ? 'ไฮบริด DM-i' : 'ไฟฟ้า 100%'}</span>
              <span className={s.count}>{i + 1}/{models.length}</span>
            </div>
            <div className={s.name}>{m.name}</div>
            <div className={s.tl}>{m.tagline}</div>
            <Link href={`/car-model/${m.slug}`} className={`${s.car} ${SCENES[m.slug] ? s.carScene : ''}`}>
              {SCENES[m.slug] ? <span className={s.scene} style={{ backgroundImage: `url(${SCENES[m.slug]})` }} aria-hidden="true" /> : null}
              <span className={s.stage} aria-hidden="true" />
              {m.img?.startsWith('http') ? (
                // eslint-disable-next-line @next/next/no-img-element -- รูปจากโดเมนจริง (ใช้ในหน้าทดลองเท่านั้น)
                <img src={m.img} alt={m.alt || `BYD ${m.name}`} loading={i < 2 ? 'eager' : 'lazy'} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'contain' }} />
              ) : m.img ? (
                <Image src={m.img} alt={m.alt || `BYD ${m.name}`} fill sizes="(max-width: 700px) 86vw, 420px" priority={i < 2} style={{ objectFit: 'contain' }} />
              ) : null}
            </Link>
            <div className={s.specs}>
              <div className={s.spec}><small>ราคาเริ่มต้น</small><b><CountUp value={m.priceFrom} active={i === cur} /></b></div>
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
