import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import Icon from '@/components/Icons'
import { BranchCard, Faq } from '@/components/Cards'
import Jsonld, { faqLd } from '@/components/Jsonld'
import { getPageContent, getSiteData } from '@/lib/data'
import { fillTokens } from '@/lib/format'
import ServiceApptForm from '@/components/ServiceApptForm'
import CallPicker from '@/components/CallPicker'
import { SERVICE_BRANCH_CODES } from '@/lib/serviceAppt'
import { SVC_PHOTO, BP_STEPS } from '@/lib/serviceMedia'

/** รูปบนการ์ดบริการ — ผูกกับไอคอน (ข้อความการ์ดแก้ในหลังบ้านได้ แต่ไอคอนเป็นตัวบอกว่าการ์ดไหนคืออะไร) */
const CARD_PHOTO: Record<string, { src: string; alt: string }> = { wrench: SVC_PHOTO.receptionWide, shield: SVC_PHOTO.booth }

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
    { question: 'เช็กระยะ BYD ต้องเข้าทุกกี่กิโลเมตร', answer: 'ครั้งแรกที่ 5,000 กม. หรือ 3 เดือน จากนั้นทุก 20,000 กม. หรือ 1 ปี แล้วแต่อย่างใดถึงก่อน เข้าก่อนหรือหลังกำหนดได้ไม่เกิน 1,000 กม. ในแต่ละรอบ ทั้งนี้ให้ยึดตามสมุดรับประกันของรถแต่ละรุ่นเป็นหลัก' },
    { question: 'จองคิวศูนย์บริการได้ทางไหน', answer: 'กรอกฟอร์มนัดหมายออนไลน์ในหน้านี้ เจ้าหน้าที่จะโทรกลับยืนยันคิวภายใน 1 ชั่วโมงในเวลาทำการ หรือโทรหาสาขาที่สะดวกโดยตรง / ทัก LINE พร้อมแจ้งรุ่นรถ เลขไมล์ และเรื่องที่ต้องการเข้ารับบริการ' },
    { question: 'นำรถเข้าซ่อมสาขาอื่นที่ไม่ใช่สาขาที่ออกรถได้ไหม', answer: 'ได้ ท่านสามารถนำรถเข้ารับบริการซ่อมบำรุงได้ทุกศูนย์บริการ BYD ทั่วประเทศ รวมถึงรถที่ซื้อจากผู้จำหน่ายรายอื่น' },
    { question: 'รถเสียฉุกเฉิน ติดต่อบริการช่วยเหลือ (Roadside Assistance) ได้อย่างไร', answer: 'โทร Call Center 02-045-8888 แล้วกด 3 เพื่อเข้าสู่บริการช่วยเหลือฉุกเฉิน ให้บริการตลอด 24 ชั่วโมง' },
    { question: 'ตรวจสอบสุขภาพแบตเตอรี่ได้ที่ไหน', answer: 'นำรถเข้ารับการตรวจสอบได้ทุกศูนย์บริการ BYD ทั่วประเทศ' },
    { question: 'ต้อง Calibrate & Balance แบตเตอรี่บ่อยแค่ไหน', answer: 'ควรทำอย่างน้อย 6 เดือนต่อครั้งตามคู่มือการใช้งาน โดยใช้จนแบตเตอรี่ต่ำกว่า 10% แล้วชาร์จด้วยไฟ AC ให้เต็ม 100%' },
    { question: 'ปล่อยแบตเตอรี่เหลือ 0% จะมีผลต่อการรับประกันไหม', answer: 'เมื่อระยะวิ่งแสดงเหลือ 0 ต้องชาร์จทันที หากไม่ชาร์จภายใน 7 วัน แบตเตอรี่อาจเสียหายถาวร ซึ่งไม่อยู่ภายใต้เงื่อนไขการรับประกันของ BYD' },
    { question: 'อยากได้เมนูภาษาไทย Apple CarPlay หรือ Android Auto ต้องทำอย่างไร', answer: 'นำรถเข้าศูนย์บริการใกล้บ้าน แล้วแจ้งเจ้าหน้าที่ให้อัปเดตซอฟต์แวร์ให้' },
    { question: 'ติดฟิล์มหรือติดตั้งอุปกรณ์เสริมจากร้านข้างนอก มีผลต่อการรับประกันไหม', answer: 'การติดฟิล์มไม่ส่งผลต่อการรับประกัน แต่หากอุปกรณ์เสริมที่ติดตั้งส่งผลต่อรถทั้งทางตรงหรือทางอ้อม จะส่งผลต่อการรับประกัน' },
    { question: 'เครื่องชาร์จที่บ้าน (Wall Charger) มีปัญหา ติดต่อใคร', answer: 'โทร Call Center เครื่องชาร์จ 02-114-7571 มีเจ้าหน้าที่ดูแลโดยตรง' },
    { question: 'สอบถามอะไหล่ได้ที่ไหน', answer: 'ติดต่อศูนย์บริการสาขาที่สะดวก ศูนย์บริการมีการสำรองอะไหล่สำหรับซ่อมบำรุงไว้พร้อมให้บริการ' },
  ],
}

export async function generateMetadata(): Promise<Metadata> {
  const pc = await getPageContent()
  return {
    title: pc.svSeoTitle || D.seoTitle,
    description: pc.svSeoDesc || D.seoDesc,
    alternates: { canonical: '/service' },
    openGraph: { images: [{ url: SVC_PHOTO.lift.src, width: 1920, height: 1080, alt: SVC_PHOTO.lift.alt }] },
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
        <div className="container svc-head">
          <div>
            <p className="kicker">{pc.svKicker || D.kicker}</p>
            <h1>{fillTokens(pc.svTitle || D.title, n)}</h1>
            <p className="lead">{fillTokens(pc.svLead || D.lead, n)}</p>
          </div>
          <div className="svc-head-img">
            <Image src={SVC_PHOTO.lift.src} alt={SVC_PHOTO.lift.alt} fill priority sizes="(max-width: 900px) 100vw, 560px" style={{ objectFit: 'cover' }} />
          </div>
        </div>
      </section>
      <main className="container">
        <section className="section" style={{ paddingTop: 20 }}>
          {services.length > 0 ? (
            <div className="grid-2">
              {services.map((s) => {
                const ph = CARD_PHOTO[s.icon || '']
                return (
                  <div className={`card svc${ph ? ' has-photo' : ''}`} key={s.title}>
                    {ph ? (
                      <div className="svc-photo">
                        <Image src={ph.src} alt={ph.alt} fill sizes="(max-width: 700px) 100vw, 540px" style={{ objectFit: 'cover' }} />
                      </div>
                    ) : null}
                    <span className="branch-ico"><Icon name={s.icon || 'wrench'} size={20} /></span>
                    <h3>{s.title}</h3>
                    <p>{s.body}</p>
                    {s.icon === 'shield' ? <a className="more" href="#body-paint">ดูขั้นตอนงานอู่สี <Icon name="chev" size={14} /></a> : null}
                  </div>
                )
              })}
            </div>
          ) : null}
          <div className="grid-2" style={{ marginTop: 14 }}>
            <a className="btn btn-red btn-lg" href="#appointment"><Icon name="calendar" size={20} color="#fff" />จองคิวออนไลน์</a>
            <CallPicker branches={serviceBranches} label="โทรจองคิว" className="btn btn-outline btn-lg" iconSize={20} title="โทรจองคิวศูนย์บริการ — เลือกสาขา" />
            {settings.lineUrl ? (
              <a className="btn btn-green btn-lg" href={settings.lineUrl} target="_blank" rel="noopener noreferrer"><Icon name="chat" size={20} color="#fff" />จองคิวทาง LINE</a>
            ) : (
              <Link className="btn btn-outline btn-lg" href="/rental"><Icon name="key" size={20} />รถทดแทนระหว่างซ่อม</Link>
            )}
          </div>
        </section>
        <section className="section" id="body-paint" style={{ scrollMarginTop: 90 }}>
          <div className="sec-head">
            <div>
              <p className="kicker">Body &amp; Paint</p>
              <h2>อู่สีและซ่อมตัวถัง</h2>
              <p className="mute">ศูนย์ซ่อมสีและตัวถังมาตรฐาน BYD ใช้อะไหล่แท้ ประสานงานเคลมประกันให้ — ขั้นตอนงานจากอู่สีของเรา</p>
            </div>
          </div>
          <ol className="bp-steps">
            {BP_STEPS.map((st, i) => (
              <li className="card bp-step" key={st.src}>
                <div className="bp-img">
                  <Image src={st.src} alt={st.alt} fill sizes="(max-width: 700px) 100vw, (max-width: 1000px) 50vw, 360px" style={{ objectFit: 'cover' }} />
                  <span className="bp-no">{i + 1}</span>
                </div>
                <div className="bp-txt">
                  <h3>{st.title}</h3>
                  <p>{st.body}</p>
                </div>
              </li>
            ))}
          </ol>
          <div style={{ marginTop: 14 }}>
            <a className="btn btn-red btn-lg" href="#appointment"><Icon name="calendar" size={20} color="#fff" />นัดหมายซ่อมสีตัวถัง</a>
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
          <div className="appt-wrap">
            <div className="card" style={{ padding: 20, maxWidth: 760 }}>
              <ServiceApptForm models={models} branches={serviceBranches} settings={settings} />
            </div>
            <div className="appt-side" aria-hidden="true">
              <div className="appt-img">
                <Image src={SVC_PHOTO.tech.src} alt="" fill sizes="340px" style={{ objectFit: 'cover' }} />
              </div>
              <p className="mute">ช่างผ่านการอบรมจาก BYD ใช้อะไหล่แท้ — ส่งฟอร์มแล้วเจ้าหน้าที่สาขาที่เลือกจะโทรกลับยืนยันคิว</p>
            </div>
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
