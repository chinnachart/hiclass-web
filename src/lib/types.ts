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
  powertrain?: 'ev' | 'phev' | null
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
  rentalRates?: { variant: string; day1?: number | null; day3?: number | null; day7?: number | null; day30?: number | null }[] | null
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
  facebookUrl?: string | null
  instagramUrl?: string | null
  tiktokUrl?: string | null
  youtubeUrl?: string | null
}

export type FaqItem = { question: string; answer: string }

export type AwardItem = {
  year: number
  title: string
  th: string
  event: string
  level: 'national' | 'apac'
  count?: number | null
}

/** ข้อความในหน้า รางวัล / รถเช่า / ศูนย์บริการ / เทิร์นรถเก่า — แก้ได้จากหลังบ้าน */
export type PageContent = {
  awKicker?: string | null
  awAsOf?: string | null
  awHeadline?: string | null
  awHeadline2?: string | null
  awLead?: string | null
  awHeroImage?: Media | number | null
  awStats?: { value: string; label: string }[] | null
  awItems?: AwardItem[] | null
  awYearPhotos?: { year: number; image: Media | number }[] | null
  awTechTitle?: string | null
  awTechSub?: string | null
  awTechNote?: string | null
  awTechImage?: Media | number | null
  awCtaTitle?: string | null
  awCtaSub?: string | null
  awSeoTitle?: string | null
  awSeoDesc?: string | null

  rtKicker?: string | null
  rtTitle?: string | null
  rtLead?: string | null
  rtFineprint?: string | null
  rtFaq?: FaqItem[] | null
  rtSeoTitle?: string | null
  rtSeoDesc?: string | null

  svKicker?: string | null
  svTitle?: string | null
  svLead?: string | null
  svServices?: { icon?: string | null; title: string; body: string }[] | null
  svFaq?: FaqItem[] | null
  svSeoTitle?: string | null
  svSeoDesc?: string | null

  tiKicker?: string | null
  tiTitle?: string | null
  tiLead?: string | null
  tiFaq?: FaqItem[] | null
  tiSeoTitle?: string | null
  tiSeoDesc?: string | null
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
  image?: Media | number | null
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
  contactEmail?: string | null
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
  googleAdsId?: string | null
  adsLabelTestDrive?: string | null
  adsLabelRegister?: string | null
  adsLabelPhone?: string | null
  adsLabelLine?: string | null
}
