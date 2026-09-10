import Image from 'next/image'
import Link from 'next/link'
import Icon from './Icons'
import MobileMenu from './MobileMenu'
import CallPicker from './CallPicker'
import { NAV } from '@/lib/nav'
import type { Branch, CarModel, SiteSettings } from '@/lib/types'

export function Logo() {
  return (
    <Link className="logo" href="/" aria-label="BYD Hi-Class EV Car หน้าแรก">
      <Image className="byd" src="/brand/hiclass-logo.png" alt="BYD Hi-Class EV Car" width={1200} height={107} priority />
    </Link>
  )
}


export default function Header({
  models,
  branches,
  settings,
}: {
  models: CarModel[]
  branches: Branch[]
  settings: SiteSettings
}) {
  return (
    <header className="hdr">
      <div className="container hdr-in">
        <Logo />
        <nav className="nav" aria-label="เมนูหลัก">
          {NAV.map((item) => (
            <div className="nav-item" key={item.href}>
              <Link href={item.href}>
                {item.label}
                {'drop' in item ? <Icon name="chevd" size={14} /> : null}
              </Link>
              {'drop' in item && item.drop === 'models' ? (
                <div className="drop wide">
                  <Link href="/compare" style={{ fontWeight: 600, color: 'var(--red)' }}>เปรียบเทียบรุ่น</Link>
                  {models.map((m) => (
                    <Link key={m.id} href={`/car-model/${m.slug}`}>
                      {m.name} <small>{m.tagline}</small>
                    </Link>
                  ))}
                </div>
              ) : null}
              {'drop' in item && item.drop === 'branches' ? (
                <div className="drop">
                  {branches.map((b) => (
                    <Link key={b.id} href={`/branches/${b.code}`}>
                      {b.name} <small>{b.nameEn || ''}</small>
                    </Link>
                  ))}
                </div>
              ) : null}
            </div>
          ))}
        </nav>
        <div className="hdr-acts">
          <CallPicker branches={branches} className="hdr-tel" label="โทร" iconSize={16} />
          <Link className="btn btn-red hdr-cta" href="/test-drive">
            นัดทดลองขับ
          </Link>
          <CallPicker branches={branches} className="icon-btn tel" label="" iconSize={22} ariaLabel="โทรหาสาขา" />
          <MobileMenu models={models} branches={branches} settings={settings} />
        </div>
      </div>
    </header>
  )
}
