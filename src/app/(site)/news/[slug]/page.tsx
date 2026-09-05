import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@payload-config'
import { RichText } from '@payloadcms/richtext-lexical/react'
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'
import Icon from '@/components/Icons'
import { mediaOf } from '@/components/CarImage'
import { thDate } from '@/components/Cards'
import type { Media, NewsItem } from '@/lib/types'

export const dynamic = 'force-dynamic'

type Article = NewsItem & { coverImage?: Media | number | null; content?: SerializedEditorState | null }

async function getArticle(slug: string) {
  const payload = await getPayload({ config })
  const res = await payload.find({ collection: 'news', where: { slug: { equals: slug } }, limit: 1, depth: 1 })
  return (res.docs[0] as unknown as Article) || null
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const a = await getArticle(slug)
  if (!a) return { title: 'ไม่พบข่าว' }
  return { title: a.title, description: a.excerpt, alternates: { canonical: `/news/${a.slug}` } }
}

export default async function NewsArticle({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const a = await getArticle(slug)
  if (!a) notFound()
  const cover = mediaOf(a.coverImage)
  return (
    <>
      <section className="page-head">
        <div className="container" style={{ maxWidth: 820 }}>
          <Link href="/news" className="sec-link" style={{ marginBottom: 10 }}><Icon name="back" size={16} />ข่าวทั้งหมด</Link>
          <h1>{a.title}</h1>
          <p className="lead">{thDate(a.publishedAt)}</p>
        </div>
      </section>
      <main className="container" style={{ maxWidth: 820 }}>
        <article className="section" style={{ paddingTop: 20 }}>
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
        </article>
      </main>
    </>
  )
}
