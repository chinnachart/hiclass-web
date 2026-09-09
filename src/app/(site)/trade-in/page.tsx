import type { Metadata } from 'next'
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
        <div className="container">
          <p className="kicker"><Icon name="wheel" size={14} />{pc.tiKicker || D.kicker}</p>
          <h1>{pc.tiTitle || D.title}</h1>
          <p className="lead">{pc.tiLead || D.lead}</p>
        </div>
      </section>
      <main className="container">
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
