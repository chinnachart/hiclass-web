import Image from 'next/image'
import Link from 'next/link'
import Icon from '@/components/Icons'
import CarImage from '@/components/CarImage'
import ModelGrid from '@/components/ModelGrid'
import PaymentCalculator from '@/components/PaymentCalculator'
import { BranchRow, PromoGrid, thDate } from '@/components/Cards'
import Jsonld, { dealerLd, organizationLd, webSiteLd } from '@/components/Jsonld'
import { AwardsStrip } from '@/components/Awards'
import { getSiteData, getDeliveryPhotos } from '@/lib/data'

export const dynamic = 'force-dynamic'

// หน้าแรกไม่มี canonical → /?utm=… /?fbclid=… ถูกนับเป็นคนละหน้า
export const metadata = { alternates: { canonical: '/' } }

const CATEGORY_LABEL: Record<string, string> = { news: 'ข่าวสาร', event: 'กิจกรรม', guide: 'ความรู้', service: 'บริการ' }

export default async function HomePage() {
  const { models, branches, promotions, news, settings } = await getSiteData()
  const deliveryPhotos = await getDeliveryPhotos(8)
  const heroModel = models[0]

  return (
    <>
      <Jsonld data={dealerLd(branches, models.map((m) => m.priceFrom))} />
      <Jsonld data={organizationLd({ phone: settings.mainPhone, email: settings.contactEmail, sameAs: [settings.facebookUrl, settings.lineUrl, ...branches.flatMap((b) => [b.facebookUrl, b.instagramUrl, b.tiktokUrl, b.youtubeUrl])] })} />
      <Jsonld data={webSiteLd()} />

      {/* ---------- Hero ---------- */}
      <section className="hero">
        <div className="container hero-in">
          <div className="hero-copy">
            <p className="kicker">
              <Icon name="check" size={14} sw={3} />
              ผู้จำหน่าย BYD อย่างเป็นทางการ · {branches.length} สาขา กรุงเทพฯ
            </p>
            <h1>
              {settings.heroHeadline}
              {settings.heroHeadline2 ? <><br />{settings.heroHeadline2}</> : null}
            </h1>
            {settings.heroSub ? <p className="lead">{settings.heroSub}</p> : null}
            <div className="hero-cta">
              <Link className="btn btn-red btn-lg" href="/test-drive">
                <Icon name="wheel" size={20} color="#fff" />นัดทดลองขับฟรี
              </Link>
              {settings.lineUrl ? (
                <a className="btn btn-green btn-lg" href={settings.lineUrl} target="_blank" rel="noopener noreferrer">
                  <Icon name="chat" size={20} color="#fff" />แอด LINE
                </a>
              ) : null}
              <Link className="btn btn-outline btn-lg" href="/branches">
                <Icon name="pin" size={20} />เลือกสาขา
              </Link>
            </div>
          </div>
          <div className="hero-visual" style={{ position: 'relative' }}>
            {heroModel ? (
              <CarImage media={heroModel.heroImage} alt={`BYD ${heroModel.name}`} sizes="(max-width: 900px) 100vw, 640px" fallbackWidth={340} priority />
            ) : null}
          </div>
          <div className="quick">
            <Link className="q-red" href="/test-drive">
              <Icon name="wheel" size={26} color="#fff" />นัดทดลองขับ<small>ฟรี ทุกรุ่น</small>
            </Link>
            {settings.lineUrl ? (
              <a className="q-green" href={settings.lineUrl} target="_blank" rel="noopener noreferrer">
                <Icon name="chat" size={26} color="#fff" />แอด LINE<small>ตอบไว ทุกวัน</small>
              </a>
            ) : (
              <Link className="q-green" href="/contact">
                <Icon name="chat" size={26} color="#fff" />ติดต่อเรา<small>ตอบไว ทุกวัน</small>
              </Link>
            )}
            <Link className="q-out" href="/branches">
              <Icon name="pin" size={26} />เลือกสาขา<small>{branches.length} สาขา กทม.</small>
            </Link>
          </div>
        </div>
      </section>

      <main className="container">
        {/* ---------- รางวัล ---------- */}
        <AwardsStrip />

        {/* ---------- โปรโมชั่น ---------- */}
        {promotions.length > 0 ? (
          <section className="section" id="promotion">
            <div className="sec-head">
              <div>
                <h2>โปรโมชั่นเดือนนี้</h2>
                <p>ข้อเสนอที่ใช้ได้ตอนนี้ทุกสาขา</p>
              </div>
              <Link className="sec-link" href="/promotion">ดูทั้งหมด <Icon name="chev" size={16} /></Link>
            </div>
            <PromoGrid promotions={promotions} limit={3} />
          </section>
        ) : null}

        {/* ---------- ภาพส่งมอบ (zip #27) ---------- */}
        {deliveryPhotos.length > 0 ? (
          <section className="section" id="delivery">
            <div className="sec-head">
              <div>
                <h2>ลูกค้าที่รับรถไปแล้ว</h2>
                <p>บรรยากาศวันส่งมอบจริงจากทุกสาขา</p>
              </div>
              <Link className="sec-link" href="/delivery">ดูทั้งหมด <Icon name="chev" size={16} /></Link>
            </div>
            <div className="gallery gallery-sq">
              {deliveryPhotos.map((p) => (
                <div className="g" key={p.id}>
                  <Image
                    src={p.url as string}
                    alt={p.alt || 'ลูกค้ารับมอบรถ BYD ที่โชว์รูม BYD Hi-Class EV Car'}
                    fill
                    sizes="(max-width: 900px) 50vw, 300px"
                    style={{ objectFit: 'cover' }}
                  />
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {/* ---------- รุ่นรถ ---------- */}
        <section className="section" id="models">
          <div className="sec-head">
            <div>
              <h2>เลือกรุ่นที่ใช่</h2>
              <p>{models.length} รุ่น ทั้ง EV และ DM-i · ราคาเริ่มต้นและค่างวดอัปเดตล่าสุด</p>
            </div>
            <Link className="sec-link" href="/car-model">ทุกรุ่น <Icon name="chev" size={16} /></Link>
          </div>
          <ModelGrid models={models} limit={8} />
        </section>

        {/* ---------- คำนวณค่างวด ---------- */}
        <section className="section" id="calc">
          <div className="sec-head">
            <div>
              <h2>คำนวณค่างวด</h2>
              <p>เลือกรุ่น ปรับดาวน์และจำนวนงวด ดูค่างวดทันที</p>
            </div>
            <Link className="sec-link" href="/price">ตารางทุกรุ่น <Icon name="chev" size={16} /></Link>
          </div>
          <div className="grid-2" style={{ alignItems: 'start' }}>
            <PaymentCalculator models={models} settings={settings} compact />
            <div className="stats" style={{ gridTemplateColumns: '1fr', gap: 10 }}>
              {settings.deliveredCount ? (
                <div className="card stat"><b>{settings.deliveredCount.toLocaleString('th-TH')}+ คัน</b><span>ส่งมอบให้ลูกค้าแล้ว{settings.yearsOpen ? ` ตลอด ${settings.yearsOpen} ปีที่เปิดให้บริการ` : ''}</span></div>
              ) : null}
              {settings.googleRating ? (
                <div className="card stat"><b>{settings.googleRating.toFixed(1)} ★</b><span>คะแนนรีวิวจากลูกค้าบน Google{settings.trustNote ? ` · ${settings.trustNote}` : ''}</span></div>
              ) : null}
              <div className="card stat"><b>{branches.length} สาขา</b><span>ในกรุงเทพฯ และปริมณฑล เลือกสาขาที่ใกล้บ้านได้เอง</span></div>
              <div className="card stat"><b>1 ชั่วโมง</b><span>ทีมขายโทรยืนยันนัดทดลองขับกลับภายใน 1 ชั่วโมง (เวลาทำการ)</span></div>
              {!settings.deliveredCount ? <div className="card stat"><b>ฟรี</b><span>ทดลองขับทุกรุ่น ไม่มีค่าใช้จ่าย ไม่มีข้อผูกมัด</span></div> : null}
            </div>
          </div>
        </section>

        {/* ---------- สาขา ---------- */}
        <section className="section" id="branches">
          <div className="sec-head">
            <div>
              <h2>สาขาใกล้คุณ</h2>
              <p>โทรหาสาขาโดยตรง ไม่ต้องผ่านคอลเซ็นเตอร์</p>
            </div>
            <Link className="sec-link" href="/branches">ทุกสาขา <Icon name="chev" size={16} /></Link>
          </div>
          <div className="branches">
            {branches.map((b) => <BranchRow key={b.id} b={b} />)}
          </div>
        </section>

        {/* ---------- บริการ ---------- */}
        <section className="section" id="service">
          <div className="sec-head">
            <div>
              <h2>บริการหลังการขาย</h2>
              <p>ดูแลต่อเนื่องหลังส่งมอบ</p>
            </div>
          </div>
          <div className="grid-2">
            <div className="card svc">
              <span className="branch-ico"><Icon name="wrench" size={20} /></span>
              <h3>ศูนย์บริการ</h3>
              <p>เช็กระยะ ตรวจแบตเตอรี่ อะไหล่แท้ ช่างที่ผ่านการอบรมจาก BYD ทุกสาขา</p>
              <Link className="more" href="/service">จองคิว <Icon name="chev" size={14} /></Link>
            </div>
            <div className="card svc">
              <span className="branch-ico"><Icon name="shield" size={20} /></span>
              <h3>อู่สีและซ่อมตัวถัง</h3>
              <p>ศูนย์ซ่อมสีและตัวถังมาตรฐาน BYD อะไหล่แท้ ประสานงานเคลมประกันให้</p>
              <Link className="more" href="/service#body-paint">ดูรายละเอียด <Icon name="chev" size={14} /></Link>
            </div>
            <div className="card svc">
              <span className="branch-ico"><Icon name="key" size={20} /></span>
              <h3>บริการรถให้เช่า</h3>
              <p>รถเช่าระหว่างซ่อม และเช่าระยะสั้น–ยาว สำหรับลูกค้าบุคคลและองค์กร</p>
              <Link className="more" href="/rental">ดูรายละเอียด <Icon name="chev" size={14} /></Link>
            </div>
            <div className="card svc">
              <span className="branch-ico"><Icon name="swap" size={20} /></span>
              <h3>เทิร์นรถเก่า</h3>
              <p>ประเมินราคาให้ก่อนเข้าโชว์รูม ใช้เป็นเงินดาวน์คันใหม่ได้ทันที</p>
              <Link className="more" href="/trade-in">ขอประเมินราคา <Icon name="chev" size={14} /></Link>
            </div>
          </div>
        </section>

        {/* ---------- ข่าว ---------- */}
        {news.length > 0 ? (
          <section className="section" id="news">
            <div className="sec-head">
              <div>
                <h2>ข่าวสารและกิจกรรม</h2>
              </div>
              <Link className="sec-link" href="/news">ทั้งหมด <Icon name="chev" size={16} /></Link>
            </div>
            <div className="grid-3">
              {news.map((n) => (
                <Link className="card promo" href={`/news/${n.slug}`} key={n.id}>
                  <span className="badge">{CATEGORY_LABEL[n.category || 'news']}</span>
                  <h3>{n.title}</h3>
                  <p>{n.excerpt}</p>
                  <span className="until">{thDate(n.publishedAt)}</span>
                </Link>
              ))}
            </div>
          </section>
        ) : null}
      </main>
    </>
  )
}
