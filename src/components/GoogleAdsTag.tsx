// components/GoogleAdsTag.tsx
// วางไว้ใน app/layout.tsx ครั้งเดียว ครอบทั้งเว็บ

import Script from 'next/script'
import { AW_ID } from '@/lib/gtag'

/**
 * Base tag ของ Google Ads
 *
 * ลำดับสำคัญมาก:
 * 1. consent default — ต้องรันก่อน gtag.js โหลด (beforeInteractive)
 *    ถ้ารันทีหลัง Google จะถือว่ายังไม่ได้ consent แล้วทิ้ง event ไปเงียบๆ
 * 2. gtag.js
 * 3. config
 */
export default function GoogleAdsTag() {
  return (
    <>
      <Script id="gtag-consent-default" strategy="beforeInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('consent', 'default', {
            'ad_storage': 'granted',
            'ad_user_data': 'granted',
            'ad_personalization': 'granted',
            'analytics_storage': 'granted'
          });
        `}
      </Script>

      <Script
        id="gtag-src"
        src={`https://www.googletagmanager.com/gtag/js?id=${AW_ID}`}
        strategy="afterInteractive"
      />

      <Script id="gtag-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${AW_ID}');
        `}
      </Script>
    </>
  )
}
