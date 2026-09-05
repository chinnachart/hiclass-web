import type { Metadata } from 'next'
import Link from 'next/link'
import Icon from '@/components/Icons'
import { Faq } from '@/components/Cards'
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
  const { models, settings } = await getSiteData()
  const cheapest = models.reduce((a, b) => (a.priceFrom < b.priceFrom ? a : b), models[0])

  return (
    <>
      <Jsonld data={faqLd(FAQ)} />
      <section className="page-head">
        <div className="container">
          <p className="kicker">ราคาและค่างวด</p>
          <h1>ราคา BYD ทุกรุ่น พร้อมตารางผ่อน</h1>
          <p className="lead">
            ปรับเงินดาวน์และจำนวนงวด ตัวเลขค่างวดขยับตามทันทีทุกรุ่น
            {cheapest ? <> เริ่มต้นที่ <strong style={{ color: 'var(--ink)' }}>{baht(cheapest.priceFrom)} บาท</strong> สำหรับ BYD {cheapest.name}</> : null}
          </p>
        </div>
      </section>
      <main className="container">
        <section className="section" style={{ paddingTop: 20 }}>
          <PriceTable models={models} settings={settings} />
          <div className="grid-2" style={{ marginTop: 14 }}>
            <Link className="btn btn-red btn-lg" href="/test-drive"><Icon name="wheel" size={20} color="#fff" />ขอใบเสนอราคาจริง</Link>
            <Link className="btn btn-outline btn-lg" href="/car-model">ดูสเปกแต่ละรุ่น</Link>
          </div>
        </section>
        <section className="section">
          <div className="sec-head"><div><h2>คำถามที่ถามบ่อยเรื่องราคาและค่างวด</h2></div></div>
          <Faq items={FAQ} />
        </section>
      </main>
    </>
  )
}
