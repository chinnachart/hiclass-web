import type { Metadata } from 'next'
import CardGenerator from '@/components/CardGenerator'

export const dynamic = 'force-dynamic'

// หน้าภายในสำหรับพนักงาน — ไม่ให้ Google เก็บ · ไม่อยู่ใน sitemap · ต้องล็อกอินด้วยบัญชี Cinco
export const metadata: Metadata = {
  title: 'สร้างนามบัตรออนไลน์ (พนักงาน)',
  robots: { index: false, follow: false, nocache: true },
  alternates: { canonical: '/gen-card' },
}

export default function GenCardPage() {
  return (
    <main className="container" style={{ paddingTop: 24, paddingBottom: 48 }}>
      <CardGenerator />
    </main>
  )
}
