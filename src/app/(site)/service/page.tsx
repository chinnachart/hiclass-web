import type { Metadata } from 'next'
import Link from 'next/link'
import Icon from '@/components/Icons'
import { BranchCard, Faq } from '@/components/Cards'
import Jsonld, { faqLd } from '@/components/Jsonld'
import { getSiteData } from '@/lib/data'
import { telHref } from '@/lib/format'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'ศูนย์บริการ BYD — เช็กระยะ ซ่อมตัวถัง อะไหล่แท้',
  description: 'ศูนย์บริการ BYD Hi-Class ทั้ง 5 สาขา เช็กระยะ ซ่อมสีและตัวถัง อะไหล่แท้ ช่างผ่านการอบรมจาก BYD จองคิวล่วงหน้าได้ทางโทรศัพท์และ LINE',
  alternates: { canonical: '/service' },
}

const SERVICES = [
  { icon: 'wrench', title: 'เช็กระยะตามกำหนด', body: 'ตรวจเช็กตามระยะทางที่ BYD กำหนด พร้อมอัปเดตซอฟต์แวร์รถให้เป็นเวอร์ชันล่าสุด' },
  { icon: 'shield', title: 'ซ่อมสีและตัวถัง', body: 'ศูนย์ซ่อมตัวถังมาตรฐาน BYD ใช้อะไหล่แท้ เคลมประกันได้ทุกบริษัท' },
  { icon: 'bolt', title: 'ตรวจเช็กแบตเตอรี่และระบบชาร์จ', body: 'วิเคราะห์สุขภาพแบตเตอรี่ ตรวจสายชาร์จและ wallbox ที่บ้าน' },
  { icon: 'key', title: 'รถทดแทนระหว่างซ่อม', body: 'ลูกค้าที่นำรถเข้าซ่อมขอใช้รถทดแทนได้ ดูรายละเอียดที่บริการรถให้เช่า' },
]

const FAQ = [
  { question: 'เช็กระยะ BYD ต้องเข้าทุกกี่กิโลเมตร', answer: 'โดยทั่วไปทุก 10,000 กม. หรือ 6 เดือน แล้วแต่อย่างใดถึงก่อน ทีมงานจะแจ้งเตือนก่อนถึงกำหนดถ้าลงทะเบียนไว้กับสาขา' },
  { question: 'จองคิวศูนย์บริการได้ทางไหน', answer: 'โทรหาสาขาที่สะดวกโดยตรง หรือทัก LINE พร้อมแจ้งรุ่นรถ เลขไมล์ และเรื่องที่ต้องการเข้ารับบริการ ทีมงานยืนยันคิวกลับให้' },
  { question: 'ซื้อรถจากที่อื่นเข้าศูนย์ที่นี่ได้ไหม', answer: 'ได้ ศูนย์บริการของเรารับดูแลรถ BYD ทุกคันตามเงื่อนไขการรับประกันของ BYD ประเทศไทย' },
]

export default async function ServicePage() {
  const { branches, settings } = await getSiteData()
  return (
    <>
      <Jsonld data={faqLd(FAQ)} />
      <section className="page-head">
        <div className="container">
          <p className="kicker">Service</p>
          <h1>ศูนย์บริการ BYD ทั้ง {branches.length} สาขา</h1>
          <p className="lead">ช่างผ่านการอบรมจาก BYD อะไหล่แท้ จองคิวล่วงหน้าได้ทางโทรศัพท์หรือ LINE</p>
        </div>
      </section>
      <main className="container">
        <section className="section" style={{ paddingTop: 20 }}>
          <div className="grid-2">
            {SERVICES.map((s) => (
              <div className="card svc" key={s.title}>
                <span className="branch-ico"><Icon name={s.icon} size={20} /></span>
                <h3>{s.title}</h3>
                <p>{s.body}</p>
              </div>
            ))}
          </div>
          <div className="grid-2" style={{ marginTop: 14 }}>
            <a className="btn btn-red btn-lg" href={telHref(settings.mainPhone)}><Icon name="phone" size={20} color="#fff" />โทรจองคิว {settings.mainPhone}</a>
            {settings.lineUrl ? (
              <a className="btn btn-green btn-lg" href={settings.lineUrl} target="_blank" rel="noopener noreferrer"><Icon name="chat" size={20} color="#fff" />จองคิวทาง LINE</a>
            ) : (
              <Link className="btn btn-outline btn-lg" href="/rental"><Icon name="key" size={20} />รถทดแทนระหว่างซ่อม</Link>
            )}
          </div>
        </section>
        <section className="section">
          <div className="sec-head"><div><h2>เลือกสาขาที่จะเข้ารับบริการ</h2></div></div>
          <div className="branch-list">
            {branches.map((b) => <BranchCard key={b.id} b={b} lineUrl={settings.lineUrl} />)}
          </div>
        </section>
        <section className="section">
          <div className="sec-head"><div><h2>คำถามที่พบบ่อย</h2></div></div>
          <Faq items={FAQ} />
        </section>
      </main>
    </>
  )
}
