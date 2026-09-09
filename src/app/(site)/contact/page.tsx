import type { Metadata } from 'next'
import Link from 'next/link'
import Icon from '@/components/Icons'
import { BranchCard } from '@/components/Cards'
import { getSiteData } from '@/lib/data'
import { telHref } from '@/lib/format'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'ติดต่อเรา — BYD Hi-Class EV Car',
  description: 'ติดต่อ BYD Hi-Class EV Car โทร แอด LINE หรือแวะที่สาขาใกล้บ้าน 5 สาขาในกรุงเทพฯ และปริมณฑล',
  alternates: { canonical: '/contact' },
}

export default async function ContactPage() {
  const { branches, settings } = await getSiteData()
  return (
    <>
      <section className="page-head">
        <div className="container">
          <p className="kicker">ติดต่อเรา</p>
          <h1>คุยกับเราได้ทุกช่องทาง</h1>
          <p className="lead">โทรตรง ทัก LINE หรือแวะสาขาใกล้บ้าน{settings.mainPhone ? ` · โทร ${settings.mainPhone}` : ''}</p>
        </div>
      </section>
      <main className="container">
        {settings.footerAbout ? (
          <section className="section" style={{ paddingTop: 20, paddingBottom: 0 }}>
            <p className="mute" style={{ maxWidth: 760, lineHeight: 1.7 }}>{settings.footerAbout}</p>
          </section>
        ) : null}
        <section className="section" style={{ paddingTop: 20 }}>
          <div className="grid-3">
            <a className="card svc" href={telHref(settings.mainPhone)}>
              <span className="branch-ico"><Icon name="phone" size={20} /></span>
              <h3>โทรหาเรา</h3>
              <p>{settings.mainPhone} · เปิด{branches[0]?.openHours || 'ทุกวัน 08:00–18:00'}</p>
            </a>
            {settings.lineUrl ? (
              <a className="card svc" href={settings.lineUrl} target="_blank" rel="noopener noreferrer">
                <span className="branch-ico" style={{ background: 'var(--green-soft)', color: 'var(--green-dark)' }}><Icon name="chat" size={20} /></span>
                <h3>แอด LINE</h3>
                <p>ถามราคา โปรโมชั่น หรือส่งรูปรถเก่าให้ประเมิน ตอบไวในเวลาทำการ</p>
              </a>
            ) : null}
            {settings.contactEmail ? (
              <a className="card svc" href={`mailto:${settings.contactEmail}`}>
                <span className="branch-ico" style={{ background: 'var(--soft)', color: 'var(--ink)' }}><Icon name="mail" size={20} /></span>
                <h3>อีเมล</h3>
                <p>{settings.contactEmail}</p>
              </a>
            ) : null}
            {settings.facebookUrl ? (
              <a className="card svc" href={settings.facebookUrl} target="_blank" rel="noopener noreferrer">
                <span className="branch-ico" style={{ background: 'var(--soft)', color: 'var(--ink)' }}><Icon name="facebook" size={20} /></span>
                <h3>Facebook</h3>
                <p>ติดตามข่าวสาร กิจกรรม และรีวิวจากลูกค้า</p>
              </a>
            ) : null}
            <Link className="card svc" href="/test-drive">
              <span className="branch-ico"><Icon name="wheel" size={20} /></span>
              <h3>นัดทดลองขับ</h3>
              <p>กรอกฟอร์ม 1 นาที ทีมขายโทรกลับภายใน 1 ชั่วโมง</p>
            </Link>
          </div>
        </section>
        <section className="section">
          <div className="sec-head"><div><h2>สาขาทั้ง {branches.length} แห่ง</h2></div></div>
          <div className="branch-list">
            {branches.map((b) => <BranchCard key={b.id} b={b} lineUrl={settings.lineUrl} />)}
          </div>
        </section>
      </main>
    </>
  )
}
