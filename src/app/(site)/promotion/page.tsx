import type { Metadata } from 'next'
import Link from 'next/link'
import Icon from '@/components/Icons'
import { PromoGrid } from '@/components/Cards'
import { getSiteData } from '@/lib/data'
import { listMonths, parseMonth } from '@/lib/promoMonth'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'โปรโมชั่น BYD เดือนนี้',
  description: 'โปรโมชั่นรถยนต์ไฟฟ้า BYD ล่าสุดจาก Hi-Class EV Car ทั้ง 5 สาขาในกรุงเทพฯ ดอกเบี้ยพิเศษ ของแถม และข้อเสนอเทิร์นรถเก่า',
  alternates: { canonical: '/promotion' },
}

export default async function PromotionPage() {
  const { promotions } = await getSiteData()
  return (
    <>
      <section className="page-head">
        <div className="container">
          <p className="kicker">Promotion</p>
          <h1>โปรโมชั่นเดือนนี้</h1>
          <p className="lead">ข้อเสนอที่ใช้ได้ตอนนี้ทุกสาขา อัปเดตทุกครั้งที่มีแคมเปญใหม่</p>
        </div>
      </section>
      <main className="container">
        <section className="section" style={{ paddingTop: 20 }}>
          {promotions.length > 0 ? (
            <PromoGrid promotions={promotions} limit={20} />
          ) : (
            <div className="notice warn">ยังไม่มีโปรโมชั่นที่แสดงอยู่ในขณะนี้ — สอบถามข้อเสนอล่าสุดได้ที่สาขา</div>
          )}
          <div className="grid-2" style={{ marginTop: 14 }}>
            <Link className="btn btn-red btn-lg" href="/test-drive"><Icon name="wheel" size={20} color="#fff" />นัดทดลองขับพร้อมรับข้อเสนอ</Link>
            <Link className="btn btn-outline btn-lg" href="/price">ดูตารางผ่อนทุกรุ่น</Link>
          </div>
          {/* zip #40 — ลิงก์ไปหน้าโปรรายเดือน (ลงวันที่) ให้ Google เจอ */}
          <p className="small mute" style={{ marginTop: 18, display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
            <span>โปรโมชั่นรายเดือน:</span>
            {listMonths().map((k) => (
              <Link key={k} href={`/promotion/${k}`} className="sec-link">{parseMonth(k)?.labelBE}</Link>
            ))}
          </p>
        </section>
      </main>
    </>
  )
}
