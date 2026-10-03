'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import Icon from '@/components/Icons'
import { LINE_TOKEN, type HeroSlide } from '@/lib/heroSlides'

const AUTO_MS = 6500

/** คำที่ครอบด้วย * ในข้อความ → ตัวอักษรสีทอง (เช่น 'ลงหน้าเว็บ *ไม่ได้*') */
function Rich({ text }: { text: string }) {
  return (
    <>
      {text.split('\n').map((line, li) => (
        <span key={li} style={{ display: 'block' }}>
          {line.split('*').map((part, i) =>
            i % 2 === 1 ? <em key={i} className="hl">{part}</em> : <span key={i}>{part}</span>,
          )}
        </span>
      ))}
    </>
  )
}

function Slide({ s, lineUrl, active }: { s: HeroSlide; lineUrl?: string | null; active: boolean }) {
  // ปุ่มที่ตั้งเป็น LINE_TOKEN ใช้ LINE กลางจากหลังบ้าน · ถ้ายังไม่ได้กรอกให้ไปหน้าติดต่อแทน
  const href = (h: string) => (h === LINE_TOKEN ? lineUrl || '/contact' : h)
  const ext = (h: string) => h === LINE_TOKEN && !!lineUrl
  const A = ({ h, className, children }: { h: string; className: string; children: React.ReactNode }) =>
    ext(h) ? (
      <a className={className} href={href(h)} target="_blank" rel="noopener noreferrer" tabIndex={active ? 0 : -1}>{children}</a>
    ) : (
      <Link className={className} href={href(h)} tabIndex={active ? 0 : -1}>{children}</Link>
    )

  return (
    <div className={`hs-slide${s.center ? ' center' : ''}`} aria-hidden={!active}>
      <div className="hs-copy">
        <h2 className="hs-title"><Rich text={s.title} /></h2>
        <p className="hs-sub"><Rich text={s.sub} /></p>
        <div className="hs-cta">
          <A h={s.cta.href} className={`btn btn-lg hs-btn-${s.cta.kind}`}>
            <Icon name={s.cta.kind === 'line' ? 'chat' : 'wheel'} size={20} color={s.cta.kind === 'gold' ? '#171004' : '#fff'} />
            {s.cta.label}
          </A>
          {s.cta2 ? <A h={s.cta2.href} className="btn btn-lg hs-btn-ghost">{s.cta2.label}</A> : null}
        </div>
        {s.chips?.length ? (
          <div className="hs-chips">{s.chips.map((c) => <span key={c}>{c}</span>)}</div>
        ) : null}
        {s.note ? <p className="hs-note">{s.note}</p> : null}
      </div>
    </div>
  )
}

/**
 * Hero หน้าแรก — วิดีโอเป็นพื้นหลัง + ข้อความ 4 ชุดหมุนอัตโนมัติ
 *
 * - วิดีโอเล่นเฉพาะจอ ≥ 900px (มือถือใช้รูปนิ่ง `poster` ประหยัดเน็ตลูกค้า)
 * - เคารพ prefers-reduced-motion: ไม่หมุนเอง ไม่เล่นวิดีโอ
 * - หยุดหมุนเมื่อเมาส์ชี้/โฟกัสอยู่ในกล่อง เพื่อให้อ่าน/กดปุ่มทัน
 */
export default function HeroSlider({
  slides,
  lineUrl,
  branchCount,
  models = [],
}: {
  slides: HeroSlide[]
  lineUrl?: string | null
  branchCount: number
  models?: { name: string; slug: string }[]
}) {
  const [i, setI] = useState(0)
  const [paused, setPaused] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const n = slides.length

  const go = useCallback((next: number) => setI(((next % n) + n) % n), [n])

  useEffect(() => {
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    if (reduce || paused) return
    const t = setTimeout(() => setI((x) => (x + 1) % n), AUTO_MS)
    return () => clearTimeout(t)
  }, [i, paused, n])

  // โหลดวิดีโอเฉพาะจอใหญ่ — มือถือเห็น poster อย่างเดียว
  useEffect(() => {
    const v = videoRef.current
    if (!v) return
    const big = window.matchMedia('(min-width: 900px)')
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (!big.matches || reduce.matches) return
    v.src = '/brand/hero.mp4'
    v.load()
    v.play().catch(() => {})
  }, [])

  return (
    <section
      className="hs"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      aria-roledescription="carousel"
      aria-label="ข้อเสนอจาก BYD Hi-Class"
    >
      <video
        ref={videoRef}
        className="hs-bg"
        poster="/brand/hero-poster.jpg"
        muted
        loop
        playsInline
        preload="none"
        tabIndex={-1}
        aria-hidden="true"
      />
      <div className="hs-shade" />

      <div className="container hs-in">
        {/* zip #40 — H1 เดียวของหน้าแรกต้องมีคำที่คนค้น (เดิม H1 เป็นสโลแกนที่หมุน 4 ชุด ไม่มีคำว่า BYD) · สโลแกนลงเป็น h2 */}
        {/* 3 ต.ค. — เจ้าของสั่งเอาบรรทัดติ๊กถูกออกจากจอ · ยังเก็บเป็น H1 ซ่อน (visually-hidden) ไว้ให้ Google อ่าน */}
        <h1 className="visually-hidden">
          BYD ราคา ตารางผ่อน ทดลองขับฟรี — ผู้จำหน่ายอย่างเป็นทางการ {branchCount} สาขา กรุงเทพฯ
        </h1>

        {/* 3 ต.ค. แบบ 4 — แนะนำแบรนด์ + ชื่อรุ่นทั้งหมด แทน kicker (Private Offer ฯลฯ) · คงที่ทุกสไลด์ ทุกจอ */}
        <div className="hs-intro">
          <p className="hs-brand">BYD Hi-Class EV Car</p>
          <p className="hs-brand-sub">ตัวแทนจำหน่าย BYD ประเทศไทย · จำหน่ายทุกรุ่น · ยอดส่งมอบทั้งกรุ๊ป <b>10,000+</b> คัน</p>
          {models.length ? (
            <nav className="hs-models" aria-label="รุ่นรถ BYD">
              {models.map((m) => (
                <Link key={m.slug} href={`/car-model/${m.slug}`}>{m.name.replace(/^BYD\s+/i, '')}</Link>
              ))}
            </nav>
          ) : null}
        </div>

        <div className="hs-stage">
          {slides.map((s, k) => (
            <div className="hs-layer" key={k} style={{ opacity: k === i ? 1 : 0, pointerEvents: k === i ? 'auto' : 'none' }}>
              <Slide s={s} lineUrl={lineUrl} active={k === i} />
            </div>
          ))}
        </div>

        <div className="hs-dots">
          {slides.map((s, k) => (
            <button
              key={k}
              type="button"
              className={k === i ? 'on' : ''}
              onClick={() => go(k)}
              aria-label={`ข้อเสนอที่ ${k + 1}: ${s.kicker}`}
              aria-current={k === i}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
