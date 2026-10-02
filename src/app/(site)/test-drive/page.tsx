import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import Icon from '@/components/Icons'
import TestDriveForm from '@/components/TestDriveForm'
import { ReviewGrid, Stars } from '@/components/Reviews'
import { getSiteData, getDeliveryPhotos, getReviews } from '@/lib/data'
import { baht } from '@/lib/format'

export const metadata: Metadata = {
  title: 'นัดทดลองขับ BYD ฟรี ทุกรุ่น',
  description: 'กรอกแค่ชื่อกับเบอร์ เซลส์สาขาที่สะดวกโทรกลับนัดวันเวลาให้ ทดลองขับฟรี ไม่มีข้อผูกมัด · รีวิวและภาพส่งมอบจากลูกค้าจริง BYD Hi-Class EV Car',
  alternates: { canonical: '/test-drive' },
}

export const dynamic = 'force-dynamic'

// ★ zip #41 หน้าทดลองขับให้มีชีวิตชีวา: แถบความน่าเชื่อถือ + ภาพส่งมอบจริง + รีวิวลูกค้า (ไม่แตะ DB/API · ไม่แตะ globals.css)
const CSS = `
.td-wrap{display:grid;grid-template-columns:minmax(0,1fr);gap:18px;align-items:start}
@media(min-width:960px){.td-wrap{grid-template-columns:minmax(0,1.05fr) minmax(0,.95fr);gap:28px}}
.td-trust{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;margin-top:16px}
@media(min-width:700px){.td-trust{grid-template-columns:repeat(4,minmax(0,1fr))}}
.td-trust div{background:rgba(255,255,255,.75);border:1px solid rgba(0,0,0,.07);border-radius:14px;padding:10px 12px;font-size:13px;line-height:1.35}
.td-trust b{display:block;font-size:18px}
.td-why{display:grid;gap:10px;margin:0;padding:0;list-style:none}
.td-why li{display:flex;gap:10px;align-items:flex-start;font-size:15px;line-height:1.45}
.td-why .dot{flex:none;width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:#e8f6f3;color:#0f766e;font-weight:700}
.td-mosaic{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;margin-top:14px}
.td-mosaic .g{position:relative;aspect-ratio:1/1;border-radius:14px;overflow:hidden;background:#eee}
.td-mosaic .g:first-child{grid-column:span 2;aspect-ratio:16/9}
.td-quote{margin-top:14px;padding:14px 16px;border-radius:14px;background:#fff7e6;border:1px solid #f6d58b}
.td-quote blockquote{margin:6px 0;font-size:15px;line-height:1.5}
.td-quote figcaption{font-size:13px;opacity:.75}
.td-cta{display:flex;flex-wrap:wrap;gap:10px;justify-content:center;margin-top:8px}
.td-line{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:14px;padding:10px 12px;border-radius:14px;background:#ecfdf3;border:1px solid #b7ebc9;font-size:14px;line-height:1.35}
.td-line .btn{min-height:44px;white-space:nowrap}
/* ★ มือถือ: หัวสั้น · ชิปเลื่อนแนวนอน · รีวิว/รูปเป็นสไลด์ปัด ไม่ให้หน้ายาว · ปุ่มสูง ≥44px */
@media(max-width:959px){
 .td-head.page-head{padding:14px 0 12px}
 .td-head h1{font-size:24px}
 .td-head .lead{font-size:13px}
 .td-trust{display:flex;overflow-x:auto;scroll-snap-type:x mandatory;scroll-padding-inline:20px;-webkit-overflow-scrolling:touch;margin:12px -20px 0;padding:0 20px 4px;scrollbar-width:none}
 .td-trust::-webkit-scrollbar,.td-swipe .rv-grid::-webkit-scrollbar,.td-swipe .gallery::-webkit-scrollbar,.td-mosaic::-webkit-scrollbar{display:none}
 .td-trust div{flex:0 0 auto;scroll-snap-align:start;padding:8px 12px}
 .td-trust b{font-size:16px}
 .td-form.card{padding:16px!important;margin:0 -4px}
 .td-mosaic{display:flex;overflow-x:auto;scroll-snap-type:x mandatory;gap:8px;margin:12px -20px 0;padding:0 20px;scrollbar-width:none}
 .td-mosaic .g,.td-mosaic .g:first-child{flex:0 0 72%;aspect-ratio:4/3;scroll-snap-align:center;grid-column:auto}
 .td-swipe .rv-grid{display:flex;overflow-x:auto;scroll-snap-type:x mandatory;gap:10px;margin:0 -20px;padding:0 20px 6px;scrollbar-width:none}
 .td-swipe .rv-grid>*{flex:0 0 84%;scroll-snap-align:center}
 .td-swipe .gallery{display:flex;overflow-x:auto;scroll-snap-type:x mandatory;gap:8px;margin:0 -20px;padding:0 20px;scrollbar-width:none}
 .td-swipe .gallery .g{flex:0 0 62%;scroll-snap-align:center}
 .td-hint{display:block;font-size:12px;opacity:.6;margin-top:6px}
 .td-cta .btn{flex:1 1 100%;min-height:48px}
}
@media(min-width:960px){.td-hint{display:none}}
`

export default async function TestDrivePage({
  searchParams,
}: {
  searchParams: Promise<{ model?: string; branch?: string; down?: string; term?: string; monthly?: string }>
}) {
  const sp = await searchParams
  const [{ models, branches, settings }, photos, reviews] = await Promise.all([
    getSiteData(),
    getDeliveryPhotos(13).catch(() => []),
    getReviews(40).catch(() => []),
  ])
  const offerNote =
    sp.monthly && sp.term
      ? `จากเครื่องคำนวณ: ดาวน์ ${sp.down}% · ${sp.term} งวด · ประมาณ ${baht(Number(sp.monthly))} บาท/เดือน`
      : ''
  // รูปส่งมอบ: 5 รูปแรกไว้ข้างฟอร์ม ที่เหลือเป็นแกลเลอรีด้านล่าง · รีวิว: อันแรกเป็นคำพูดเด่น ที่เหลือเป็นการ์ด
  const sidePhotos = photos.slice(0, 5)
  const morePhotos = photos.slice(5, 13)
  // หน้านี้คนกำลังตัดสินใจซื้อ → เอารีวิวฝั่งขาย (ซื้อ/รับรถ/เซลส์/ทดลองขับ) ขึ้นก่อนรีวิวงานบริการ
  const SALES_RE = /ซื้อ|รับรถ|ออกรถ|เซลล์|เซลส์|ทดลองขับ|ดูรถ|จองรถ/
  const picked = [...reviews.filter((r) => SALES_RE.test(r.message || '')), ...reviews.filter((r) => !SALES_RE.test(r.message || ''))].slice(0, 7)
  const [topReview, ...restReviews] = picked
  const alt = 'ลูกค้ารับมอบรถ BYD ที่โชว์รูม BYD Hi-Class EV Car'

  return (
    <>
      <style>{CSS}</style>
      <section className="page-head td-head">
        <div className="container">
          <p className="kicker"><Icon name="wheel" size={14} />ทดลองขับฟรี ทุกรุ่น</p>
          <h1>นัดทดลองขับฟรี กรอกแค่ชื่อกับเบอร์</h1>
          <p className="lead">เซลส์โทรกลับนัดให้ภายใน 1 ชั่วโมง (เวลาทำการ) ฟรี ไม่มีข้อผูกมัด</p>
          <div className="td-trust">
            {settings.deliveredCount ? (
              <div><b>{settings.deliveredCount.toLocaleString('th-TH')}+ คัน</b>ส่งมอบให้ลูกค้าแล้ว</div>
            ) : (
              <div><b>ส่งมอบทุกวัน</b>ลูกค้าจริงทุกสาขา</div>
            )}
            <div><b>{branches.length || 5} สาขา</b>กรุงเทพฯ และปริมณฑล</div>
            <div><b>★ 5.0</b>{picked.length ? 'รีวิวจากลูกค้าที่ออกรถแล้ว' : 'บริการจากทีมขายมืออาชีพ'}</div>
            <div><b>ฟรี 100%</b>ไม่ซื้อก็ไม่เป็นไร</div>
          </div>
        </div>
      </section>

      <main className="container">
        <section className="section" style={{ paddingTop: 20 }}>
          <div className="td-wrap">
            <div className="card td-form" id="td-top" style={{ padding: 20, scrollMarginTop: 90 }}>
              {settings.lineUrl ? (
                <div className="td-line">
                  <span>ไม่สะดวกกรอก? <b>ทัก LINE คุยกับเซลส์ได้เลย</b></span>
                  <a className="btn btn-green" href={settings.lineUrl} target="_blank" rel="noopener noreferrer">
                    <Icon name="chat" size={18} color="#fff" />แอด LINE
                  </a>
                </div>
              ) : null}
              <TestDriveForm models={models} branches={branches} settings={settings} defaultModel={sp.model} defaultBranch={sp.branch} offerNote={offerNote} />
            </div>

            <aside>
              <div className="card" style={{ padding: 20 }}>
                <h2 style={{ fontSize: 20, margin: '0 0 12px' }}>มาทดลองขับแล้วได้อะไร</h2>
                <ul className="td-why">
                  <li><span className="dot">1</span><span>ลองขับจริงบนถนนจริง รู้สึกอัตราเร่ง ความเงียบ และช่วงล่างด้วยตัวเอง</span></li>
                  <li><span className="dot">2</span><span>เซลส์คำนวณดาวน์ ค่างวด และราคารถเทิร์นให้ตรงกับงบของคุณ</span></li>
                  <li><span className="dot">3</span><span>รับข้อเสนอและสิทธิพิเศษล่าสุดของสาขา ที่อาจไม่ได้ประกาศทางออนไลน์</span></li>
                </ul>
                {topReview ? (
                  <figure className="td-quote">
                    <Stars />
                    <blockquote>“{topReview.message}”</blockquote>
                    <figcaption>
                      <b>{topReview.name}</b>
                      {topReview.model ? ` · BYD ${topReview.model}` : ''}
                      {topReview.branch ? ` · สาขา${topReview.branch}` : ''}
                    </figcaption>
                  </figure>
                ) : null}
              </div>
              {sidePhotos.length > 0 ? (
                <div className="td-mosaic" aria-label="ภาพลูกค้ารับมอบรถ">
                  {sidePhotos.map((p, i) => (
                    <div className="g" key={p.id}>
                      <Image src={p.url as string} alt={p.alt || alt} fill sizes={i === 0 ? '(max-width: 960px) 100vw, 520px' : '(max-width: 960px) 50vw, 260px'} style={{ objectFit: 'cover' }} priority={i === 0} />
                    </div>
                  ))}
                </div>
              ) : null}
            </aside>
          </div>
        </section>

        {restReviews.length > 0 ? (
          <section className="section td-swipe" id="reviews">
            <div className="sec-head">
              <div>
                <h2>เสียงจากลูกค้าที่ออกรถแล้ว</h2>
                <p>ประสบการณ์จริงหลังทดลองขับและรับรถกับ BYD Hi-Class</p>
              </div>
              <Link className="sec-link" href="/reviews">อ่านรีวิวทั้งหมด <Icon name="chev" size={16} /></Link>
            </div>
            <ReviewGrid reviews={restReviews} />
            <span className="td-hint">ปัดซ้าย-ขวาเพื่ออ่านต่อ →</span>
          </section>
        ) : null}

        {morePhotos.length > 0 ? (
          <section className="section td-swipe" id="delivery">
            <div className="sec-head">
              <div>
                <h2>วันรับรถของลูกค้าเรา</h2>
                <p>บรรยากาศส่งมอบจริงจากทุกสาขา ครั้งหน้าอาจเป็นคุณ</p>
              </div>
              <Link className="sec-link" href="/delivery">ดูทั้งหมด <Icon name="chev" size={16} /></Link>
            </div>
            <div className="gallery gallery-sq">
              {morePhotos.map((p) => (
                <div className="g" key={p.id}>
                  <Image src={p.url as string} alt={p.alt || alt} fill sizes="(max-width: 900px) 50vw, 300px" style={{ objectFit: 'cover' }} />
                </div>
              ))}
            </div>
          </section>
        ) : null}

        <section className="section" style={{ textAlign: 'center' }}>
          <h2 style={{ margin: '0 0 6px' }}>พร้อมลองขับแล้วหรือยัง</h2>
          <p style={{ margin: '0 0 12px', opacity: 0.75 }}>กรอกชื่อกับเบอร์ เซลส์โทรกลับนัดให้เลย</p>
          <div className="td-cta">
            <a className="btn btn-red" href="#td-top">นัดทดลองขับฟรี</a>
            <Link className="btn btn-outline" href="/branches">ดูสาขาใกล้คุณ</Link>
          </div>
        </section>
      </main>
    </>
  )
}
