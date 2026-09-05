import Link from 'next/link'
import Icon from './Icons'
import MobileMenu from './MobileMenu'
import { telHref } from '@/lib/format'
import { NAV } from '@/lib/nav'
import type { Branch, CarModel, SiteSettings } from '@/lib/types'

export function Logo() {
  return (
    <Link className="logo" href="/" aria-label="BYD Hi-Class EV Car หน้าแรก">
      <span className="byd">BYD</span>
      <span className="bar" />
      <span className="hc">
        HI-CLASS
        <br />
        EV CAR
      </span>
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
  const phone = settings.mainPhone
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
          <a className="hdr-tel" href={telHref(phone)}>
            <Icon name="phone" size={16} />
            {phone}
          </a>
          <Link className="btn btn-red hdr-cta" href="/test-drive">
            นัดทดลองขับ
          </Link>
          <a className="icon-btn tel" href={telHref(phone)} aria-label="โทรหาเรา">
            <Icon name="phone" size={22} />
          </a>
          <MobileMenu models={models} branches={branches} settings={settings} />
        </div>
      </div>
    </header>
  )
}
