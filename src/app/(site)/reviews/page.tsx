import type { Metadata } from 'next'
import { getReviews, getSiteData } from '@/lib/data'
import { ReviewGrid } from '@/components/Reviews'
import ReviewForm from '@/components/ReviewForm'
import Icon from '@/components/Icons'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'รีวิวจากลูกค้า',
  description: 'รีวิวจากลูกค้าที่ออกรถและใช้บริการ BYD Hi-Class EV Car — เขียนรีวิวของคุณได้ที่หน้านี้',
  alternates: { canonical: '/reviews' },
}

/** รีวิวจากลูกค้า (zip #35) — รายการที่อนุมัติแล้ว + ฟอร์มเขียนรีวิว (เข้าหลังบ้านเป็น "รออนุมัติ") */
export default async function ReviewsPage() {
  const [{ models, branches }, reviews] = await Promise.all([getSiteData(), getReviews(60).catch(() => [])])
  return (
    <>
      <section className="page-head">
        <div className="container">
          <p className="kicker">Reviews</p>
          <h1>รีวิวจากลูกค้า</h1>
          <p className="lead">เสียงจากลูกค้าที่ออกรถและใช้บริการกับ BYD Hi-Class</p>
        </div>
      </section>
      <main className="container">
        {reviews.length > 0 ? (
          <section className="section" style={{ paddingTop: 20 }}>
            <ReviewGrid reviews={reviews} />
          </section>
        ) : null}
        {branches.some((b) => b.mapUrl) ? (
          // ลิงก์ Google Business Profile ของแต่ละสาขา — ลูกค้าเช็ครีวิวจริงบน Google ได้เอง (เพิ่มความน่าเชื่อถือ)
          <section className="section" id="google">
            <div className="sec-head">
              <div>
                <h2>รีวิวบน Google ของแต่ละสาขา</h2>
                <p>อ่านรีวิวและคะแนนจากลูกค้าจริงบน Google Maps หรือเขียนรีวิวให้สาขาที่คุณใช้บริการ</p>
              </div>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              {branches.filter((b) => b.mapUrl).map((b) => (
                <a key={b.id} className="btn btn-outline" href={b.mapUrl!} target="_blank" rel="noopener noreferrer">
                  <Icon name="nav" size={16} />สาขา{b.name}
                </a>
              ))}
            </div>
          </section>
        ) : null}
        <section className="section" id="write" style={{ scrollMarginTop: 90 }}>
          <div className="sec-head">
            <div>
              <h2>เขียนรีวิว</h2>
              <p>ใช้เวลาไม่ถึง 1 นาที</p>
            </div>
          </div>
          <div className="card" style={{ padding: 20, maxWidth: 760 }}>
            <ReviewForm models={models} branches={branches} />
          </div>
        </section>
      </main>
    </>
  )
}
