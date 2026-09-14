'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import Icon from '@/components/Icons'

export type Slide = {
  /** URL รูปจากคลังรูปภาพ */
  url: string
  /** คำอธิบายรูป (SEO + คนตาบอดใช้โปรแกรมอ่านหน้าจอ) */
  alt: string
  /** ข้อความทับมุมล่างซ้าย เช่น ชื่อสาขา — เว้นว่างได้ */
  caption?: string
  /** กดแล้วไปหน้าไหน — เว้นว่าง = กดไม่ได้ */
  href?: string
}

/**
 * สไลด์รูปโชว์รูม — ใช้ทั้งหน้าแรก (รูปเด่นของทุกสาขา) และหน้าสาขา (บรรยากาศสาขานั้น)
 *
 * ทำด้วย CSS scroll-snap ล้วน ไม่ใช้ไลบรารีสไลด์:
 * - มือถือ = ปัดนิ้วได้ตามปกติของเบราว์เซอร์ ไม่ต้องโหลด JS เพิ่ม
 * - จอคอม = มีปุ่มซ้าย/ขวา + จุดบอกตำแหน่ง
 * ถ้า JS ไม่ทำงาน รูปยังเลื่อนดูได้ครบทุกใบ (ปุ่มหายไปเฉยๆ)
 */
export default function ShowroomSlider({
  slides,
  ratio = '16x9',
  sizes = '(max-width: 900px) 100vw, 1100px',
  priority = false,
}: {
  slides: Slide[]
  /** สัดส่วนกรอบรูป — หน้าแรก/แบนเนอร์ใช้ 16x9 · แกลเลอรีสาขาใช้ 4x3 */
  ratio?: '16x9' | '4x3'
  sizes?: string
  priority?: boolean
}) {
  const trackRef = useRef<HTMLDivElement>(null)
  const [index, setIndex] = useState(0)

  const scrollTo = useCallback((i: number) => {
    const el = trackRef.current
    if (!el) return
    const child = el.children[i] as HTMLElement | undefined
    if (child) el.scrollTo({ left: child.offsetLeft - el.offsetLeft, behavior: 'smooth' })
  }, [])

  // อ่านตำแหน่งจากการเลื่อนจริง (ปัดนิ้วเองก็อัปเดตจุดตาม)
  useEffect(() => {
    const el = trackRef.current
    if (!el) return
    let raf = 0
    const onScroll = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        const w = el.clientWidth || 1
        setIndex(Math.round(el.scrollLeft / w))
      })
    }
    el.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      cancelAnimationFrame(raf)
      el.removeEventListener('scroll', onScroll)
    }
  }, [])

  if (slides.length === 0) return null

  const last = slides.length - 1
  const go = (dir: -1 | 1) => scrollTo(Math.min(last, Math.max(0, index + dir)))

  return (
    <div className="slider">
      <div className={`slider-track ratio-${ratio}`} ref={trackRef}>
        {slides.map((s, i) => {
          const inner = (
            <>
              <Image
                src={s.url}
                alt={s.alt}
                fill
                sizes={sizes}
                style={{ objectFit: 'cover' }}
                priority={priority && i === 0}
              />
              {s.caption ? (
                <span className="slide-cap">
                  {s.caption}
                  {s.href ? <Icon name="chev" size={14} /> : null}
                </span>
              ) : null}
            </>
          )
          return s.href ? (
            <Link className="slide" href={s.href} key={`${s.url}-${i}`}>{inner}</Link>
          ) : (
            <div className="slide" key={`${s.url}-${i}`}>{inner}</div>
          )
        })}
      </div>

      {slides.length > 1 ? (
        <>
          <button
            type="button"
            className="slider-btn prev"
            onClick={() => go(-1)}
            disabled={index === 0}
            aria-label="รูปก่อนหน้า"
          >
            <Icon name="chev" size={18} />
          </button>
          <button
            type="button"
            className="slider-btn next"
            onClick={() => go(1)}
            disabled={index === last}
            aria-label="รูปถัดไป"
          >
            <Icon name="chev" size={18} />
          </button>
          <div className="slider-dots">
            {slides.map((s, i) => (
              <button
                type="button"
                key={`dot-${s.url}-${i}`}
                className={i === index ? 'on' : ''}
                onClick={() => scrollTo(i)}
                aria-label={`ไปรูปที่ ${i + 1}`}
              />
            ))}
          </div>
        </>
      ) : null}
    </div>
  )
}
