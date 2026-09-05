import type { Metadata } from 'next'
import Link from 'next/link'
import { getPayload } from 'payload'
import config from '@payload-config'
import { thDate } from '@/components/Cards'
import type { NewsItem } from '@/lib/types'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'ข่าวสารและกิจกรรม',
  description: 'ข่าวสาร กิจกรรม และความรู้เรื่องรถยนต์ไฟฟ้า BYD จาก Hi-Class EV Car',
  alternates: { canonical: '/news' },
}

const CATEGORY_LABEL: Record<string, string> = { news: 'ข่าวสาร', event: 'กิจกรรม', guide: 'ความรู้', service: 'บริการ' }

export default async function NewsIndex() {
  const payload = await getPayload({ config })
  const res = await payload.find({ collection: 'news', sort: '-publishedAt', limit: 30, depth: 0 })
  const news = res.docs as unknown as NewsItem[]
  return (
    <>
      <section className="page-head">
        <div className="container">
          <p className="kicker">ข่าวสารและกิจกรรม</p>
          <h1>ข่าวสารและกิจกรรม</h1>
          <p className="lead">อัปเดตจากทีมการตลาดโดยตรง</p>
        </div>
      </section>
      <main className="container">
        <section className="section" style={{ paddingTop: 20 }}>
          {news.length === 0 ? (
            <div className="notice warn">ยังไม่มีข่าว — เพิ่มได้จากหลังบ้าน → ข่าวสารและกิจกรรม</div>
          ) : (
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
          )}
        </section>
      </main>
    </>
  )
}
