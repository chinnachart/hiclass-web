'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import Icon from './Icons'
import { telHref } from '@/lib/format'
import type { Branch } from '@/lib/types'

type Props = {
  branches: Pick<Branch, 'id' | 'name' | 'phone' | 'openHours' | 'lineUrl'>[]
  /** 'line' = เลือกสาขาแล้วเปิด LINE ของสาขานั้น (ใช้ตอนยังไม่ได้ตั้ง LINE กลางในหลังบ้าน) */
  kind?: 'call' | 'line'
  /** ไม่ใส่ไอคอนบนปุ่ม (ปุ่มที่ดีไซน์เป็นข้อความล้วน เช่น การ์ดรถหน้าแรก) */
  noIcon?: boolean
  /** ข้อความบนปุ่ม (ค่าเริ่มต้น "โทร") */
  label?: string
  className?: string
  /** หัวข้อในหน้าต่างเลือกสาขา */
  title?: string
  iconSize?: number
  /** ใช้เมื่อปุ่มเป็นไอคอนอย่างเดียว (label ว่าง) */
  ariaLabel?: string
}

/** ปุ่ม "โทร" → เปิดหน้าต่างให้เลือกสาขา → กดแล้วโทรหาสาขานั้น (ลิงก์ tel: ปกติ ระบบนับคลิกโทรยังทำงาน) */
export default function CallPicker({ branches, kind = 'call', noIcon, label = 'โทร', className = 'btn btn-outline', title, iconSize = 18, ariaLabel }: Props) {
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const isLine = kind === 'line'
  const list = branches.filter((b) => (isLine ? b.lineUrl : b.phone))
  const heading = title || (isLine ? 'เลือกสาขาที่ต้องการแชท LINE' : 'เลือกสาขาที่ต้องการโทร')
  const icon = isLine ? 'chat' : 'phone'

  useEffect(() => setMounted(true), [])

  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  if (list.length === 0) return null

  return (
    <>
      <button type="button" className={className} onClick={() => setOpen(true)} aria-haspopup="dialog" aria-label={ariaLabel || undefined}>
        {noIcon ? null : <Icon name={icon} size={iconSize} color={isLine ? '#fff' : undefined} />}{label}
      </button>
      {open && mounted
        ? createPortal(
            <>
              <div className="callpick-bg" onClick={() => setOpen(false)} />
              <div className="callpick" role="dialog" aria-modal="true" aria-label={heading}>
                <div className="callpick-head">
                  <strong>{heading}</strong>
                  <button type="button" className="icon-btn" onClick={() => setOpen(false)} aria-label="ปิด">
                    <Icon name="x" size={20} />
                  </button>
                </div>
                <div className="callpick-list">
                  {list.map((b) => (
                    <a
                      key={b.id}
                      href={isLine ? b.lineUrl! : telHref(b.phone)}
                      {...(isLine ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                      onClick={() => setOpen(false)}
                    >
                      <span className="callpick-ico" style={isLine ? { background: 'var(--green)' } : undefined}><Icon name={icon} size={16} color="#fff" /></span>
                      <span className="callpick-txt">
                        <b>BYD Hi-Class {b.name}</b>
                        <small>{isLine ? 'แชทได้ตลอด 24 ชม. · ทีมขายสาขานี้ดูแลโดยตรง' : `${b.phone}${b.openHours ? ` · ${b.openHours}` : ''}`}</small>
                      </span>
                    </a>
                  ))}
                </div>
              </div>
            </>,
            document.body,
          )
        : null}
    </>
  )
}
