'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Script from 'next/script'

const KEY = 'hc-cookie-consent'

/**
 * แถบแจ้งคุกกี้ตาม PDPA — Google Analytics จะโหลดก็ต่อเมื่อผู้ใช้กด "ยอมรับ" เท่านั้น
 * คุกกี้ที่จำเป็นต่อการทำงานของเว็บ (เช่น ล็อกอินหลังบ้าน) ไม่ต้องขอความยินยอม
 */
export default function CookieConsent({ gaId }: { gaId?: string | null }) {
  const [choice, setChoice] = useState<'unknown' | 'accepted' | 'declined'>('unknown')
  const [ready, setReady] = useState(false)

  useEffect(() => {
    try {
      const v = localStorage.getItem(KEY)
      if (v === 'accepted' || v === 'declined') setChoice(v)
    } catch {}
    setReady(true)
  }, [])

  const decide = (v: 'accepted' | 'declined') => {
    try { localStorage.setItem(KEY, v) } catch {}
    setChoice(v)
  }

  return (
    <>
      {gaId && choice === 'accepted' ? (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} strategy="afterInteractive" />
          <Script id="ga4" strategy="afterInteractive">{`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${gaId}', { anonymize_ip: true });
          `}</Script>
        </>
      ) : null}

      {ready && choice === 'unknown' ? (
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
      ) : null}
    </>
  )
}
