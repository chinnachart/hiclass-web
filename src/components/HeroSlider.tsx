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
        <p className={`hs-kicker ${s.accent}`}><i /> {s.kicker}</p>
        <h1><Rich text={s.title} /></h1>
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
}: {
  slides: HeroSlide[]
  lineUrl?: string | null
  branchCount: number
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
        <p className="hs-badge">
          <Icon name="check" size={14} sw={3} />
          ผู้จำหน่าย BYD อย่างเป็นทางการ · {branchCount} สาขา กรุงเทพฯ
        </p>

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
