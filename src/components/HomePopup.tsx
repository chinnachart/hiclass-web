'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import Image from 'next/image'
import Link from 'next/link'
import Icon from './Icons'

type Props = {
  src: string
  href: string
  alt: string
  width?: number | null
  height?: number | null
  /** id ของรูป — ใช้เป็นส่วนหนึ่งของกุญแจจำ "ปิดแล้ว" เปลี่ยนรูปใหม่คนเดิมจะเห็นอีกครั้ง */
  imageId: number | string
}

const KEY = 'hc-popup-seen'
const today = () => new Date().toISOString().slice(0, 10)

/**
 * ป๊อปอัพแคมเปญกลางหน้าแรก (เหมือนที่ดีลเลอร์เจ้าอื่นใช้)
 * - ปิดแล้วไม่เด้งอีกจนถึงวันถัดไป (จำใน localStorage ของเครื่องลูกค้า ไม่ส่งข้อมูลไปไหน)
 * - เปลี่ยนรูปใหม่ในหลังบ้าน = กุญแจเปลี่ยน = เด้งใหม่ทันทีแม้คนเดิมเพิ่งปิดไป
 * - รอ 600 ms ค่อยโผล่ ไม่ให้แย่งจังหวะโหลดหน้าแรก (ไม่กระทบคะแนน LCP)
 */
export default function HomePopup({ src, href, alt, width, height, imageId }: Props) {
  const [open, setOpen] = useState(false)
  const stamp = `${imageId}|${today()}`

  useEffect(() => {
    let seen = ''
    try { seen = localStorage.getItem(KEY) || '' } catch {}
    if (seen === stamp) return
    const t = setTimeout(() => setOpen(true), 600)
    return () => clearTimeout(t)
  }, [stamp])

  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close() }
    document.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      document.removeEventListener('keydown', onKey)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const close = () => {
    setOpen(false)
    try { localStorage.setItem(KEY, stamp) } catch {}
  }

  if (!open || typeof document === 'undefined') return null

  const external = /^https?:\/\//i.test(href)

  const img = (
    <Image
      src={src}
      alt={alt}
      width={width || 1080}
      height={height || 1350}
      sizes="(max-width: 700px) 92vw, 460px"
      priority={false}
      style={{ width: '100%', height: 'auto', display: 'block' }}
    />
  )

  return createPortal(
    <>
      <div className="pop-bg" onClick={close} />
      <div className="pop" role="dialog" aria-modal="true" aria-label={alt}>
        <button type="button" className="pop-x" onClick={close} aria-label="ปิด">
          <Icon name="x" size={20} />
        </button>
        {external ? (
          <a href={href} target="_blank" rel="noopener noreferrer" onClick={close} className="pop-img">{img}</a>
        ) : (
          <Link href={href} onClick={close} className="pop-img">{img}</Link>
        )}
      </div>
    </>,
    document.body,
  )
}
