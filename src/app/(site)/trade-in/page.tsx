import type { Metadata } from 'next'
import Icon from '@/components/Icons'
import Jsonld, { faqLd } from '@/components/Jsonld'
import TradeInForm from '@/components/TradeInForm'
import { getSiteData } from '@/lib/data'

export const metadata: Metadata = {
  title: 'เทิร์นรถเก่า ซื้อ BYD ใหม่ — ประเมินราคาออนไลน์ ฟรี',
  description:
    'ส่งรูปและข้อมูลรถคันเดิมผ่านเว็บ ทีม Hi-Class EV Car ประเมินราคาเบื้องต้นให้ภายใน 24 ชั่วโมง รับเทิร์นทุกยี่ห้อ ทั้งรถน้ำมัน ไฮบริด และรถไฟฟ้า ไม่มีค่าใช้จ่าย ไม่มีข้อผูกมัด',
  alternates: { canonical: '/trade-in' },
}

export const dynamic = 'force-dynamic'

const FAQ = [
  { question: 'เทิร์นรถเก่ากับ BYD Hi-Class ต้องเป็นรถยี่ห้อไหน', answer: 'รับเทิร์นทุกยี่ห้อ ทั้งรถน้ำมัน ไฮบริด และรถไฟฟ้า ขอเพียงเป็นรถจดทะเบียนถูกต้องและมีเล่มทะเบียน' },
  { question: 'รถยังผ่อนไม่หมด เทิร์นได้ไหม', answer: 'ได้ ทีมงานจะคำนวณยอดปิดไฟแนนซ์ให้ ส่วนต่างระหว่างราคาประเมินกับยอดปิดสามารถนำมาเป็นเงินดาวน์ BYD คันใหม่ได้' },
  { question: 'ประเมินราคาใช้เวลานานแค่ไหน', answer: 'หลังส่งรูปและข้อมูลผ่านเว็บ จะได้รับราคาประเมินเบื้องต้นภายใน 24 ชั่วโมง ราคายืนยันสุดท้ายจะแจ้งหลังตรวจสภาพรถจริงที่สาขา' },
  { question: 'ต้องเตรียมเอกสารอะไรบ้าง', answer: 'เล่มทะเบียนรถ บัตรประชาชนเจ้าของรถ และถ้ายังผ่อนอยู่ ให้เตรียมชื่อไฟแนนซ์และยอดคงเหลือโดยประมาณ' },
  { question: 'ส่งรูปแล้วต้องไปที่สาขาไหม', answer: 'ยังไม่ต้อง ประเมินเบื้องต้นจากรูปได้เลย เมื่อพอใจราคาค่อยนัดนำรถเข้าตรวจสภาพที่สาขาที่สะดวก' },
]

export default async function TradeInPage() {
  const { models, branches, settings } = await getSiteData()
  return (
    <>
      <Jsonld data={faqLd(FAQ)} />
      <section className="page-head">
        <div className="container">
          <p className="kicker"><Icon name="wheel" size={14} />เทิร์นรถเก่า รับ BYD ใหม่</p>
          <h1>ประเมินราคารถเทิร์นออนไลน์ ฟรี ภายใน 24 ชั่วโมง</h1>
          <p className="lead">ถ่ายรูปรถคันเดิม กรอกข้อมูลสั้นๆ ทีมประเมินของ Hi-Class EV Car จะติดต่อกลับพร้อมราคาเบื้องต้น รับเทิร์นทุกยี่ห้อ ไม่มีค่าใช้จ่าย ไม่มีข้อผูกมัด</p>
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
        <section className="section">
          <h2>คำถามที่พบบ่อยเรื่องเทิร์นรถ</h2>
          <div className="faq">
            {FAQ.map((f) => (
              <details key={f.question}>
                <summary>{f.question}</summary>
                <p>{f.answer}</p>
              </details>
            ))}
          </div>
        </section>
      </main>
    </>
  )
}
