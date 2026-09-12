/**
 * ข้อมูลโครงสร้างสำหรับ Google — บอกตรงๆ ว่าหน้านี้คืออะไร
 * ทำให้ผลค้นหาแสดงราคา ที่ตั้ง และคำถามที่พบบ่อยได้
 */
export default function Jsonld({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }}
    />
  )
}

import { AWARD_NAMES } from '@/lib/awards'
import { thaiAddressLd, priceRangeOf } from '@/lib/localbiz'

export const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://hiclassevcar.com'

export const dealerLd = (
  branches: { name: string; phone: string; address?: string | null; code: string }[],
  prices: number[] = [],
) => ({
  '@context': 'https://schema.org',
  '@type': 'AutoDealer',
  name: 'BYD Hi-Class EV Car',
  url: SITE,
  brand: { '@type': 'Brand', name: 'BYD' },
  areaServed: 'กรุงเทพมหานครและปริมณฑล',
  award: AWARD_NAMES,
  // Google ขอรูปกับช่วงราคาสำหรับธุรกิจที่มีหน้าร้าน (zip #25)
  image: `${SITE}/opengraph-image.png`,
  priceRange: priceRangeOf(prices),
  department: branches.map((b) => ({
    '@type': 'AutoDealer',
    name: `BYD Hi-Class ${b.name}`,
    telephone: b.phone,
    url: `${SITE}/branches/${b.code}`,
    image: `${SITE}/opengraph-image.png`,
    priceRange: priceRangeOf(prices),
    ...(thaiAddressLd(b.address) ? { address: thaiAddressLd(b.address) } : {}),
  })),
})

export const carLd = (m: {
  name: string
  slug: string
  tagline: string
  priceFrom: number
  rangeKm?: number | null
  powertrain?: 'ev' | 'phev' | null
  imageUrl?: string | null
}) => ({
  '@context': 'https://schema.org',
  '@type': 'Car',
  name: `BYD ${m.name}`,
  brand: { '@type': 'Brand', name: 'BYD' },
  model: m.name,
  bodyType: m.tagline,
  url: `${SITE}/car-model/${m.slug}`,
  ...(m.imageUrl ? { image: m.imageUrl.startsWith('http') ? m.imageUrl : `${SITE}${m.imageUrl}` } : {}),
  ...(m.rangeKm && m.powertrain !== 'phev'
    ? { vehicleRange: { '@type': 'QuantitativeValue', value: m.rangeKm, unitCode: 'KMT' } }
    : {}),
  offers: {
    '@type': 'Offer',
    price: m.priceFrom,
    priceCurrency: 'THB',
    availability: 'https://schema.org/InStock',
    seller: { '@type': 'Organization', '@id': `${SITE}/#organization`, name: 'BYD Hi-Class EV Car', url: SITE },
  },
})

export const faqLd = (items: { question: string; answer: string }[]) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: items.map((f) => ({
    '@type': 'Question',
    name: f.question,
    acceptedAnswer: { '@type': 'Answer', text: f.answer },
  })),
})

/** ตัวตนของบริษัทบนหน้าแรก — ผูกเว็บเข้ากับเพจโซเชียลจริง ทำให้ Google แสดง Knowledge Panel ได้ (zip #25) */
export const organizationLd = (opts: { phone?: string | null; email?: string | null; sameAs?: (string | null | undefined)[] }) => ({
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': `${SITE}/#organization`,
  name: 'BYD Hi-Class EV Car',
  alternateName: 'Hi-Class EV Car',
  url: SITE,
  logo: `${SITE}/brand/hiclass-logo.png`,
  ...(opts.phone ? { telephone: opts.phone } : {}),
  ...(opts.email ? { email: opts.email } : {}),
  ...(() => {
    const same = (opts.sameAs || []).filter(Boolean)
    return same.length ? { sameAs: same } : {}
  })(),
})

/** บอก Google ว่าเว็บนี้ชื่ออะไร ใช้คู่กับ Organization */
export const webSiteLd = () => ({
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': `${SITE}/#website`,
  name: 'BYD Hi-Class EV Car',
  url: SITE,
  inLanguage: 'th-TH',
  publisher: { '@id': `${SITE}/#organization` },
})

/** เส้นทางหน้า — ทำให้ผลค้นหาแสดง หน้าแรก > รุ่นรถ > Atto 3 แทน URL ยาวๆ */
export const breadcrumbLd = (items: { name: string; path: string }[]) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [{ name: 'หน้าแรก', path: '/' }, ...items].map((it, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name: it.name,
    item: `${SITE}${it.path === '/' ? '' : it.path}`,
  })),
})

/** บทความข่าว — ทำให้มีสิทธิ์ขึ้นในผลค้นหาแบบบทความ พร้อมวันที่และรูป */
export const articleLd = (a: {
  title: string
  slug: string
  excerpt: string
  publishedAt?: string | null
  updatedAt?: string | null
  imageUrl?: string | null
}) => ({
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: a.title,
  description: a.excerpt,
  mainEntityOfPage: `${SITE}/news/${a.slug}`,
  inLanguage: 'th-TH',
  ...(a.imageUrl ? { image: a.imageUrl.startsWith('http') ? a.imageUrl : `${SITE}${a.imageUrl}` } : {}),
  ...(a.publishedAt ? { datePublished: a.publishedAt } : {}),
  ...(a.updatedAt || a.publishedAt ? { dateModified: a.updatedAt || a.publishedAt } : {}),
  author: { '@type': 'Organization', name: 'BYD Hi-Class EV Car', url: SITE },
  publisher: { '@id': `${SITE}/#organization` },
})
