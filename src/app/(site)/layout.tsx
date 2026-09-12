import type { Metadata } from 'next'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import MobileBar from '@/components/MobileBar'
import CookieConsent from '@/components/CookieConsent'
import Tracking from '@/components/Tracking'
import { Analytics } from '@vercel/analytics/next'
import { getSiteData } from '@/lib/data'
// ฟอนต์เก็บในเว็บเราเอง (zip #22) — เดิมโหลดจาก Google Fonts ทำให้หน้าแรกค้างรอ CSS ภายนอก
import '@fontsource/kanit/thai-400.css'
import '@fontsource/kanit/latin-400.css'
import '@fontsource/kanit/thai-500.css'
import '@fontsource/kanit/latin-500.css'
import '@fontsource/kanit/thai-600.css'
import '@fontsource/kanit/latin-600.css'
import '@fontsource/kanit/thai-700.css'
import '@fontsource/kanit/latin-700.css'
import '@fontsource/noto-sans-thai/thai-400.css'
import '@fontsource/noto-sans-thai/latin-400.css'
import '@fontsource/noto-sans-thai/thai-500.css'
import '@fontsource/noto-sans-thai/latin-500.css'
import '@fontsource/noto-sans-thai/thai-600.css'
import '@fontsource/noto-sans-thai/latin-600.css'
import '@fontsource/noto-sans-thai/thai-700.css'
import '@fontsource/noto-sans-thai/latin-700.css'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://hiclassevcar.com'),
  title: {
    default: 'BYD Hi-Class EV Car — ผู้จำหน่ายรถยนต์ไฟฟ้า BYD 5 สาขาในกรุงเทพฯ',
    template: '%s | BYD Hi-Class EV Car',
  },
  description:
    'ผู้จำหน่ายรถยนต์ไฟฟ้า BYD อย่างเป็นทางการ เลือกรุ่น คำนวณค่างวด และนัดทดลองขับได้ที่ 5 สาขาในกรุงเทพฯ พร้อมศูนย์บริการและบริการรถให้เช่า',
  openGraph: { type: 'website', locale: 'th_TH', siteName: 'BYD Hi-Class EV Car' },
}

export const dynamic = 'force-dynamic'

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const { models, branches, settings } = await getSiteData()
  return (
    <html lang="th">
      <head>
        {settings.googleSiteVerification ? <meta name="google-site-verification" content={settings.googleSiteVerification} /> : null}
        <meta name="theme-color" content="#ffffff" />
      </head>
      <body>
        <Header models={models} branches={branches} settings={settings} />
        {children}
        <Footer models={models} branches={branches} settings={settings} />
        <MobileBar settings={settings} branches={branches} />
        <CookieConsent />
        {/* GA4 + Google Ads แบบ Consent Mode — ไม่ตั้งคุกกี้จนกว่าผู้ใช้กดยอมรับ · จำ gclid/utm · ดักคลิกโทร/LINE */}
        <Tracking
          gaMeasurementId={settings.gaMeasurementId}
          googleAdsId={settings.googleAdsId}
          adsLabelTestDrive={settings.adsLabelTestDrive}
          adsLabelRegister={settings.adsLabelRegister}
          adsLabelPhone={settings.adsLabelPhone}
          adsLabelLine={settings.adsLabelLine}
        />
        {/* Vercel Web Analytics — ไม่ใช้คุกกี้ ไม่เก็บข้อมูลส่วนบุคคล จึงไม่ต้องรอผู้ใช้กดยอมรับ (ต่างจาก GA4) */}
        <Analytics />
      </body>
    </html>
  )
}
