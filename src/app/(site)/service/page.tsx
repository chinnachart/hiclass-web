import type { Metadata } from 'next'
import Link from 'next/link'
import Icon from '@/components/Icons'
import { BranchCard, Faq } from '@/components/Cards'
import Jsonld, { faqLd } from '@/components/Jsonld'
import { getPageContent, getSiteData } from '@/lib/data'
import { fillTokens, telHref } from '@/lib/format'
import ServiceApptForm from '@/components/ServiceApptForm'
import { SERVICE_BRANCH_CODES } from '@/lib/serviceAppt'

export const dynamic = 'force-dynamic'

/** ข้อความตั้งต้น — ใช้เมื่อยังไม่ได้กรอกในหลังบ้าน (ข้อความในหน้าต่างๆ → ศูนย์บริการ) */
const D = {
  kicker: 'Service',
  title: 'ศูนย์บริการ BYD ทั้ง {สาขา} สาขา',
  lead: 'ช่างผ่านการอบรมจาก BYD อะไหล่แท้ จองคิวล่วงหน้าได้ทางออนไลน์ โทรศัพท์ หรือ LINE',
  seoTitle: 'ศูนย์บริการ BYD — เช็กระยะ อู่สีและซ่อมตัวถัง อะไหล่แท้',
  seoDesc:
    'ศูนย์บริการ BYD Hi-Class ทั้ง 5 สาขา เช็กระยะ ซ่อมสีและตัวถัง อะไหล่แท้ ช่างผ่านการอบรมจาก BYD จองคิวล่วงหน้าได้ทางโทรศัพท์และ LINE',
  services: [
    { icon: 'wrench', title: 'เช็กระยะตามกำหนด', body: 'ตรวจเช็กตามระยะทางที่ BYD กำหนด พร้อมอัปเดตซอฟต์แวร์รถให้เป็นเวอร์ชันล่าสุด' },
    { icon: 'shield', title: 'อู่สีและซ่อมตัวถัง', body: 'ศูนย์ซ่อมสีและตัวถังมาตรฐาน BYD ใช้อะไหล่แท้ ประสานงานเคลมประกันให้' },
    { icon: 'bolt', title: 'ตรวจเช็กแบตเตอรี่และระบบชาร์จ', body: 'วิเคราะห์สุขภาพแบตเตอรี่ ตรวจสายชาร์จและ wallbox ที่บ้าน' },
    { icon: 'key', title: 'รถทดแทนระหว่างซ่อม', body: 'ลูกค้าที่นำรถเข้าซ่อมขอใช้รถทดแทนได้ ดูรายละเอียดที่บริการรถให้เช่า' },
  ],
  faq: [
    { question: 'เช็กระยะ BYD ต้องเข้าทุกกี่กิโลเมตร', answer: 'โดยทั่วไปทุก 10,000 กม. หรือ 6 เดือน แล้วแต่อย่างใดถึงก่อน ทีมงานจะแจ้งเตือนก่อนถึงกำหนดถ้าลงทะเบียนไว้กับสาขา' },
    { question: 'จองคิวศูนย์บริการได้ทางไหน', answer: 'กรอกฟอร์มนัดหมายออนไลน์ในหน้านี้ เจ้าหน้าที่จะโทรกลับยืนยันคิวภายใน 1 ชั่วโมงในเวลาทำการ หรือโทรหาสาขาที่สะดวกโดยตรง / ทัก LINE พร้อมแจ้งรุ่นรถ เลขไมล์ และเรื่องที่ต้องการเข้ารับบริการ' },
    { question: 'ซื้อรถจากที่อื่นเข้าศูนย์ที่นี่ได้ไหม', answer: 'ได้ ศูนย์บริการของเรารับดูแลรถ BYD ทุกคันตามเงื่อนไขการรับประกันของ BYD ประเทศไทย' },
  ],
}

export async function generateMetadata(): Promise<Metadata> {
  const pc = await getPageContent()
  return {
    title: pc.svSeoTitle || D.seoTitle,
    description: pc.svSeoDesc || D.seoDesc,
    alternates: { canonical: '/service' },
  }
}

export default async function ServicePage() {
  const [{ branches, models, settings }, pc] = await Promise.all([getSiteData(), getPageContent()])
  const serviceBranches = branches.filter((b) => SERVICE_BRANCH_CODES.includes(b.code))
  const n = branches.length
  const services = pc.svServices?.length ? pc.svServices : D.services
  const faq = pc.svFaq?.length ? pc.svFaq : D.faq

  return (
    <>
      {faq.length > 0 ? <Jsonld data={faqLd(faq)} /> : null}
      <section className="page-head">
        <div className="container">
          <p className="kicker">{pc.svKicker || D.kicker}</p>
          <h1>{fillTokens(pc.svTitle || D.title, n)}</h1>
          <p className="lead">{fillTokens(pc.svLead || D.lead, n)}</p>
        </div>
      </section>
      <main className="container">
        <section className="section" style={{ paddingTop: 20 }}>
          {services.length > 0 ? (
            <div className="grid-2">
              {services.map((s) => (
                <div className="card svc" key={s.title} id={s.icon === 'shield' ? 'body-paint' : undefined}>
                  <span className="branch-ico"><Icon name={s.icon || 'wrench'} size={20} /></span>
                  <h3>{s.title}</h3>
                  <p>{s.body}</p>
                </div>
              ))}
            </div>
          ) : null}
          <div className="grid-2" style={{ marginTop: 14 }}>
            <a className="btn btn-red btn-lg" href="#appointment"><Icon name="calendar" size={20} color="#fff" />จองคิวออนไลน์</a>
            <a className="btn btn-outline btn-lg" href={telHref(settings.mainPhone)}><Icon name="phone" size={20} />โทรจองคิว {settings.mainPhone}</a>
            {settings.lineUrl ? (
              <a className="btn btn-green btn-lg" href={settings.lineUrl} target="_blank" rel="noopener noreferrer"><Icon name="chat" size={20} color="#fff" />จองคิวทาง LINE</a>
            ) : (
              <Link className="btn btn-outline btn-lg" href="/rental"><Icon name="key" size={20} />รถทดแทนระหว่างซ่อม</Link>
            )}
          </div>
        </section>
        <section className="section" id="appointment" style={{ scrollMarginTop: 90 }}>
          <div className="sec-head">
            <div>
              <p className="kicker">Appointment</p>
              <h2>นัดหมายเข้าศูนย์บริการ / ซ่อมสีตัวถัง</h2>
              <p className="mute">กรอกข้อมูลรถและช่วงเวลาที่สะดวก เจ้าหน้าที่ศูนย์บริการสาขาที่เลือกจะโทรกลับยืนยันคิว</p>
            </div>
          </div>
          <div className="card" style={{ padding: 20, maxWidth: 760 }}>
            <ServiceApptForm models={models} branches={serviceBranches} settings={settings} />
          </div>
        </section>
        <section className="section">
          <div className="sec-head"><div><h2>เลือกสาขาที่จะเข้ารับบริการ</h2></div></div>
          <div className="branch-list">
            {branches.map((b) => <BranchCard key={b.id} b={b} lineUrl={settings.lineUrl} />)}
          </div>
        </section>
        {faq.length > 0 ? (
          <section className="section">
            <div className="sec-head"><div><h2>คำถามที่พบบ่อย</h2></div></div>
            <Faq items={faq} />
          </section>
        ) : null}
      </main>
    </>
  )
}
