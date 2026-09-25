import type { Metadata } from 'next'
import { getReviews, getSiteData } from '@/lib/data'
import { ReviewGrid } from '@/components/Reviews'
import ReviewForm from '@/components/ReviewForm'

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
