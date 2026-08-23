import Link from 'next/link'
import { Logo } from './Header'
import { telHref } from '@/lib/format'
import type { Branch, CarModel, SiteSettings } from '@/lib/types'

export default function Footer({
  models,
  branches,
  settings,
}: {
  models: CarModel[]
  branches: Branch[]
  settings: SiteSettings
}) {
  return (
    <>
      <footer>
        <div className="shell">
          <div className="f-grid">
            <div className="f-col f-about">
              <Logo />
              <p>{settings.footerAbout}</p>
            </div>
            <div className="f-col">
              <h4>Car Model</h4>
              {models.slice(0, 5).map((m) => (
                <Link key={m.id} href={`/car-model/${m.slug}`}>{m.name}</Link>
              ))}
              <Link href="/car-model">ดูทั้งหมด</Link>
            </div>
            <div className="f-col">
              <h4>บริการ</h4>
              <Link href="/test-drive">สนใจทดลองขับ</Link>
              <Link href="/service">จองคิวศูนย์บริการ</Link>
              <Link href="/rental">บริการรถให้เช่า</Link>
              <Link href="/#calc">คำนวณค่างวด</Link>
              <Link href="/trade-in">เทิร์นรถเก่า</Link>
            </div>
            <div className="f-col">
              <h4>ติดต่อเรา</h4>
              <a href={telHref(settings.mainPhone)}>{settings.mainPhone}</a>
              {settings.lineUrl ? <a href={settings.lineUrl}>LINE Official</a> : null}
              {settings.facebookUrl ? <a href={settings.facebookUrl}>Facebook</a> : null}
              <Link href="/branches">สาขาของเรา</Link>
              <Link href="/careers">ร่วมงานกับเรา</Link>
            </div>
          </div>
          <div className="f-bot">
            <span>© {new Date().getFullYear() + 543} Hi-Class EV Car · Build Your Dream</span>
            <span>นโยบายความเป็นส่วนตัว · เงื่อนไขการใช้งาน</span>
          </div>
        </div>
      </footer>

      <div className="mbar">
        <a className="call" href={telHref(branches[0]?.phone || settings.mainPhone)}>โทรหาสาขา</a>
        <Link className="book" href="/test-drive">สนใจทดลองขับ</Link>
      </div>
    </>
  )
}
