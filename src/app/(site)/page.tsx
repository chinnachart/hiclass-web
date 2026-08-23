import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import ModelGrid from '@/components/ModelGrid'
import PaymentCalculator from '@/components/PaymentCalculator'
import { getSiteData } from '@/lib/data'
import { telHref } from '@/lib/format'

export const dynamic = 'force-dynamic'

const SERVICES = [
  { no: '01', title: 'จองคิวศูนย์บริการ', body: 'เลือกสาขา วันเวลา และเรื่องที่จะเข้า จองออนไลน์ได้เอง ไม่ต้องโทรรอสาย', href: '/service', cta: 'จองคิวเลย' },
  { no: '02', title: 'บริการรถให้เช่า', body: 'รถเช่าระหว่างซ่อม และเช่าระยะสั้น–ยาว สำหรับลูกค้าบุคคลและองค์กร', href: '/rental', cta: 'ดูรายละเอียด' },
  { no: '03', title: 'เทิร์นรถเก่า', body: 'ประเมินราคาให้ก่อนเข้าโชว์รูม ใช้เป็นเงินดาวน์คันใหม่ได้ทันที', href: '/trade-in', cta: 'ขอประเมินราคา' },
  { no: '04', title: 'ประกันและต่อทะเบียน', body: 'ดูแลเรื่องเอกสารให้ครบ ตั้งแต่จดทะเบียนคันใหม่ไปจนถึงต่ออายุประกัน', href: '/contact', cta: 'สอบถามเพิ่มเติม' },
]

const CATEGORY_LABEL: Record<string, string> = {
  news: 'ข่าวสาร', event: 'กิจกรรม', guide: 'ความรู้', service: 'บริการ',
}

export default async function HomePage() {
  const { models, branches, promotions, news, settings } = await getSiteData()
  const featured = promotions.find((p) => p.featured)
  const rest = promotions.filter((p) => !p.featured).slice(0, 2)
  const ordered = [featured, ...rest].filter(Boolean) as typeof promotions

  return (
    <>
      <Header models={models} branches={branches} phone={settings.mainPhone} />

      <div className="hero" id="top">
        <div className="hero-light" />
        <div className="hero-in">
          <div className="hero-grid">
            <div>
              <p className="kicker">ผู้จำหน่าย BYD · {branches.length} สาขาในกรุงเทพฯ</p>
              <h1>
                {settings.heroHeadline}
                {settings.heroHeadline2 ? <><br />{settings.heroHeadline2}</> : null}
                {settings.heroSub ? <span className="sub">{settings.heroSub}</span> : null}
              </h1>
              {settings.heroBlurb ? <p className="blurb">{settings.heroBlurb}</p> : null}
              <div className="hero-cta">
                <Link className="btn" href="/test-drive">นัดทดลองขับฟรี</Link>
                <Link className="btn ghost" href="/car-model">ดูรถทุกรุ่น</Link>
              </div>
              <div className="stats">
                <div className="stat"><b>{branches.length}</b><span>สาขาในกรุงเทพฯ<br />และปริมณฑล</span></div>
                <div className="stat"><b>{models.length}</b><span>รุ่นให้เลือก<br />ทั้ง EV และ DM-i</span></div>
                <div className="stat"><b>ฟรี</b><span>ทดลองขับทุกรุ่น<br />ไม่มีข้อผูกมัด</span></div>
              </div>
            </div>

            <div id="calc">
              <PaymentCalculator models={models} settings={settings} />
            </div>
          </div>
        </div>
      </div>

      <main>
        <section id="models" className="shell">
          <div className="sec-head">
            <div>
              <h2>Car Model</h2>
              <p>เลือกดูตามประเภทตัวถัง หรือกดเข้าไปดูสเปกเต็มของแต่ละรุ่น</p>
            </div>
            <Link className="sec-link" href="/car-model">เทียบสเปกทุกรุ่น →</Link>
          </div>
          <ModelGrid models={models} />
        </section>

        {ordered.length > 0 ? (
          <section id="promo" className="shell">
            <div className="sec-head">
              <div>
                <h2>Promotion</h2>
                <p>โปรโมชันที่กำลังใช้ได้ในตอนนี้</p>
              </div>
              <Link className="sec-link" href="/promotion">โปรโมชันทั้งหมด →</Link>
            </div>
            <div className="promos">
              {ordered.map((p) => (
                <div className={`promo${p.featured ? ' lead' : ''}`} key={p.id}>
                  {p.badge ? <span className="tagline">{p.badge}</span> : null}
                  <h3>{p.title}</h3>
                  <p>{p.summary}</p>
                  <span className="until">
                    {p.endDate
                      ? `ถึง ${new Date(p.endDate).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })}`
                      : 'ไม่มีกำหนดสิ้นสุด'}
                  </span>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        <section id="branches" className="shell">
          <div className="sec-head">
            <div>
              <h2>สาขาของเรา</h2>
              <p>โทรหาสาขาที่สะดวกได้โดยตรง ไม่ต้องผ่านคอลเซ็นเตอร์แล้วรอโอนสาย</p>
            </div>
            <Link className="sec-link" href="/branches">ดูแผนที่ทุกสาขา →</Link>
          </div>
          <div className="branches">
            {branches.map((b) => (
              <div className="br" key={b.id}>
                <h3>{b.name}</h3>
                <p className="area">{b.nameEn}</p>
                <a className="ph-num" href={telHref(b.phone)}>{b.phone}</a>
                <span className="open">{b.openHours}</span>
                <div className="acts">
                  {b.mapUrl ? <a href={b.mapUrl} target="_blank" rel="noopener noreferrer">เส้นทาง</a> : null}
                  <Link href="/test-drive">นัดลองขับ</Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section id="service" className="shell">
          <div className="sec-head">
            <div>
              <h2>Service &amp; บริการรถให้เช่า</h2>
              <p>บริการหลังการขายที่ทำให้ลูกค้ากลับมาซื้อคันที่สอง</p>
            </div>
          </div>
          <div className="svc">
            {SERVICES.map((s) => (
              <div className="svc-card" key={s.no}>
                <span className="no">{s.no}</span>
                <h3>{s.title}</h3>
                <p>{s.body}</p>
                <Link href={s.href}>{s.cta} →</Link>
              </div>
            ))}
          </div>
        </section>

        {news.length > 0 ? (
          <section id="news" className="shell">
            <div className="sec-head">
              <div>
                <h2>ข่าวสารและกิจกรรม</h2>
                <p>อัปเดตจากทีมการตลาดโดยตรง</p>
              </div>
              <Link className="sec-link" href="/news">ข่าวทั้งหมด →</Link>
            </div>
            <div className="promos">
              {news.map((n) => (
                <Link className="promo" href={`/news/${n.slug}`} key={n.id} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <span className="tagline">{CATEGORY_LABEL[n.category || 'news']}</span>
                  <h3>{n.title}</h3>
                  <p>{n.excerpt}</p>
                  <span className="until">
                    {new Date(n.publishedAt).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </Link>
              ))}
            </div>
          </section>
        ) : null}
      </main>

      <Footer models={models} branches={branches} settings={settings} />
    </>
  )
}
