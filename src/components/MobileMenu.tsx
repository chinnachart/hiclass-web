'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Icon from './Icons'
import { NAV } from '@/lib/nav'
import CallPicker from './CallPicker'
import type { Branch, CarModel, SiteSettings } from '@/lib/types'

export default function MobileMenu({
  models,
  branches,
  settings,
}: {
  models: CarModel[]
  branches: Branch[]
  settings: SiteSettings
}) {
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const pathname = usePathname()

  // ต้องรอให้ขึ้นฝั่ง client ก่อนถึงจะใช้ document.body ทำ portal ได้ (กัน SSR พัง)
  useEffect(() => setMounted(true), [])

  // ปิดเมนูอัตโนมัติเมื่อเปลี่ยนหน้า
  useEffect(() => setOpen(false), [pathname])

  // ล็อกการเลื่อนหน้าขณะเมนูเปิด + กด Esc เพื่อปิด
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

  // ★ สำคัญ: header มี backdrop-filter ซึ่งทำให้ position:fixed ข้างในยึดกับกล่อง header (สูง 60px)
  //   ไม่ใช่ทั้งจอ — ลิ้นชักเลยโผล่แค่แถบบนและอยู่ใต้แถบล่าง/แบนเนอร์คุกกี้
  //   แก้ด้วยการ portal ออกไปแปะที่ document.body ให้หลุดจากกล่อง header
  const drawer = (
    <>
      <div className="drawer-bg" onClick={() => setOpen(false)} />
      <div className="drawer" role="dialog" aria-modal="true" aria-label="เมนู">
        <div className="drawer-head">
          <span className="display" style={{ fontSize: 17 }}>เมนู</span>
          <button className="icon-btn" type="button" aria-label="ปิดเมนู" onClick={() => setOpen(false)}>
            <Icon name="x" size={22} />
          </button>
        </div>
        <div className="drawer-links">
          {NAV.map((item) =>
            'drop' in item ? (
              <details key={item.href}>
                <summary>
                  {item.label}
                  <Icon name="chevd" size={18} />
                </summary>
                <Link href={item.href}>ดูทั้งหมด</Link>
                {item.drop === 'models' ? <Link href="/compare">เปรียบเทียบรุ่น</Link> : null}
                {item.drop === 'models'
                  ? models.map((m) => <Link key={m.id} href={`/car-model/${m.slug}`}>{m.name}</Link>)
                  : branches.map((b) => <Link key={b.id} href={`/branches/${b.code}`}>{b.name}</Link>)}
              </details>
            ) : (
              <Link key={item.href} href={item.href}>{item.label}</Link>
            ),
          )}
        </div>
        <div className="drawer-cta">
          <Link className="btn btn-red btn-lg" href="/test-drive">
            <Icon name="wheel" size={20} color="#fff" />
            นัดทดลองขับฟรี
          </Link>
          {settings.lineUrl ? (
            <a className="btn btn-green" href={settings.lineUrl} target="_blank" rel="noopener noreferrer">
              <Icon name="chat" size={18} color="#fff" />
              แอด LINE
            </a>
          ) : null}
          <CallPicker branches={branches} label="โทรหาสาขา" />
        </div>
      </div>
    </>
  )

  return (
    <>
      <button className="icon-btn menu" type="button" aria-label="เปิดเมนู" aria-expanded={open} onClick={() => setOpen(true)}>
        <Icon name="menu" size={24} />
      </button>
      {open && mounted ? createPortal(drawer, document.body) : null}
    </>
  )
}
