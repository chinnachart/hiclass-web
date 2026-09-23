import type { Metadata } from 'next'
import { NewsCard } from '@/components/Cards'
import { getNewsList } from '@/lib/data'
import type { NewsItem } from '@/lib/types'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'ข่าวสารและกิจกรรม',
  description: 'ข่าวสาร กิจกรรม และความรู้เรื่องรถยนต์ไฟฟ้า BYD จาก Hi-Class EV Car',
  alternates: { canonical: '/news' },
}

export default async function NewsIndex() {
  const news = (await getNewsList(30)) as unknown as NewsItem[]
  return (
    <>
      <section className="page-head">
        <div className="container">
          <p className="kicker">ข่าวสารและกิจกรรม</p>
          <h1>ข่าวสารและกิจกรรม</h1>
          <p className="lead">ข่าว กิจกรรม และความรู้เรื่องรถยนต์ไฟฟ้า BYD จาก Hi-Class EV Car</p>
        </div>
      </section>
      <main className="container">
        <section className="section" style={{ paddingTop: 20 }}>
          {news.length === 0 ? (
            <div className="notice warn">ยังไม่มีข่าว — เพิ่มได้จากหลังบ้าน → ข่าวสารและกิจกรรม</div>
          ) : (
            <div className="grid-3">
              {news.map((n) => <NewsCard key={n.id} n={n} />)}
            </div>
          )}
        </section>
      </main>
    </>
  )
}
