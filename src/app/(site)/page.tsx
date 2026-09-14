import Image from 'next/image'
import Link from 'next/link'
import Icon from '@/components/Icons'
import ModelGrid from '@/components/ModelGrid'
import PaymentCalculator from '@/components/PaymentCalculator'
import { BranchRow, PromoGrid, thDate } from '@/components/Cards'
import Jsonld, { dealerLd, organizationLd, webSiteLd } from '@/components/Jsonld'
import { AwardsStrip } from '@/components/Awards'
import HomePopup from '@/components/HomePopup'
import HeroSlider from '@/components/HeroSlider'
import ShowroomSlider from '@/components/ShowroomSlider'
import { mediaOf } from '@/components/CarImage'
import { heroSlidesFrom } from '@/lib/heroSlides'
import { getSiteData, getDeliveryPhotos } from '@/lib/data'

export const dynamic = 'force-dynamic'

// หน้าแรกไม่มี canonical → /?utm=… /?fbclid=… ถูกนับเป็นคนละหน้า
export const metadata = { alternates: { canonical: '/' } }

const CATEGORY_LABEL: Record<string, string> = { news: 'ข่าวสาร', event: 'กิจกรรม', guide: 'ความรู้', service: 'บริการ' }

export default async function HomePage() {
  const { models, branches, promotions, news, settings } = await getSiteData()
  const deliveryPhotos = await getDeliveryPhotos(8)
  // สไลด์ hero: เอาจากหลังบ้านก่อน ถ้ายังไม่มีใช้ค่าตั้งต้นในโค้ด (zip #32)
  const heroSlides = heroSlidesFrom(settings.heroSlides)
  // สไลด์โชว์รูม: รูปแรกของแต่ละสาขาที่อัปรูปไว้แล้ว — สาขาไหนยังไม่มีรูปก็แค่ไม่อยู่ในสไลด์ (zip #29)
  const showroomSlides = branches
    .map((b) => ({ b, pic: mediaOf((b.photos || [])[0]) }))
    .filter((x) => x.pic?.url)
    .map(({ b, pic }) => ({
      url: pic!.url as string,
      alt: pic!.alt || `โชว์รูม BYD Hi-Class ${b.name}`,
      caption: `BYD Hi-Class ${b.name}`,
      href: `/branches/${b.code}`,
    }))

  // ป๊อปอัพแคมเปญ — เด้งเฉพาะเมื่อเปิดสวิตช์ + มีรูป + อยู่ในช่วงวันที่ตั้งไว้ (แก้ทั้งหมดที่หลังบ้าน แท็บ "ป๊อปอัพหน้าแรก")
  const popImg = settings.popupEnabled ? mediaOf(settings.popupImage) : null
  const nowMs = Date.now()
  const popOn =
    !!popImg?.url &&
    (!settings.popupStart || new Date(settings.popupStart).getTime() <= nowMs) &&
    // สิ้นสุด = หมดวันนั้น (บวก 1 วัน) ตั้ง 13 ก.ย. แล้วยังเด้งทั้งวันที่ 13
    (!settings.popupEnd || new Date(settings.popupEnd).getTime() + 86400000 > nowMs)

  return (
    <>
      {popOn && popImg?.url ? (
        <HomePopup
          src={popImg.url}
          href={settings.popupHref || '/test-drive'}
          alt={settings.popupAlt || popImg.alt || 'โปรโมชั่น BYD Hi-Class EV Car'}
          width={popImg.width}
          height={popImg.height}
          imageId={popImg.id}
        />
      ) : null}
      <Jsonld data={dealerLd(branches, models.map((m) => m.priceFrom))} />
      <Jsonld data={organizationLd({ phone: settings.mainPhone, email: settings.contactEmail, sameAs: [settings.facebookUrl, settings.lineUrl, ...branches.flatMap((b) => [b.facebookUrl, b.instagramUrl, b.tiktokUrl, b.youtubeUrl])] })} />
      <Jsonld data={webSiteLd()} />

      {/* ---------- Hero: วิดีโอพื้นหลัง + สไลด์ข้อเสนอ 4 ใบ (zip #31) ---------- */}
      <HeroSlider slides={heroSlides} lineUrl={settings.lineUrl} branchCount={branches.length} />

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

        {/* ---------- สไลด์โชว์รูม (zip #29) ---------- */}
        {showroomSlides.length > 0 ? (
          <section className="section" id="showrooms">
            <div className="sec-head">
              <div>
                <h2>โชว์รูมของเรา</h2>
                <p>ภาพถ่ายจริงจากทุกสาขา กดที่รูปเพื่อดูรายละเอียดสาขานั้น</p>
              </div>
              <Link className="sec-link" href="/branches">ทุกสาขา <Icon name="chev" size={16} /></Link>
            </div>
            <ShowroomSlider slides={showroomSlides} ratio="16x9" />
          </section>
        ) : null}

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
