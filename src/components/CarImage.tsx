import Image from 'next/image'
import type { CarModel, Media } from '@/lib/types'

export const mediaOf = (v: CarModel['heroImage'] | Media | number | null | undefined): Media | null =>
  v && typeof v === 'object' ? (v as Media) : null

/** เงารถแบบกลางๆ ใช้แทนรูปจนกว่าทีมจะอัปโหลดรูปจริงจากหลังบ้าน */
export function CarSilhouette({ width = 300, tone = '#D9DBDF' }: { width?: number; tone?: string }) {
  const h = Math.round(width * 0.4)
  return (
    <svg width={width} height={h} viewBox="0 0 300 120" fill="none" style={{ display: 'block', maxWidth: '100%', height: 'auto' }} aria-hidden="true">
      <ellipse cx="150" cy="104" rx="120" ry="8" fill="#000" opacity="0.06" />
      <path d="M30 78c0-10 6-16 18-18l30-6c20-14 40-22 72-22 30 0 52 8 74 26l36 6c8 2 12 8 12 16v12H30V78z" fill={tone} />
      <path d="M84 54c18-12 36-18 66-18 28 0 48 6 66 20H84z" fill="#fff" opacity="0.55" />
      <circle cx="80" cy="92" r="16" fill="#2B2D31" /><circle cx="80" cy="92" r="7" fill="#9A9DA3" />
      <circle cx="222" cy="92" r="16" fill="#2B2D31" /><circle cx="222" cy="92" r="7" fill="#9A9DA3" />
    </svg>
  )
}

/** รูปหลักของรุ่น — ถ้ายังไม่มีรูปในหลังบ้านจะแสดงเงารถแทน */
export default function CarImage({
  media,
  alt,
  sizes = '(max-width: 700px) 50vw, 300px',
  fallbackWidth = 170,
  priority = false,
}: {
  media: CarModel['heroImage'] | Media | null | undefined
  alt: string
  sizes?: string
  fallbackWidth?: number
  priority?: boolean
}) {
  const m = mediaOf(media)
  if (m?.url) {
    return (
      <Image
        src={m.url}
        alt={m.alt || alt}
        fill
        sizes={sizes}
        priority={priority}
        style={{ objectFit: 'contain', objectPosition: 'center' }}
      />
    )
  }
  return <CarSilhouette width={fallbackWidth} />
}
