import type { Metadata } from 'next'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
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
      <Header models={models} branches={branches} phone={settings.mainPhone} />

      <main className="shell">
        <section className="pagehead">
          <p className="kicker">บริการรถให้เช่า</p>
          <h1 className="pagetitle">เช่ารถ BYD รายวันและรายเดือน</h1>
          <p className="pagelede">
            ขับรถไฟฟ้าก่อนตัดสินใจซื้อ หรือใช้เป็นรถประจำบริษัทโดยไม่ต้องลงทุนก้อนใหญ่
            รับรถได้ที่ {branches.length} สาขาในกรุงเทพฯ และปริมณฑล
          </p>

          {rentals.length > 0 ? (
            <div className="scroller">
              <table className="price">
                <thead>
                  <tr>
                    <th>รุ่น</th>
                    <th className="r">รายวัน</th>
                    <th className="r">รายเดือน</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {rentals.map((m) => (
                    <tr key={m.id}>
                      <td>
                        <Link href={`/car-model/${m.slug}`} className="mname">BYD {m.name}</Link>
                        <span className="mtag">{m.tagline}</span>
                      </td>
                      <td className="r n">{m.rentalDaily ? `${baht(m.rentalDaily)} ฿` : '—'}</td>
                      <td className="r n hi">{m.rentalMonthly ? `${baht(m.rentalMonthly)} ฿` : '—'}</td>
                      <td className="r">
                        <a className="mini" href={telHref(settings.mainPhone)}>สอบถาม</a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="notice">
              <p>
                <strong>ยังไม่ได้กรอกอัตราค่าเช่า</strong> — เข้าหลังบ้าน → รุ่นรถ → เลือกรุ่น →
                หัวข้อ &ldquo;บริการรถให้เช่า&rdquo; ติ๊ก &ldquo;รุ่นนี้มีให้เช่า&rdquo; แล้วกรอกราคา
                รุ่นนั้นจะขึ้นในตารางนี้ทันที
              </p>
            </div>
          )}

          <div className="cta-row">
            <a className="btn" href={telHref(settings.mainPhone)}>โทรสอบถามค่าเช่า</a>
            <Link className="btn ghost" href="/branches">ดูสาขาที่รับรถได้</Link>
          </div>
        </section>

        <section>
          <div className="sec-head"><div><h2>คำถามที่ถามบ่อยเรื่องเช่ารถ</h2></div></div>
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
