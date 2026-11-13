import type { Metadata } from 'next'
import Image from 'next/image'
import Icon from '@/components/Icons'
import Jsonld, { faqLd } from '@/components/Jsonld'
import TradeInForm from '@/components/TradeInForm'
import { getPageContent, getSiteData } from '@/lib/data'

export const dynamic = 'force-dynamic'

/** ข้อความตั้งต้น — ใช้เมื่อยังไม่ได้กรอกในหลังบ้าน (ข้อความในหน้าต่างๆ → เทิร์นรถเก่า) */
const D = {
  kicker: 'เทิร์นรถเก่า รับ BYD ใหม่',
  title: 'ประเมินราคารถเทิร์นออนไลน์ ฟรี ภายใน 24 ชั่วโมง',
  lead: 'ถ่ายรูปรถคันเดิม กรอกข้อมูลสั้นๆ ทีมประเมินของ Hi-Class EV Car จะติดต่อกลับพร้อมราคาเบื้องต้น รับเทิร์นทุกยี่ห้อ ไม่มีค่าใช้จ่าย ไม่มีข้อผูกมัด',
  seoTitle: 'เทิร์นรถเก่า ซื้อ BYD ใหม่ — ประเมินราคาออนไลน์ ฟรี',
  seoDesc:
    'ส่งรูปและข้อมูลรถคันเดิมผ่านเว็บ ทีม Hi-Class EV Car ประเมินราคาเบื้องต้นให้ภายใน 24 ชั่วโมง รับเทิร์นทุกยี่ห้อ ทั้งรถน้ำมัน ไฮบริด และรถไฟฟ้า ไม่มีค่าใช้จ่าย ไม่มีข้อผูกมัด',
  faq: [
    { question: 'เทิร์นรถเก่ากับ BYD Hi-Class ต้องเป็นรถยี่ห้อไหน', answer: 'รับเทิร์นทุกยี่ห้อ ทั้งรถน้ำมัน ไฮบริด และรถไฟฟ้า ขอเพียงเป็นรถจดทะเบียนถูกต้องและมีเล่มทะเบียน' },
    { question: 'รถยังผ่อนไม่หมด เทิร์นได้ไหม', answer: 'ได้ ทีมงานจะคำนวณยอดปิดไฟแนนซ์ให้ ส่วนต่างระหว่างราคาประเมินกับยอดปิดสามารถนำมาเป็นเงินดาวน์ BYD คันใหม่ได้' },
    { question: 'ประเมินราคาใช้เวลานานแค่ไหน', answer: 'หลังส่งรูปและข้อมูลผ่านเว็บ จะได้รับราคาประเมินเบื้องต้นภายใน 24 ชั่วโมง ราคายืนยันสุดท้ายจะแจ้งหลังตรวจสภาพรถจริงที่สาขา' },
    { question: 'ต้องเตรียมเอกสารอะไรบ้าง', answer: 'เล่มทะเบียนรถ บัตรประชาชนเจ้าของรถ และถ้ายังผ่อนอยู่ ให้เตรียมชื่อไฟแนนซ์และยอดคงเหลือโดยประมาณ' },
    { question: 'ส่งรูปแล้วต้องไปที่สาขาไหม', answer: 'ยังไม่ต้อง ประเมินเบื้องต้นจากรูปได้เลย เมื่อพอใจราคาค่อยนัดนำรถเข้าตรวจสภาพที่สาขาที่สะดวก' },
  ],
}

/** 3 ขั้นตอนเทิร์นรถ — ภาพลายเส้นวาดเอง (SVG) สีตามธีมเว็บ */
const SV = { width: 56, height: 56, viewBox: '0 0 56 56', fill: 'none', stroke: 'currentColor', strokeWidth: 2.2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }
const TI_STEPS = [
  {
    title: 'ถ่ายรูปและกรอกข้อมูล',
    body: 'ถ่ายรูปรถคันเดิมรอบคัน กรอกรุ่น ปี และเลขไมล์ ใช้เวลาไม่กี่นาที',
    art: (
      <svg {...SV}>
        <rect x="16" y="6" width="24" height="44" rx="5" />
        <path d="M25 11h6" />
        <path d="M21 31l1.6-4.6a2 2 0 0 1 1.9-1.4h7a2 2 0 0 1 1.9 1.4L35 31" />
        <rect x="20" y="31" width="16" height="6" rx="2" />
        <circle cx="24" cy="39.5" r="1.6" /><circle cx="32" cy="39.5" r="1.6" />
        <circle cx="28" cy="19" r="2.4" stroke="var(--red)" />
      </svg>
    ),
  },
  {
    title: 'รับราคาประเมินเบื้องต้น',
    body: 'ทีมประเมินติดต่อกลับพร้อมราคาเบื้องต้น ภายใน 24 ชั่วโมง',
    art: (
      <svg {...SV}>
        <path d="M14 8h20l8 8v32H14z" />
        <path d="M34 8v8h8" />
        <path d="M20 24h10M20 31h16" />
        <circle cx="35" cy="41" r="7" stroke="var(--red)" fill="var(--red-soft)" />
        <path d="M32 41l2.2 2.2L38.4 39" stroke="var(--red)" />
      </svg>
    ),
  },
  {
    title: 'นัดดูรถที่สาขา',
    body: 'พอใจราคาแล้วนัดนำรถเข้าสาขา ตรวจสภาพจริงและรับข้อเสนอสุดท้าย',
    art: (
      <svg {...SV}>
        <path d="M6 48h44" />
        <path d="M10 48V22l18-12 18 12v26" />
        <path d="M22 48V34h12v14" />
        <path d="M28 16c-3.6 0-6 2.6-6 5.6 0 4 6 8.4 6 8.4s6-4.4 6-8.4c0-3-2.4-5.6-6-5.6z" stroke="var(--red)" fill="var(--red-soft)" />
        <circle cx="28" cy="21.6" r="1.8" stroke="var(--red)" />
      </svg>
    ),
  },
]

export async function generateMetadata(): Promise<Metadata> {
  const pc = await getPageContent()
  return {
    title: pc.tiSeoTitle || D.seoTitle,
    description: pc.tiSeoDesc || D.seoDesc,
    alternates: { canonical: '/trade-in' },
  }
}

export default async function TradeInPage() {
  const [{ models, branches, settings }, pc] = await Promise.all([getSiteData(), getPageContent()])
  const faq = pc.tiFaq?.length ? pc.tiFaq : D.faq

  return (
    <>
      {faq.length > 0 ? <Jsonld data={faqLd(faq)} /> : null}
      <section className="page-head">
        <div className="container svc-head">
          <div>
            <p className="kicker"><Icon name="wheel" size={14} />{pc.tiKicker || D.kicker}</p>
            <h1>{pc.tiTitle || D.title}</h1>
            <p className="lead">{pc.tiLead || D.lead}</p>
          </div>
          {/* ภาพประกอบบรรยากาศ (ภาพสร้างด้วย AI ไม่มีรถ/โลโก้) — เปลี่ยนรูป = วางไฟล์ชื่อเดิมทับใน public/brand/ */}
          <div className="svc-head-img">
            <Image src="/brand/trade-in-hero.webp" alt="ส่งมอบกุญแจรถในโชว์รูม" fill priority sizes="(max-width: 900px) 100vw, 520px" style={{ objectFit: 'cover' }} />
          </div>
        </div>
      </section>
      <main className="container">
        <section className="section" style={{ paddingTop: 20, paddingBottom: 0 }}>
          <ol className="ti-steps">
            {TI_STEPS.map((st, i) => (
              <li className="card ti-step" key={st.title}>
                <span className="ti-art" aria-hidden="true">{st.art}</span>
                <div>
                  <p className="ti-no">ขั้นที่ {i + 1}</p>
                  <h3>{st.title}</h3>
                  <p className="mute">{st.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>
        <section className="section" style={{ paddingTop: 20 }}>
          <div className="grid-2" style={{ alignItems: 'start', gridTemplateColumns: 'minmax(0, 1fr)' }}>
            <div className="card" style={{ padding: 20, maxWidth: 640 }}>
              <TradeInForm models={models} branches={branches} settings={settings} />
            </div>
          </div>
        </section>
        {faq.length > 0 ? (
          <section className="section">
            <h2>คำถามที่พบบ่อยเรื่องเทิร์นรถ</h2>
            <div className="faq">
              {faq.map((f) => (
                <details key={f.question}>
                  <summary>{f.question}</summary>
                  <p>{f.answer}</p>
                </details>
              ))}
            </div>
          </section>
        ) : null}
      </main>
    </>
  )
}
