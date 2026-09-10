import type { Metadata } from 'next'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import MobileBar from '@/components/MobileBar'
import CookieConsent from '@/components/CookieConsent'
import { Analytics } from '@vercel/analytics/next'
import { getSiteData } from '@/lib/data'
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
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Kanit:wght@400;500;600;700&family=Noto+Sans+Thai:wght@400;500;600;700&display=swap"
        />
        <meta name="theme-color" content="#ffffff" />
      </head>
      <body>
        <Header models={models} branches={branches} settings={settings} />
        {children}
        <Footer models={models} branches={branches} settings={settings} />
        <MobileBar settings={settings} />
        <CookieConsent gaId={settings.gaMeasurementId} />
        {/* Vercel Web Analytics — ไม่ใช้คุกกี้ ไม่เก็บข้อมูลส่วนบุคคล จึงไม่ต้องรอผู้ใช้กดยอมรับ (ต่างจาก GA4) */}
        <Analytics />
      </body>
    </html>
  )
}
