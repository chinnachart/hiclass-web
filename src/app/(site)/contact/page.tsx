import type { Metadata } from 'next'
import Link from 'next/link'
import Icon from '@/components/Icons'
import { BranchCard } from '@/components/Cards'
import { getSiteData } from '@/lib/data'
import { fmtPhone, telHref } from '@/lib/format'

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
          <p className="lead">โทรตรงถึงสาขา ทัก LINE หรือแวะสาขาใกล้บ้าน</p>
        </div>
      </section>
      <main className="container">
        {settings.footerAbout ? (
          <section className="section" style={{ paddingTop: 20, paddingBottom: 0 }}>
            <p className="mute" style={{ maxWidth: 760, lineHeight: 1.7 }}>{settings.footerAbout}</p>
          </section>
        ) : null}
        <section className="section" style={{ paddingTop: 20 }}>
          {/* 3 ต.ค. — จอใหญ่: การ์ดโทรซ้าย · ช่องทางอื่นซ้อนขวา (เดิม 3 คอลัมน์ การ์ดขวาว่างโล่ง) */}
          <div className="contact-grid">
            <div className="card svc">
              <span className="branch-ico"><Icon name="phone" size={20} /></span>
              <h3>โทรหาสาขา</h3>
              {/* 3 ต.ค. — แต่ละสาขาเป็นปุ่มโทรออกทั้งแถว กดตรงไหนก็โทร · เบอร์รูปแบบเดียวกัน */}
              <div className="call-list">
                {branches.filter((b) => b.phone).map((b) => (
                  <a key={b.id} className="call-row" href={telHref(b.phone)} aria-label={`โทรหาสาขา${b.name} ${fmtPhone(b.phone)}`}>
                    <span className="call-row-txt">
                      <b>สาขา{b.name}</b>
                      <span>{fmtPhone(b.phone)}</span>
                    </span>
                    <span className="call-row-btn"><Icon name="phone" size={16} /> โทรเลย</span>
                  </a>
                ))}
              </div>
              <p style={{ marginTop: 10 }}>เปิด{branches[0]?.openHours || 'ทุกวัน 08:00–18:00'}</p>
            </div>
            <div className="contact-side">
            {settings.lineUrl ? (
              <a className="card svc" href={settings.lineUrl} target="_blank" rel="noopener noreferrer">
                <span className="branch-ico" style={{ background: 'var(--green-soft)', color: 'var(--green-dark)' }}><Icon name="chat" size={20} /></span>
                <h3>แอด LINE</h3>
                <p>ถามราคา โปรโมชั่น หรือส่งรูปรถเก่าให้ประเมิน ตอบไวในเวลาทำการ</p>
                <span className="more">แอด LINE <Icon name="arrow" size={14} /></span>
              </a>
            ) : null}
            {settings.contactEmail ? (
              <a className="card svc" href={`mailto:${settings.contactEmail}`}>
                <span className="branch-ico" style={{ background: 'var(--soft)', color: 'var(--ink)' }}><Icon name="mail" size={20} /></span>
                <h3>อีเมล</h3>
                <p>{settings.contactEmail}</p>
                <span className="more">ส่งอีเมล <Icon name="arrow" size={14} /></span>
              </a>
            ) : null}
            {settings.facebookUrl ? (
              <a className="card svc" href={settings.facebookUrl} target="_blank" rel="noopener noreferrer">
                <span className="branch-ico" style={{ background: 'var(--soft)', color: 'var(--ink)' }}><Icon name="facebook" size={20} /></span>
                <h3>Facebook</h3>
                <p>ติดตามข่าวสาร กิจกรรม และรีวิวจากลูกค้า</p>
                <span className="more">ไปที่เพจ <Icon name="arrow" size={14} /></span>
              </a>
            ) : null}
            <Link className="card svc" href="/test-drive">
              <span className="branch-ico"><Icon name="wheel" size={20} /></span>
              <h3>นัดทดลองขับ</h3>
              <p>กรอกฟอร์ม 1 นาที ทีมขายโทรกลับภายใน 1 ชั่วโมง</p>
              <span className="more">จองทดลองขับฟรี <Icon name="arrow" size={14} /></span>
            </Link>
            </div>
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
