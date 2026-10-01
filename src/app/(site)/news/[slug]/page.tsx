import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getNewsBySlug, getNewsList, getSiteData } from '@/lib/data'
import { isPromoExpired, relatedNews, modelsInNews } from '@/lib/newsLinks'
import { NewsCard } from '@/components/Cards'
import { RichText } from '@payloadcms/richtext-lexical/react'
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'
import Icon from '@/components/Icons'
import { mediaOf } from '@/components/CarImage'
import { thDate } from '@/components/Cards'
import Jsonld, { articleLd, breadcrumbLd } from '@/components/Jsonld'
import type { Media, NewsItem } from '@/lib/types'

export const dynamic = 'force-dynamic'

type Article = NewsItem & { coverImage?: Media | number | null; content?: SerializedEditorState | null; updatedAt?: string | null }

async function getArticle(slug: string) {
  return ((await getNewsBySlug(slug)) as unknown as Article) || null
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const a = await getArticle(slug)
  if (!a) return { title: 'ไม่พบข่าว' }
  const cover = mediaOf(a.coverImage)
  const expired = isPromoExpired(a)
  return {
    title: expired ? `${a.title} (สิ้นสุดแล้ว)` : a.title,
    description: a.excerpt,
    alternates: { canonical: `/news/${a.slug}` },
    // zip #40 — โปรหมดอายุ: เอาออกจาก Google แต่ยังเปิดอ่านได้ (ลิงก์ที่แชร์ใน FB/LINE ไม่ 404)
    ...(expired ? { robots: { index: false, follow: true } } : {}),
    openGraph: {
      type: 'article',
      title: a.title,
      description: a.excerpt,
      url: `/news/${a.slug}`,
      ...(a.publishedAt ? { publishedTime: a.publishedAt } : {}),
      ...(cover?.url ? { images: [{ url: cover.url, alt: cover.alt || a.title }] } : {}),
    },
  }
}

export default async function NewsArticle({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const [a, allNews, site] = await Promise.all([getArticle(slug), getNewsList(60), getSiteData()])
  if (!a) notFound()
  const cover = mediaOf(a.coverImage)
  const expired = isPromoExpired(a)
  // zip #40 — ลิงก์ภายใน: รุ่นที่บทความพูดถึง + บทความอื่นที่เกี่ยวข้อง
  const mentioned = modelsInNews(site.models, a)
  const related = relatedNews(allNews as unknown as NewsItem[], a)
  return (
    <>
      <Jsonld data={articleLd({ title: a.title, slug: a.slug, excerpt: a.excerpt, publishedAt: a.publishedAt, updatedAt: a.updatedAt, imageUrl: cover?.url })} />
      <Jsonld data={breadcrumbLd([{ name: 'ข่าวสารและกิจกรรม', path: '/news' }, { name: a.title, path: `/news/${a.slug}` }])} />
      <section className="page-head">
        <div className="container" style={{ maxWidth: 820 }}>
          <Link href="/news" className="sec-link" style={{ marginBottom: 10 }}><Icon name="back" size={16} />ข่าวทั้งหมด</Link>
          <h1>{a.title}</h1>
          <p className="lead">{thDate(a.publishedAt)}</p>
        </div>
      </section>
      <main className="container" style={{ maxWidth: 820 }}>
        <article className="section" style={{ paddingTop: 20 }}>
          {expired ? (
            <div className="card" role="note" style={{ padding: 16, marginBottom: 20, display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center', background: 'var(--soft)' }}>
              <b>โปรโมชั่นนี้สิ้นสุดแล้ว</b>
              <span style={{ opacity: 0.8 }}>ดูข้อเสนอที่ใช้ได้ตอนนี้ได้ที่หน้าโปรโมชั่น</span>
              <Link className="btn btn-primary" href="/promotion" style={{ marginLeft: 'auto' }}>โปรโมชั่นเดือนนี้</Link>
            </div>
          ) : null}
          {cover?.url ? (
            <div className="g" style={{ position: 'relative', aspectRatio: '16 / 9', borderRadius: 16, overflow: 'hidden', background: 'var(--soft)', marginBottom: 20 }}>
              <Image src={cover.url} alt={cover.alt || a.title} fill sizes="(max-width: 900px) 100vw, 820px" style={{ objectFit: 'cover' }} />
            </div>
          ) : null}
          <p style={{ fontSize: 17, lineHeight: 1.7 }}>{a.excerpt}</p>
          {a.content ? (
            <div className="rich" style={{ marginTop: 20, fontSize: 16, lineHeight: 1.8 }}>
              <RichText data={a.content} />
            </div>
          ) : null}

          {mentioned.length > 0 ? (
            <div className="card" style={{ padding: 16, marginTop: 28, display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
              <b>รุ่นที่กล่าวถึงในบทความ</b>
              {mentioned.map((m) => (
                <Link key={m.id} className="btn btn-outline" href={`/car-model/${m.slug}`}>BYD {m.name} ราคา·ตารางผ่อน</Link>
              ))}
              <Link className="btn btn-primary" href="/test-drive">นัดทดลองขับ</Link>
            </div>
          ) : null}
        </article>

        {related.length > 0 ? (
          <section className="section" style={{ paddingTop: 0 }}>
            <div className="sec-head">
              <div><h2>บทความที่เกี่ยวข้อง</h2></div>
              <Link className="sec-link" href="/news"><Icon name="back" size={16} />ข่าวทั้งหมด</Link>
            </div>
            <div className="grid-3">
              {related.map((n) => <NewsCard key={n.id} n={n} />)}
            </div>
          </section>
        ) : null}
      </main>
    </>
  )
}
