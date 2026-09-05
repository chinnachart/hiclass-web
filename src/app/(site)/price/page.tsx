import type { Metadata } from 'next'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import PriceTable from '@/components/PriceTable'
import Jsonld, { faqLd } from '@/components/Jsonld'
import { getSiteData } from '@/lib/data'
import { baht } from '@/lib/format'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'ราคา BYD ทุกรุ่น พร้อมตารางผ่อน อัปเดตล่าสุด',
  description:
    'ตารางราคาและค่างวด BYD ทุกรุ่น ปรับเงินดาวน์และจำนวนงวดเพื่อดูค่าผ่อนต่อเดือนได้ทันที พร้อมนัดทดลองขับที่ 5 สาขาในกรุงเทพฯ',
  alternates: { canonical: '/price' },
}

const FAQ = [
  {
    question: 'ผ่อน BYD เดือนละเท่าไหร่',
    answer:
      'ขึ้นอยู่กับรุ่น เงินดาวน์ และจำนวนงวด ตารางในหน้านี้คำนวณให้ทันทีเมื่อปรับเงินดาวน์และงวด โดยใช้อัตราดอกเบี้ยคงที่ที่ใช้อยู่จริง ตัวเลขเป็นการประมาณเบื้องต้น เงื่อนไขจริงขึ้นอยู่กับการอนุมัติของสถาบันการเงิน',
  },
  {
    question: 'ดาวน์น้อยที่สุดได้เท่าไหร่',
    answer:
      'ปกติเริ่มที่ 0–20% ขึ้นอยู่กับรุ่น โปรโมชันช่วงนั้น และผลอนุมัติสินเชื่อของลูกค้าแต่ละราย ทีมขายช่วยประเมินให้ก่อนได้',
  },
  {
    question: 'ราคานี้รวมอะไรบ้าง',
    answer:
      'ราคาที่แสดงเป็นราคาเริ่มต้นของรุ่นนั้น ยังไม่รวมค่าจดทะเบียน ประกันภัย และอุปกรณ์เสริม ทีมขายสรุปยอดรวมทั้งหมดให้ก่อนตัดสินใจ',
  },
  {
    question: 'ต้องไปโชว์รูมไหมถึงจะรู้ค่างวด',
    answer:
      'ไม่ต้อง ใช้ตารางในหน้านี้คำนวณเองได้เลย และถ้าต้องการใบเสนอราคาจริง กดนัดทดลองขับแล้วทีมขายจะติดต่อกลับพร้อมตัวเลขที่ใช้ยื่นไฟแนนซ์ได้',
  },
]

export default async function PricePage() {
  const { models, branches, settings } = await getSiteData()
  const cheapest = models.reduce((a, b) => (a.priceFrom < b.priceFrom ? a : b), models[0])

  return (
    <>
      <Jsonld data={faqLd(FAQ)} />
      <Header models={models} branches={branches} phone={settings.mainPhone} />

      <main className="shell">
        <section className="pagehead">
          <p className="kicker">ราคาและค่างวด</p>
          <h1 className="pagetitle">ราคา BYD ทุกรุ่น พร้อมตารางผ่อน</h1>
          <p className="pagelede">
            ปรับเงินดาวน์และจำนวนงวดด้านล่าง ตัวเลขค่างวดขยับตามทันทีทุกรุ่น
            {cheapest ? <> เริ่มต้นที่ <strong>{baht(cheapest.priceFrom)} บาท</strong> สำหรับ BYD {cheapest.name}</> : null}
          </p>

          <PriceTable models={models} settings={settings} />

          <p className="fineprint-block">
            {settings.financeNote}
          </p>

          <div className="cta-row">
            <Link className="btn" href="/test-drive">ขอใบเสนอราคาจริง</Link>
            <Link className="btn ghost" href="/car-model">ดูสเปกแต่ละรุ่น</Link>
          </div>
        </section>

        <section>
          <div className="sec-head"><div><h2>คำถามที่ถามบ่อยเรื่องราคาและค่างวด</h2></div></div>
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

      <Footer models={models} branches={branches} settings={settings} />
    </>
  )
}
