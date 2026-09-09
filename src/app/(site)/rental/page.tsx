import type { Metadata } from 'next'
import Link from 'next/link'
import Icon from '@/components/Icons'
import { Faq } from '@/components/Cards'
import Jsonld, { faqLd } from '@/components/Jsonld'
import { getPageContent, getSiteData } from '@/lib/data'
import { baht, fillTokens, telHref } from '@/lib/format'

export const dynamic = 'force-dynamic'

/** ข้อความตั้งต้น — ใช้เมื่อยังไม่ได้กรอกในหลังบ้าน (ข้อความในหน้าต่างๆ → รถเช่า) */
const D = {
  kicker: 'บริการรถให้เช่า',
  title: 'เช่ารถ BYD รายวันและรายเดือน',
  lead: 'ขับรถไฟฟ้าก่อนตัดสินใจซื้อ หรือใช้เป็นรถประจำบริษัทโดยไม่ต้องลงทุนก้อนใหญ่ รับรถได้ที่ {สาขา} สาขาในกรุงเทพฯ และปริมณฑล',
  fineprint: 'ราคาต่อวัน รวมภาษีมูลค่าเพิ่มแล้ว · เช่ายิ่งนานราคาต่อวันยิ่งถูกลง · จำนวนรถมีจำกัด กรุณาโทรเช็กคันว่างก่อนทุกครั้ง',
  seoTitle: 'เช่ารถ BYD รายวัน รายเดือน ในกรุงเทพฯ',
  seoDesc:
    'บริการเช่ารถยนต์ไฟฟ้า BYD ทั้งรายวันและรายเดือน สำหรับลูกค้าบุคคลและองค์กร รับรถได้ที่ 5 สาขาในกรุงเทพฯ และปริมณฑล',
  faq: [
    {
      question: 'เช่ารถ BYD รายเดือน ราคาเท่าไหร่',
      answer:
        'ค่าเช่าขึ้นอยู่กับรุ่นและระยะเวลาเช่า ดูตารางเรทต่อวันของทุกรุ่นได้ในหน้านี้ ราคารวมภาษีมูลค่าเพิ่มแล้ว เช่า 30 วันขึ้นไปได้ราคาต่อวันถูกที่สุด ติดต่อสาขาเพื่อขอใบเสนอราคา',
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
  ],
}

export async function generateMetadata(): Promise<Metadata> {
  const pc = await getPageContent()
  return {
    title: pc.rtSeoTitle || D.seoTitle,
    description: pc.rtSeoDesc || D.seoDesc,
    alternates: { canonical: '/rental' },
  }
}

type Row = { key: string; slug: string; label: string; day1?: number | null; day3?: number | null; day7?: number | null; day30?: number | null }

const TIERS = [
  { key: 'day1' as const, head: '1 วัน' },
  { key: 'day3' as const, head: '3 วัน' },
  { key: 'day7' as const, head: '7 วัน' },
  { key: 'day30' as const, head: '30 วัน' },
]

export default async function RentalPage() {
  const [{ models, branches, settings }, pc] = await Promise.all([getSiteData(), getPageContent()])
  const faq = pc.rtFaq?.length ? pc.rtFaq : D.faq
  const rentals = models.filter((m) => m.rentalAvailable && (m.rentalRates?.length || m.rentalDaily || m.rentalMonthly))
  const rows: Row[] = rentals.flatMap((m) =>
    m.rentalRates?.length
      ? m.rentalRates.map((r, i) => ({
          key: `${m.id}-${i}`,
          slug: m.slug,
          label: `BYD ${m.name}${r.variant ? ` ${r.variant}` : ''}`,
          day1: r.day1,
          day3: r.day3,
          day7: r.day7,
          day30: r.day30,
        }))
      : [{ key: `${m.id}`, slug: m.slug, label: `BYD ${m.name}`, day1: m.rentalDaily, day3: null, day7: null, day30: m.rentalMonthly ? Math.round(m.rentalMonthly / 30) : null }],
  )

  return (
    <>
      {faq.length > 0 ? <Jsonld data={faqLd(faq)} /> : null}
      <section className="page-head">
        <div className="container">
          <p className="kicker">{pc.rtKicker || D.kicker}</p>
          <h1>{fillTokens(pc.rtTitle || D.title, branches.length)}</h1>
          <p className="lead">{fillTokens(pc.rtLead || D.lead, branches.length)}</p>
        </div>
      </section>
      <main className="container">
        <section className="section" style={{ paddingTop: 20 }}>
          {rows.length > 0 ? (
            <>
              <div className="price-table">
                <table>
                  <thead>
                    <tr>
                      <th>รุ่นรถ</th>
                      {TIERS.map((t) => (
                        <th key={t.key} style={{ textAlign: 'right' }}>{t.head}</th>
                      ))}
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((r) => (
                      <tr key={r.key}>
                        <td>
                          <Link href={`/car-model/${r.slug}`} style={{ fontWeight: 600 }}>{r.label}</Link>
                        </td>
                        {TIERS.map((t) => (
                          <td key={t.key} className={t.key === 'day30' ? 'num hi' : 'num'}>
                            {r[t.key] ? `${baht(r[t.key] as number)} ฿` : '—'}
                          </td>
                        ))}
                        <td style={{ textAlign: 'right' }}>
                          <a className="btn btn-outline" href={telHref(settings.mainPhone)}>สอบถาม</a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="price-cards">
                {rows.map((r) => (
                  <div className="card price-card" key={r.key}>
                    <Link href={`/car-model/${r.slug}`} className="display" style={{ fontSize: 17 }}>{r.label}</Link>
                    {TIERS.map((t) => (
                      <div className={t.key === 'day30' ? 'r hi' : 'r'} key={t.key}>
                        <span>เช่า {t.head}</span>
                        <b>{r[t.key] ? `${baht(r[t.key] as number)} ฿/วัน` : '—'}</b>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
              <p className="fineprint" style={{ marginTop: 10 }}>{pc.rtFineprint || D.fineprint}</p>
            </>
          ) : (
            <div className="notice warn">
              <strong>ยังไม่ได้กรอกอัตราค่าเช่า</strong> — เข้าหลังบ้าน → รุ่นรถ → เลือกรุ่น → หัวข้อ &ldquo;บริการรถให้เช่า&rdquo; ติ๊ก &ldquo;รุ่นนี้มีให้เช่า&rdquo; แล้วกรอกเรทค่าเช่าแยกรุ่นย่อย รุ่นนั้นจะขึ้นในหน้านี้ทันที
            </div>
          )}
          <div className="grid-2" style={{ marginTop: 14 }}>
            <a className="btn btn-red btn-lg" href={telHref(settings.mainPhone)}><Icon name="phone" size={20} color="#fff" />โทรสอบถามค่าเช่า</a>
            <Link className="btn btn-outline btn-lg" href="/branches"><Icon name="pin" size={20} />ดูสาขาที่รับรถได้</Link>
          </div>
        </section>
        {faq.length > 0 ? (
          <section className="section">
            <div className="sec-head"><div><h2>คำถามที่ถามบ่อยเรื่องเช่ารถ</h2></div></div>
            <Faq items={faq} />
          </section>
        ) : null}
      </main>
    </>
  )
}
