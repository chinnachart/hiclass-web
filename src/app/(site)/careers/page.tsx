import type { Metadata } from 'next'
import Icon from '@/components/Icons'
import Jsonld from '@/components/Jsonld'
import CareerForm from '@/components/CareerForm'
import { getSiteData } from '@/lib/data'

export const dynamic = 'force-dynamic'

const SITE = 'https://www.hiclassevcar.com'

const PERKS = [
  { icon: 'bolt', title: 'รายได้สูง', text: 'ฐานเงินเดือน + ค่าคอมมิชชั่นต่อคัน ขึ้นอยู่กับความสามารถ ไม่มีเพดาน' },
  { icon: 'calendar', title: 'หยุดสัปดาห์ละ 2 วัน', text: 'สมดุลชีวิตและงาน' },
  { icon: 'shield', title: 'ประกันสังคม + ประกันกลุ่ม', text: 'ดูแลตั้งแต่วันแรกที่เริ่มงาน' },
  { icon: 'chat', title: 'ลีดออนไลน์ส่งให้ทุกวัน', text: 'ทีมการตลาดยิงแอดหาลูกค้าให้ ไม่ต้องหาเองทั้งหมด' },
] as const

const QUALIFICATIONS = [
  'มีประสบการณ์ขายรถมาก่อน และขับรถได้',
  'ไม่จำกัดเพศ อายุ 20 ปีขึ้นไป',
  'มีความรับผิดชอบต่องาน',
  'ทำงานเป็นทีมได้',
  'กล้าแสดงออก รีวิวรถ หรือ Live สดได้',
  'ใช้ Excel, Word, PowerPoint ได้',
]

const DUTIES = [
  'ต้อนรับและให้คำปรึกษาลูกค้าเรื่องรถยนต์ไฟฟ้า BYD ทุกรุ่น',
  'พาลูกค้าทดลองขับ เสนอราคา โปรโมชั่น และแผนการเงิน',
  'ติดตามลูกค้าจากลีดออนไลน์และลูกค้าหน้าโชว์รูม ผ่านระบบ CRM ของบริษัท',
  'ดูแลขั้นตอนจอง ไฟแนนซ์ จนถึงส่งมอบรถ',
  'สร้างคอนเทนต์รีวิวรถ หรือ Live ร่วมกับทีมการตลาด',
]

export const metadata: Metadata = {
  title: 'สมัครงาน ที่ปรึกษาการขาย BYD',
  description:
    'BYD Hi-Class EV Car เปิดรับสมัครที่ปรึกษาการขายทุกสาขา รายได้สูง ฐานเงินเดือน + คอมมิชชั่น หยุดสัปดาห์ละ 2 วัน ประกันสังคม + ประกันกลุ่ม มีลีดออนไลน์ส่งให้ทุกวัน สมัครออนไลน์ได้ทันที',
  alternates: { canonical: '/careers' },
}

export default async function CareersPage() {
  const { branches } = await getSiteData()
  const today = new Date()
  const validThrough = new Date(today.getFullYear(), today.getMonth() + 3, today.getDate()).toISOString().slice(0, 10)
  const jobLd = {
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    title: 'ที่ปรึกษาการขาย (Sales Consultant) BYD',
    description: `<p>${DUTIES.join('</p><p>')}</p><p>คุณสมบัติ: ${QUALIFICATIONS.join(' · ')}</p>`,
    datePosted: today.toISOString().slice(0, 10),
    validThrough,
    employmentType: 'FULL_TIME',
    hiringOrganization: { '@type': 'Organization', name: 'BYD Hi-Class EV Car', sameAs: SITE, logo: `${SITE}/brand/hiclass-logo.png` },
    jobLocation: branches.map((b) => ({
      '@type': 'Place',
      name: `BYD Hi-Class ${b.name}`,
      address: { '@type': 'PostalAddress', streetAddress: b.address || b.name, addressRegion: 'กรุงเทพมหานคร', addressCountry: 'TH' },
    })),
    directApply: true,
  }

  return (
    <>
      <Jsonld data={jobLd} />
      <section className="page-head" style={{ background: '#0b2350', color: '#fff' }}>
        <div className="container">
          <p className="kicker" style={{ color: '#f5c542' }}><Icon name="bolt" size={14} color="#f5c542" />We are hiring · ทุกสาขา</p>
          <h1 style={{ color: '#fff' }}>เปิดรับสมัคร ที่ปรึกษาการขาย</h1>
          <p className="lead" style={{ color: 'rgba(255,255,255,.85)' }}>
            ร่วมเป็นส่วนหนึ่งของทีมขายมืออาชีพ BYD Hi-Class EV Car {branches.length ? `${branches.length} สาขา` : ''} รายได้สูงตามความสามารถ
            มีลีดจากออนไลน์ส่งให้ทุกวัน สมัครออนไลน์ได้ในไม่กี่นาที
          </p>
          <a className="btn btn-red" href="#apply" style={{ marginTop: 16, background: '#f5c542', color: '#0b2350' }}>
            สมัครเลย <Icon name="arrow" size={18} color="#0b2350" />
          </a>
        </div>
      </section>

      <main className="container">
        <div style={{ marginTop: 20, borderRadius: 'var(--radius)', overflow: 'hidden', border: '3px solid #f5c542', position: 'relative' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/careers/team.jpg" alt="ทีมที่ปรึกษาการขาย BYD Hi-Class EV Car" width={976} height={358} style={{ display: 'block', width: '100%', height: 'auto' }} />
          <span style={{ position: 'absolute', left: '50%', bottom: 12, transform: 'translateX(-50%)', background: '#f5c542', color: '#0b2350', fontWeight: 800, padding: '6px 18px', borderRadius: 999, fontSize: 15, whiteSpace: 'nowrap' }}>
            ร่วมเป็นส่วนหนึ่งของทีมมืออาชีพ
          </span>
        </div>
        <section className="section" style={{ paddingTop: 24 }}>
          <h2>สวัสดิการและสิ่งที่คุณจะได้รับ</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: 12, marginTop: 12 }}>
            {PERKS.map((p) => (
              <div key={p.title} className="card" style={{ padding: 18, display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                <span style={{ width: 44, height: 44, borderRadius: 12, background: '#0b2350', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                  <Icon name={p.icon} size={22} color="#f5c542" />
                </span>
                <div>
                  <h3 style={{ fontSize: 17, margin: 0 }}>{p.title}</h3>
                  <p className="mute" style={{ margin: '4px 0 0', fontSize: 14 }}>{p.text}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="section">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
            <div className="card" style={{ padding: 20 }}>
              <h2 style={{ fontSize: 22, marginTop: 0 }}>ลักษณะงาน</h2>
              <ul style={{ margin: 0, paddingLeft: 0, listStyle: 'none', display: 'grid', gap: 10 }}>
                {DUTIES.map((d) => (
                  <li key={d} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    <Icon name="car" size={18} color="var(--red)" />
                    <span>{d}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="card" style={{ padding: 20, background: '#0b2350', color: '#fff', borderColor: '#0b2350' }}>
              <h2 style={{ fontSize: 22, marginTop: 0, color: '#f5c542' }}>คุณสมบัติ</h2>
              <ul style={{ margin: 0, paddingLeft: 0, listStyle: 'none', display: 'grid', gap: 10 }}>
                {QUALIFICATIONS.map((q) => (
                  <li key={q} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    <span style={{ width: 22, height: 22, borderRadius: 11, background: '#f5c542', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                      <Icon name="check" size={14} color="#0b2350" sw={3} />
                    </span>
                    <span>{q}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="section" id="apply" style={{ scrollMarginTop: 80 }}>
          <h2>กรอกใบสมัคร</h2>
          <p className="mute" style={{ marginTop: 4 }}>ใช้เวลาประมาณ 3 นาที ทีมงานจะติดต่อกลับเพื่อนัดสัมภาษณ์</p>
          <div className="card" style={{ padding: 20, maxWidth: 720, marginTop: 12 }}>
            <CareerForm branches={branches.map((b) => ({ name: b.name, phone: b.phone }))} />
          </div>
        </section>

        {branches.length ? (
          <section className="section">
            <h2>สอบถามเรื่องสมัครงาน</h2>
            <p className="mute" style={{ marginTop: 4 }}>โทรหาสาขาที่ต้องการสมัครได้โดยตรง</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10, marginTop: 12 }}>
              {branches.map((b) => (
                <a key={b.id} className="card" href={`tel:${String(b.phone || '').replace(/\D/g, '')}`} style={{ padding: 16, display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none', color: 'inherit' }}>
                  <span style={{ width: 40, height: 40, borderRadius: 20, background: 'var(--red)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                    <Icon name="phone" size={18} color="#fff" />
                  </span>
                  <span>
                    <b style={{ display: 'block' }}>สาขา{b.name}</b>
                    <span className="mute" style={{ fontSize: 14 }}>{b.phone}</span>
                  </span>
                </a>
              ))}
            </div>
          </section>
        ) : null}
      </main>
    </>
  )
}
