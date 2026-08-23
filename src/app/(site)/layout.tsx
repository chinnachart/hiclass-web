import type { Metadata } from 'next'
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

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Chakra+Petch:wght@500;600;700&family=IBM+Plex+Sans+Thai:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap"
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
