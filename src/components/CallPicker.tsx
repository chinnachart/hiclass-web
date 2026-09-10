'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import Icon from './Icons'
import { telHref } from '@/lib/format'
import type { Branch } from '@/lib/types'

type Props = {
  branches: Pick<Branch, 'id' | 'name' | 'phone' | 'openHours'>[]
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
export default function CallPicker({ branches, label = 'โทร', className = 'btn btn-outline', title = 'เลือกสาขาที่ต้องการโทร', iconSize = 18, ariaLabel }: Props) {
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const list = branches.filter((b) => b.phone)

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
        <Icon name="phone" size={iconSize} />{label}
      </button>
      {open && mounted
        ? createPortal(
            <>
              <div className="callpick-bg" onClick={() => setOpen(false)} />
              <div className="callpick" role="dialog" aria-modal="true" aria-label={title}>
                <div className="callpick-head">
                  <strong>{title}</strong>
                  <button type="button" className="icon-btn" onClick={() => setOpen(false)} aria-label="ปิด">
                    <Icon name="x" size={20} />
                  </button>
                </div>
                <div className="callpick-list">
                  {list.map((b) => (
                    <a key={b.id} href={telHref(b.phone)} onClick={() => setOpen(false)}>
                      <span className="callpick-ico"><Icon name="phone" size={16} color="#fff" /></span>
                      <span className="callpick-txt">
                        <b>BYD Hi-Class {b.name}</b>
                        <small>{b.phone}{b.openHours ? ` · ${b.openHours}` : ''}</small>
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
