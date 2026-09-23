import type { Review } from '@/lib/types'

/** ดาว 5 ดวงตายตัว (เจ้าของสั่ง 23 ก.ย. — ไม่ให้ลูกค้าเลือกดาวเอง) */
export function Stars() {
  return (
    <span className="rv-stars" aria-label="5 ดาว">
      {[0, 1, 2, 3, 4].map((i) => (
        <svg key={i} viewBox="0 0 20 20" width="16" height="16" aria-hidden="true">
          <path d="M10 1.8l2.47 5.01 5.53.8-4 3.9.94 5.5L10 14.4l-4.94 2.6.94-5.5-4-3.9 5.53-.8z" fill="currentColor" />
        </svg>
      ))}
    </span>
  )
}

export function ReviewCard({ r }: { r: Review }) {
  const meta = [r.model ? `BYD ${r.model}` : null, r.branch ? `สาขา${r.branch}` : null].filter(Boolean).join(' · ')
  return (
    <figure className="card rv-card">
      <Stars />
      <blockquote>{r.message}</blockquote>
      <figcaption>
        <b>{r.name}</b>
        {meta ? <span>{meta}</span> : null}
      </figcaption>
    </figure>
  )
}

export function ReviewGrid({ reviews }: { reviews: Review[] }) {
  return (
    <div className="rv-grid">
      {reviews.map((r) => <ReviewCard key={r.id} r={r} />)}
    </div>
  )
}
