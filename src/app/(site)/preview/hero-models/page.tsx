import ModelCarousel from '@/components/ModelCarousel'
import { mediaOf } from '@/components/CarImage'
import { getSiteData } from '@/lib/data'

export const dynamic = 'force-dynamic'

// หน้าทดลองดีไซน์ hero ใหม่ — ไม่ลิงก์จากที่ไหน ไม่ให้ Google เก็บ
export const metadata = { title: 'ทดลอง: ปัดดูรถทุกรุ่น', robots: { index: false, follow: false } }

export default async function PreviewHeroModels() {
  const { models, settings } = await getSiteData()
  return (
    <ModelCarousel
      lineUrl={settings.lineUrl}
      models={models.map((m) => {
        const img = mediaOf(m.heroImage)
        return { name: m.name, slug: m.slug, tagline: m.tagline, priceFrom: m.priceFrom, rangeKm: m.rangeKm, powertrain: m.powertrain, img: img?.url, alt: img?.alt }
      })}
    />
  )
}
