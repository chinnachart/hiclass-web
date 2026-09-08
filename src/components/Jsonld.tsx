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

export const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://hiclassevcar.com'

export const dealerLd = (branches: { name: string; phone: string; address?: string | null; code: string }[]) => ({
  '@context': 'https://schema.org',
  '@type': 'AutoDealer',
  name: 'BYD Hi-Class EV Car',
  url: SITE,
  brand: { '@type': 'Brand', name: 'BYD' },
  areaServed: 'กรุงเทพมหานครและปริมณฑล',
  award: AWARD_NAMES,
  department: branches.map((b) => ({
    '@type': 'AutoDealer',
    name: `BYD Hi-Class ${b.name}`,
    telephone: b.phone,
    url: `${SITE}/branches/${b.code}`,
    ...(b.address ? { address: { '@type': 'PostalAddress', streetAddress: b.address, addressCountry: 'TH' } } : {}),
  })),
})

export const carLd = (m: {
  name: string
  slug: string
  tagline: string
  priceFrom: number
  rangeKm?: number | null
}) => ({
  '@context': 'https://schema.org',
  '@type': 'Car',
  name: `BYD ${m.name}`,
  brand: { '@type': 'Brand', name: 'BYD' },
  model: m.name,
  bodyType: m.tagline,
  url: `${SITE}/car-model/${m.slug}`,
  ...(m.rangeKm
    ? { vehicleRange: { '@type': 'QuantitativeValue', value: m.rangeKm, unitCode: 'KMT' } }
    : {}),
  offers: {
    '@type': 'Offer',
    price: m.priceFrom,
    priceCurrency: 'THB',
    availability: 'https://schema.org/InStock',
    seller: { '@type': 'AutoDealer', name: 'BYD Hi-Class EV Car' },
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
