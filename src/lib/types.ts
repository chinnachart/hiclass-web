export type Media = {
  id: number
  url?: string | null
  alt?: string | null
  width?: number | null
  height?: number | null
}

export type CarModel = {
  id: number
  name: string
  slug: string
  bodyType: 'suv' | 'sedan' | 'hatch' | 'mpv'
  tagline: string
  priceFrom: number
  rangeKm?: number | null
  colorsCount?: number | null
  heroImage?: Media | number | null
  gallery?: (Media | number)[] | null
  specs?: { label: string; value: string }[] | null
  variants?: { name: string; price: number; note?: string | null }[] | null
  rentalAvailable?: boolean | null
  rentalDaily?: number | null
  rentalMonthly?: number | null
  faq?: { question: string; answer: string }[] | null
}

export type Branch = {
  id: number
  name: string
  nameEn?: string | null
  code: string
  phone: string
  openHours?: string | null
  address?: string | null
  mapUrl?: string | null
  lineUrl?: string | null
  intro?: string | null
}

export type Promotion = {
  id: number
  title: string
  summary: string
  badge?: string | null
  featured?: boolean | null
  endDate?: string | null
  ctaLabel?: string | null
  ctaHref?: string | null
}

export type NewsItem = {
  id: number
  title: string
  slug: string
  category?: string | null
  excerpt: string
  publishedAt: string
}

export type SiteSettings = {
  heroHeadline: string
  heroHeadline2?: string | null
  heroSub?: string | null
  heroBlurb?: string | null
  mainPhone: string
  lineUrl?: string | null
  facebookUrl?: string | null
  footerAbout?: string | null
  financeRate: number
  defaultDownPercent?: number | null
  defaultTerm?: number | null
  financeNote?: string | null
  deliveredCount?: number | null
  yearsOpen?: number | null
  googleRating?: number | null
  trustNote?: string | null
  gaMeasurementId?: string | null
  googleSiteVerification?: string | null
}
