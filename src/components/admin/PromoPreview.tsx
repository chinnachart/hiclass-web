'use client'

import { useFormFields } from '@payloadcms/ui'

/** ตัวอย่างการ์ดโปรโมชั่นบนมือถือ — อัปเดตสดขณะพิมพ์ในฟอร์ม */
export function PromoPreview() {
  const { title, summary, badge, featured, ctaLabel, endDate } = useFormFields(([fields]) => ({
    title: (fields.title?.value as string) || '',
    summary: (fields.summary?.value as string) || '',
    badge: (fields.badge?.value as string) || '',
    featured: !!fields.featured?.value,
    ctaLabel: (fields.ctaLabel?.value as string) || '',
    endDate: (fields.endDate?.value as string) || '',
  }))
  const until = endDate
    ? `ถึง ${new Date(endDate).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })}`
    : 'ไม่มีกำหนดสิ้นสุด'

  return (
    <div className="hc-preview">
      <div className="hc-preview__label">ตัวอย่างบนมือถือ <span>อัปเดตสด</span></div>
      <div className={`hc-promo${featured ? ' hc-promo--lead' : ''}`}>
        {badge ? <span className="hc-promo__badge">{badge}</span> : null}
        <div className="hc-promo__title">{title || '[หัวข้อโปรโมชั่น]'}</div>
        <p className="hc-promo__sum">{summary || '[รายละเอียดสั้น 1–2 บรรทัด]'}</p>
        <span className="hc-promo__until">{until}</span>
        <span className="hc-promo__more">{ctaLabel || 'ดูเงื่อนไข'} →</span>
      </div>
      <p className="hc-muted" style={{ fontSize: 12, marginTop: 8 }}>
        {featured ? 'โปรเด่น: การ์ดใหญ่พื้นดำ ขึ้นบนสุดของหน้าแรก (ควรมีแค่อันเดียว)' : 'การ์ดปกติ: ขึ้นถัดจากโปรเด่นบนหน้าแรกและหน้าโปรโมชั่น'}
      </p>
    </div>
  )
}
