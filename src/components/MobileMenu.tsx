'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Icon from './Icons'
import { NAV } from '@/lib/nav'
import { telHref } from '@/lib/format'
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
  const pathname = usePathname()

  // ปิดเมนูอัตโนมัติเมื่อเปลี่ยนหน้า และล็อกการเลื่อนหน้าขณะเมนูเปิด
  useEffect(() => setOpen(false), [pathname])
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  return (
    <>
      <button className="icon-btn menu" type="button" aria-label="เปิดเมนู" onClick={() => setOpen(true)}>
        <Icon name="menu" size={24} />
      </button>
      {open ? (
        <>
          <div className="drawer-bg" onClick={() => setOpen(false)} />
          <div className="drawer" role="dialog" aria-label="เมนู">
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
              <a className="btn btn-outline" href={telHref(settings.mainPhone)}>
                <Icon name="phone" size={18} />
                {settings.mainPhone}
              </a>
            </div>
          </div>
        </>
      ) : null}
    </>
  )
}
