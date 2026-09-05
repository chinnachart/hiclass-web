import type { Metadata } from 'next'
import Link from 'next/link'
import Icon from '@/components/Icons'
import { Faq } from '@/components/Cards'
import Jsonld, { faqLd } from '@/components/Jsonld'
import { getSiteData } from '@/lib/data'
import { baht, telHref } from '@/lib/format'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'เช่ารถ BYD รายวัน รายเดือน ในกรุงเทพฯ',
  description:
    'บริการเช่ารถยนต์ไฟฟ้า BYD ทั้งรายวันและรายเดือน สำหรับลูกค้าบุคคลและองค์กร รับรถได้ที่ 5 สาขาในกรุงเทพฯ และปริมณฑล',
  alternates: { canonical: '/rental' },
}

const FAQ = [
  {
    question: 'เช่ารถ BYD รายเดือน ราคาเท่าไหร่',
    answer:
      'ค่าเช่าขึ้นอยู่กับรุ่นและระยะเวลาเช่า ดูอัตราเริ่มต้นของแต่ละรุ่นได้ในหน้านี้ เช่าระยะยาวมีส่วนลดเพิ่ม ติดต่อสาขาเพื่อขอใบเสนอราคา',
  },
  {
    question: 'ใช้เอกสารอะไรบ้างในการเช่า',
    answer:
      'บุคคลธรรมดาใช้บัตรประชาชนและใบขับขี่ที่ยังไม่หมดอายุ ส่วนนิติบุคคลใช้หนังสือรับรองบริษัทและเอกสารผู้มีอำนาจลงนาม ทีมงานแจ้งรายละเอียดครบก่อนวันรับรถ',
  },
  {
    question: 'ชาร์จไฟระหว่างเช่าอย่างไร',
    answer:
      'รถทุกคันมีสายชาร์จให้ และใช้สถานีชาร์จสาธารณะได้ทั่วประเทศ ทีมงานแนะนำวิธีใช้และแอปหาสถานีชาร์จให้ตอนรับรถ',
  },
  {
    question: 'มีรถให้เช่าระหว่างนำรถเข้าศูนย์บริการไหม',
    answer: 'มีครับ ลูกค้าที่นำรถเข้าศูนย์บริการของเราสามารถขอใช้บริการรถทดแทนได้ สอบถามล่วงหน้ากับสาขาที่นัดหมายไว้',
  },
]

export default async function RentalPage() {
  const { models, branches, settings } = await getSiteData()
  const rentals = models.filter((m) => m.rentalAvailable && (m.rentalDaily || m.rentalMonthly))

  return (
    <>
      <Jsonld data={faqLd(FAQ)} />
      <section className="page-head">
        <div className="container">
          <p className="kicker">บริการรถให้เช่า</p>
          <h1>เช่ารถ BYD รายวันและรายเดือน</h1>
          <p className="lead">
            ขับรถไฟฟ้าก่อนตัดสินใจซื้อ หรือใช้เป็นรถประจำบริษัทโดยไม่ต้องลงทุนก้อนใหญ่ รับรถได้ที่ {branches.length} สาขาในกรุงเทพฯ และปริมณฑล
          </p>
        </div>
      </section>
      <main className="container">
        <section className="section" style={{ paddingTop: 20 }}>
          {rentals.length > 0 ? (
            <div className="grid-3">
              {rentals.map((m) => (
                <div className="card price-card" key={m.id} style={{ display: 'flex' }}>
                  <Link href={`/car-model/${m.slug}`} className="display" style={{ fontSize: 18 }}>BYD {m.name}</Link>
                  <span className="mute small">{m.tagline}</span>
                  <div className="r"><span>รายวัน</span><b>{m.rentalDaily ? `${baht(m.rentalDaily)} ฿` : '—'}</b></div>
                  <div className="r hi"><span>รายเดือน</span><b>{m.rentalMonthly ? `${baht(m.rentalMonthly)} ฿` : '—'}</b></div>
                  <a className="btn btn-outline" href={telHref(settings.mainPhone)}><Icon name="phone" size={16} />สอบถามคันว่าง</a>
                </div>
              ))}
            </div>
          ) : (
            <div className="notice warn">
              <strong>ยังไม่ได้กรอกอัตราค่าเช่า</strong> — เข้าหลังบ้าน → รุ่นรถ → เลือกรุ่น → หัวข้อ &ldquo;บริการรถให้เช่า&rdquo; ติ๊ก &ldquo;รุ่นนี้มีให้เช่า&rdquo; แล้วกรอกราคา รุ่นนั้นจะขึ้นในหน้านี้ทันที
            </div>
          )}
          <div className="grid-2" style={{ marginTop: 14 }}>
            <a className="btn btn-red btn-lg" href={telHref(settings.mainPhone)}><Icon name="phone" size={20} color="#fff" />โทรสอบถามค่าเช่า</a>
            <Link className="btn btn-outline btn-lg" href="/branches"><Icon name="pin" size={20} />ดูสาขาที่รับรถได้</Link>
          </div>
        </section>
        <section className="section">
          <div className="sec-head"><div><h2>คำถามที่ถามบ่อยเรื่องเช่ารถ</h2></div></div>
          <Faq items={FAQ} />
        </section>
      </main>
    </>
  )
}
