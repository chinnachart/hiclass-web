import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import Icon from '@/components/Icons'
import { PromoGrid, NewsCard } from '@/components/Cards'
import Jsonld, { breadcrumbLd } from '@/components/Jsonld'
import { getSiteData, getPromotionsInRange, getNewsList } from '@/lib/data'
import { baht } from '@/lib/format'
import { financeTable } from '@/lib/finance'
import { parseMonth, isMonthAllowed, shiftMonth, monthKey, FIRST_MONTH } from '@/lib/promoMonth'
import type { NewsItem } from '@/lib/types'

export const dynamic = 'force-dynamic'

// zip #40 — หน้าโปรรายเดือน (ลงวันที่) — คำค้น "โปร byd เดือนตุลาคม 2569"
// ข้อมูลมาจากหลังบ้านเหมือนหน้า /promotion แต่กรองตามเดือน + รวมข่าวโปรของเดือนนั้น + ราคาเริ่มต้นทุกรุ่น

export async function generateMetadata({ params }: { params: Promise<{ month: string }> }): Promise<Metadata> {
  const { month } = await params
  const pm = parseMonth(month)
  if (!pm || !isMonthAllowed(month)) return { title: 'ไม่พบหน้า' }
  const current = month === monthKey()
  return {
    title: `โปรโมชั่น BYD เดือน${pm.labelBE} ทุกรุ่น ดอกเบี้ย ของแถม ส่วนลด`,
    description: `รวมโปรโมชั่นรถยนต์ไฟฟ้า BYD เดือน${pm.labelBE} จาก Hi-Class EV Car 5 สาขากรุงเทพฯ — ดอกเบี้ยพิเศษ ของแถม ส่วนลด เทิร์นรถเก่า พร้อมราคาเริ่มต้นและค่างวดทุกรุ่น${current ? ' อัปเดตล่าสุด' : ''}`,
    alternates: { canonical: `/promotion/${month}` },
  }
}

export default async function PromotionMonthPage({ params }: { params: Promise<{ month: string }> }) {
  const { month } = await params
  const pm = parseMonth(month)
  if (!pm || !isMonthAllowed(month)) notFound()

  const [site, promotions, allNews] = await Promise.all([getSiteData(), getPromotionsInRange(pm.startIso, pm.endIso), getNewsList(60)])
  const { models, settings, branches } = site
  const ft = financeTable(settings)

  // ข่าวที่เป็นโปรของเดือนนี้: ประกาศในเดือนนี้ หรือสิ้นสุดในเดือนนี้
  const news = (allNews as unknown as NewsItem[]).filter((n) => {
    const pub = n.publishedAt ? n.publishedAt.slice(0, 7) : ''
    const end = n.promoEndsAt ? n.promoEndsAt.slice(0, 7) : ''
    return pub === month || end === month
  })

  const prev = shiftMonth(month, -1)
  const next = shiftMonth(month, 1)
  const canPrev = prev >= FIRST_MONTH
  const canNext = isMonthAllowed(next)
  const isCurrent = month === monthKey()
  const isPast = month < monthKey()

  return (
    <>
      <Jsonld data={breadcrumbLd([{ name: 'โปรโมชั่น', path: '/promotion' }, { name: pm.labelBE, path: `/promotion/${month}` }])} />
      <section className="page-head">
        <div className="container">
          <p className="kicker">Promotion · {pm.labelBE}</p>
          <h1>โปรโมชั่น BYD เดือน{pm.labelBE}</h1>
          <p className="lead">
            {isPast
              ? `ข้อเสนอที่เคยมีในเดือน${pm.labelBE} — ดูข้อเสนอที่ใช้ได้ตอนนี้ที่หน้าโปรโมชั่นเดือนนี้`
              : `ข้อเสนอ BYD ทุกรุ่นประจำเดือน${pm.labelBE} ใช้ได้ทั้ง ${branches.length} สาขาในกรุงเทพฯ อัปเดตทุกครั้งที่มีแคมเปญใหม่`}
          </p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12 }}>
            {canPrev ? <Link className="btn btn-outline" href={`/promotion/${prev}`}><Icon name="back" size={16} />{parseMonth(prev)?.labelBE}</Link> : null}
            {!isCurrent ? <Link className="btn btn-primary" href="/promotion">โปรเดือนนี้</Link> : null}
            {canNext ? <Link className="btn btn-outline" href={`/promotion/${next}`}>{parseMonth(next)?.labelBE} <Icon name="chev" size={16} /></Link> : null}
          </div>
        </div>
      </section>

      <main className="container">
        <section className="section" style={{ paddingTop: 20 }}>
          {isPast ? <div className="notice warn" style={{ marginBottom: 14 }}>โปรโมชั่นในหน้านี้สิ้นสุดแล้ว — <Link href="/promotion">ดูโปรโมชั่นที่ใช้ได้ตอนนี้</Link></div> : null}
          {promotions.length > 0 ? (
            <PromoGrid promotions={promotions} limit={20} />
          ) : (
            <div className="notice warn">
              {isPast ? 'เดือนนี้ไม่มีโปรโมชั่นที่บันทึกไว้' : 'โปรโมชั่นประจำเดือนกำลังจะประกาศ — ดีลที่ลงหน้าเว็บไม่ได้ สอบถามได้ที่สาขาหรือแชทได้เลย'}
            </div>
          )}
          <div className="grid-2" style={{ marginTop: 14 }}>
            <Link className="btn btn-red btn-lg" href="/test-drive"><Icon name="wheel" size={20} color="#fff" />นัดทดลองขับพร้อมรับข้อเสนอ</Link>
            <Link className="btn btn-outline btn-lg" href="/price">ดูตารางผ่อนทุกรุ่น</Link>
          </div>
        </section>

        {news.length > 0 ? (
          <section className="section" style={{ paddingTop: 0 }}>
            <div className="sec-head"><div><h2>ข่าวโปรโมชั่นเดือน{pm.labelBE}</h2></div></div>
            <div className="grid-3">{news.map((n) => <NewsCard key={n.id} n={n} />)}</div>
          </section>
        ) : null}

        <section className="section" style={{ paddingTop: 0 }}>
          <div className="sec-head">
            <div>
              <h2>ราคาเริ่มต้น BYD ทุกรุ่น {pm.labelBE}</h2>
              <p>ค่างวดโดยประมาณ ดาวน์ {ft.defaultDown}% ผ่อน {ft.defaultTerm} งวด — กดที่รุ่นเพื่อดูทุก trim ตารางผ่อน และนัดทดลองขับ</p>
            </div>
          </div>
          <div className="card" style={{ overflowX: 'auto' }}>
            <table className="price-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', padding: '10px 12px' }}>รุ่น</th>
                  <th style={{ textAlign: 'right', padding: '10px 12px' }}>ราคาเริ่มต้น (บาท)</th>
                  <th style={{ textAlign: 'right', padding: '10px 12px', whiteSpace: 'nowrap' }}>ค่างวด/เดือน</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {models.filter((m) => m.priceFrom > 0).map((m) => (
                  <tr key={m.id} style={{ borderTop: '1px solid var(--line)' }}>
                    <td style={{ padding: '10px 12px' }}><Link href={`/car-model/${m.slug}`}><b>BYD {m.name}</b></Link></td>
                    <td style={{ padding: '10px 12px', textAlign: 'right' }}><b className="display">{baht(m.priceFrom)}</b></td>
                    <td style={{ padding: '10px 12px', textAlign: 'right' }}>{baht(ft.pay(m.priceFrom, ft.defaultDown, ft.defaultTerm).perMonth)}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right' }}><Link className="sec-link" href={`/car-model/${m.slug}#price`}>ตารางผ่อน <Icon name="chev" size={14} /></Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </>
  )
}
