'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

export const CONSENT_KEY = 'hc-cookie-consent'
export const CONSENT_EVENT = 'hc-consent'

/**
 * แถบแจ้งคุกกี้ตาม PDPA — ตัว tag ของ Google โหลดใน <Tracking> แบบ Consent Mode (ไม่ตั้งคุกกี้จนกว่าจะกดยอมรับ)
 * คอมโพเนนต์นี้แค่จำคำตอบและประกาศให้ Tracking รู้
 */
export default function CookieConsent() {
  const [choice, setChoice] = useState<'unknown' | 'accepted' | 'declined'>('unknown')
  const [ready, setReady] = useState(false)

  useEffect(() => {
    try {
      const v = localStorage.getItem(CONSENT_KEY)
      if (v === 'accepted' || v === 'declined') setChoice(v)
    } catch {}
    setReady(true)
  }, [])

  const decide = (v: 'accepted' | 'declined') => {
    try { localStorage.setItem(CONSENT_KEY, v) } catch {}
    setChoice(v)
    try { window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: v })) } catch {}
  }

  if (!ready || choice !== 'unknown') return null

  return (
    <div className="cookie" role="dialog" aria-label="การใช้คุกกี้">
      <p>
        เว็บไซต์นี้ใช้คุกกี้เพื่อวัดผลการใช้งานและปรับปรุงบริการ อ่านเพิ่มเติมได้ที่{' '}
        <Link href="/privacy">นโยบายความเป็นส่วนตัว</Link>
      </p>
      <div className="cookie-acts">
        <button type="button" className="btn btn-soft" onClick={() => decide('declined')}>ปฏิเสธ</button>
        <button type="button" className="btn btn-dark" onClick={() => decide('accepted')}>ยอมรับ</button>
      </div>
    </div>
  )
}
