import Link from 'next/link'
import { telHref } from '@/lib/format'
import type { Branch, CarModel } from '@/lib/types'

export function Logo() {
  return (
    <Link className="logo" href="/">
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
  phone,
}: {
  models: CarModel[]
  branches: Branch[]
  phone: string
}) {
  return (
    <header className="hdr">
      <div className="hdr-in">
        <Logo />
        <nav>
          <div className="nav-item">
            <Link href="/" className="on">Home</Link>
          </div>
          <div className="nav-item">
            <Link href="/promotion">Promotion</Link>
          </div>
          <div className="nav-item">
            <Link href="/car-model">
              Car Model <span className="caret">▼</span>
            </Link>
            <div className="drop wide">
              {models.map((m) => (
                <Link key={m.id} href={`/car-model/${m.slug}`}>
                  {m.name} <small>{m.tagline}</small>
                </Link>
              ))}
            </div>
          </div>
          <div className="nav-item">
            <Link href="/service">Service</Link>
          </div>
          <div className="nav-item">
            <Link href="/rental">บริการรถให้เช่า</Link>
          </div>
          <div className="nav-item">
            <Link href="/branches">
              สาขาของเรา <span className="caret">▼</span>
            </Link>
            <div className="drop">
              {branches.map((b) => (
                <Link key={b.id} href={`/branches/${b.code}`}>
                  {b.name} <small>{b.nameEn || ''}</small>
                </Link>
              ))}
            </div>
          </div>
          <div className="nav-item">
            <Link href="/contact">ติดต่อเรา</Link>
          </div>
          <div className="nav-item">
            <Link href="/news">ข่าวสารและกิจกรรม</Link>
          </div>
        </nav>
        <a className="tel" href={telHref(phone)}>{phone}</a>
        <Link className="btn" href="/test-drive">สนใจทดลองขับ</Link>
      </div>
    </header>
  )
}
