import Image from 'next/image'
import Link from 'next/link'
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
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <Image src="/brand/hiclass-logo.png" alt="BYD Hi-Class EV Car" width={1200} height={107} style={{ width: 'auto', height: 26, marginBottom: 14 }} />
            <p>
              {settings.footerAbout ||
                `ผู้จำหน่ายรถยนต์ BYD อย่างเป็นทางการ ${branches.length} สาขาในกรุงเทพฯ และปริมณฑล ดูแลตั้งแต่เลือกรุ่น จัดไฟแนนซ์ ส่งมอบ ไปจนถึงศูนย์บริการ`}
            </p>
            <p style={{ marginTop: 10 }}>
              โทร <a href={telHref(settings.mainPhone)} style={{ color: 'var(--ink)', fontWeight: 600 }}>{settings.mainPhone}</a>
              {settings.lineUrl ? <> · <a href={settings.lineUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--ink)', fontWeight: 600 }}>LINE</a></> : null}
              {settings.facebookUrl ? <> · <a href={settings.facebookUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--ink)', fontWeight: 600 }}>Facebook</a></> : null}
            </p>
            {settings.contactEmail ? (
              <p style={{ marginTop: 4 }}>
                อีเมล <a href={`mailto:${settings.contactEmail}`} style={{ color: 'var(--ink)', fontWeight: 600 }}>{settings.contactEmail}</a>
              </p>
            ) : null}
          </div>
          <div>
            <h4>รุ่นรถ</h4>
            <div className="links">
              {models.map((m) => (
                <Link key={m.id} href={`/car-model/${m.slug}`}>BYD {m.name}</Link>
              ))}
            </div>
          </div>
          <div>
            <h4>สาขา</h4>
            <div className="links">
              {branches.map((b) => (
                <Link key={b.id} href={`/branches/${b.code}`}>{b.name}</Link>
              ))}
            </div>
          </div>
          <div>
            <h4>บริการ</h4>
            <div className="links">
              <Link href="/test-drive">นัดทดลองขับ</Link>
              <Link href="/register">ลงทะเบียนความสนใจ</Link>
              <Link href="/trade-in">เทิร์นรถเก่า</Link>
              <Link href="/price">ราคาและตารางผ่อน</Link>
              <Link href="/compare">เปรียบเทียบรุ่น</Link>
              <Link href="/promotion">โปรโมชั่น</Link>
              <Link href="/service">ศูนย์บริการ</Link>
              <Link href="/rental">บริการรถให้เช่า</Link>
              <Link href="/news">ข่าวสารและกิจกรรม</Link>
              <Link href="/awards">รางวัลของเรา</Link>
              <Link href="/contact">ติดต่อเรา</Link>
            </div>
          </div>
        </div>
        <div className="fine" style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 16px', justifyContent: 'space-between' }}>
          <span>© {new Date().getFullYear()} Hi-Class EV Car · BYD เป็นเครื่องหมายการค้าของ BYD Auto</span>
          <Link href="/privacy">นโยบายความเป็นส่วนตัว</Link>
        </div>
      </div>
    </footer>
  )
}
