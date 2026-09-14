// lib/gtag.ts
// Google Ads conversion tracking สำหรับ hiclassevcar.com
// บัญชี: BYD Hi-Class Rama5 — Conversion ID AW-17450005764

export const AW_ID = 'AW-17450005764'

/**
 * Label ของแต่ละ conversion action — ดึงมาจากบัญชี Google Ads จริง
 * ถ้าสร้าง conversion action ใหม่ ให้ก๊อป label จาก
 * Goals → Conversions → คลิกที่ action → Tag setup → Install manually
 * (ส่วนที่อยู่หลัง "AW-17450005764/" ใน send_to)
 */
export const CONVERSION_LABELS = {
  testDrive:        '0YwMCP_ejfUcEITq54BB', // Test Drive Form   (Submit lead form)
  registerInterest: 'jjhsCPDelfUcEITq54BB', // Register Interest (Submit lead form)
  phoneClick:       '_HZaCN_6lfUcEITq54BB', // Phone Click       (Contact)
  lineClick:        'R4MDCIzRmvUcEITq54BB', // LINE Click        (Contact)
} as const

export type ConversionName = keyof typeof CONVERSION_LABELS

type TrackOptions = {
  /** กันนับซ้ำ ถ้าผู้ใช้กดส่งสองครั้งหรือรีเฟรชหน้า thank-you */
  transactionId?: string
  /** มูลค่าโดยประมาณของลีด (ถ้าอยากดู ROAS ทีหลัง) */
  value?: number
  currency?: string
  /** เรียกหลัง Google รับ event แล้ว — ใช้ตอนจะ redirect */
  onDone?: () => void
  /** เผื่อ event_callback ไม่มา จะยิง onDone เองหลังกี่ ms */
  timeoutMs?: number
}

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void
    dataLayer?: unknown[]
  }
}

/**
 * ยิง conversion ไป Google Ads
 *
 * สำคัญ: เรียกฟังก์ชันนี้ "หลังบันทึกข้อมูลสำเร็จ" เท่านั้น
 * ห้ามเรียกตอนโหลดหน้า ไม่งั้นจะนับทุกคนที่เปิดหน้า ไม่ใช่คนที่กรอกฟอร์มจริง
 *
 * @example
 * const res = await fetch('/api/test-drive', { method: 'POST', body })
 * if (res.ok) {
 *   trackConversion('testDrive', {
 *     transactionId: leadId,
 *     onDone: () => router.push('/test-drive/thank-you'),
 *   })
 * }
 */
export function trackConversion(name: ConversionName, opts: TrackOptions = {}): void {
  const {
    transactionId,
    value,
    currency = 'THB',
    onDone,
    timeoutMs = 1200,
  } = opts

  const label = CONVERSION_LABELS[name]

  // SSR หรือ gtag ยังไม่โหลด — อย่าให้ผู้ใช้ค้าง เดินหน้าต่อเลย
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(`[gtag] ยังไม่พร้อม ข้าม conversion "${name}"`)
    }
    onDone?.()
    return
  }

  // กัน onDone ถูกเรียกสองครั้ง (ทั้งจาก callback และ timeout)
  let finished = false
  const finish = () => {
    if (finished) return
    finished = true
    onDone?.()
  }

  const payload: Record<string, unknown> = {
    send_to: `${AW_ID}/${label}`,
    event_callback: finish,
  }
  if (transactionId) payload.transaction_id = transactionId
  if (typeof value === 'number') {
    payload.value = value
    payload.currency = currency
  }

  window.gtag('event', 'conversion', payload)

  // Safety net: ถ้า Google ไม่ตอบกลับใน timeoutMs ก็ไปต่อ
  window.setTimeout(finish, timeoutMs)
}

/**
 * ช่วยสำหรับลิงก์โทร / LINE ที่พาออกนอกเว็บ
 * ยิง conversion ก่อน แล้วค่อยเปิดลิงก์ ไม่งั้น request จะถูกตัดกลางทาง
 *
 * @example
 * <a href="tel:021234567" onClick={(e) => trackOutboundClick(e, 'phoneClick')}>โทรเลย</a>
 */
export function trackOutboundClick(
  e: React.MouseEvent<HTMLAnchorElement>,
  name: ConversionName,
): void {
  const href = e.currentTarget.href
  const target = e.currentTarget.target

  // ปล่อยให้เบราว์เซอร์จัดการเองถ้าเปิดแท็บใหม่ หรือกด ctrl/cmd ค้าง
  if (target === '_blank' || e.metaKey || e.ctrlKey) {
    trackConversion(name)
    return
  }

  e.preventDefault()
  trackConversion(name, {
    onDone: () => {
      window.location.href = href
    },
  })
}
