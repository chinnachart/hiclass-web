'use client'

import { useEffect } from 'react'
import Script from 'next/script'
import { usePathname } from 'next/navigation'
import { rememberAttribution, track } from '@/lib/track'
import { CONSENT_KEY, CONSENT_EVENT } from './CookieConsent'
import type { SiteSettings } from '@/lib/types'

type Props = Pick<SiteSettings, 'gaMeasurementId' | 'googleAdsId' | 'adsLabelTestDrive' | 'adsLabelRegister' | 'adsLabelPhone' | 'adsLabelLine'>

const GRANTED = { ad_storage: 'granted', ad_user_data: 'granted', ad_personalization: 'granted', analytics_storage: 'granted' }

/**
 * โหลด gtag (GA4 + Google Ads) แบบ Consent Mode v2
 * - ค่าเริ่มต้น = ปฏิเสธทุกอย่าง → ไม่ตั้งคุกกี้ จนกว่าผู้ใช้กด "ยอมรับ" ในแถบ PDPA (CookieConsent)
 * - จำ gclid / utm จาก URL ไว้แนบกับฟอร์ม
 * - ดักคลิกลิงก์ tel: และ LINE ทั้งเว็บ → event phone_click / line_click (+ conversion ถ้าตั้ง label ไว้)
 */
export default function Tracking(settings: Props) {
  const gaId = (settings.gaMeasurementId || '').trim()
  const adsId = (settings.googleAdsId || '').trim()
  const primary = gaId || adsId
  const pathname = usePathname()

  // จำที่มาทุกครั้งที่เปลี่ยนหน้า (คลิกแอดเข้าหน้าไหนก็ได้)
  useEffect(() => {
    rememberAttribution()
  }, [pathname])

  // ผู้ใช้เคยยอมรับแล้ว / เพิ่งกดยอมรับ → เปิดคุกกี้
  useEffect(() => {
    if (!primary) return
    const apply = (v: string | null) => {
      if (v === 'accepted' && typeof window.gtag === 'function') window.gtag('consent', 'update', GRANTED)
    }
    try {
      apply(localStorage.getItem(CONSENT_KEY))
    } catch {}
    const onConsent = (e: Event) => apply((e as CustomEvent<string>).detail)
    window.addEventListener(CONSENT_EVENT, onConsent)
    return () => window.removeEventListener(CONSENT_EVENT, onConsent)
  }, [primary])

  // คลิกโทร / LINE ที่ไหนก็ได้ในเว็บ
  useEffect(() => {
    if (!primary) return
    const onClick = (e: MouseEvent) => {
      const a = (e.target as Element | null)?.closest?.('a[href]') as HTMLAnchorElement | null
      if (!a) return
      const href = a.getAttribute('href') || ''
      if (href.startsWith('tel:')) track('phone_click', settings, { page: pathname })
      else if (/^(https?:\/\/([a-z0-9-]+\.)*(line\.me|lin\.ee)(\/|$)|line:)/i.test(href)) track('line_click', settings, { page: pathname })
    }
    document.addEventListener('click', onClick, true)
    return () => document.removeEventListener('click', onClick, true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [primary, pathname, adsId, settings.adsLabelPhone, settings.adsLabelLine])

  if (!primary) return null

  return (
    <>
      <Script id="gtag-consent" strategy="afterInteractive">{`
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        window.gtag = gtag;
        gtag('consent', 'default', {
          ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied', analytics_storage: 'denied',
          wait_for_update: 500
        });
        gtag('set', 'ads_data_redaction', true);
        gtag('set', 'url_passthrough', true);
        gtag('js', new Date());
        ${gaId ? `gtag('config', '${gaId}', { anonymize_ip: true });` : ''}
        ${adsId ? `gtag('config', '${adsId}');` : ''}
        // โหลด gtag.js หลังตั้งค่า consent แล้วเท่านั้น (ลำดับสำคัญ ไม่งั้นครั้งแรกจะตั้งคุกกี้ก่อนถาม)
        (function(){var s=document.createElement('script');s.async=true;s.src='https://www.googletagmanager.com/gtag/js?id=${primary}';document.head.appendChild(s);})();
      `}</Script>
    </>
  )
}
