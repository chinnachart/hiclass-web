import type { Metadata } from 'next'
import SmartReportForm from '@/components/SmartReportForm'
import { getSiteData } from '@/lib/data'

export const dynamic = 'force-dynamic'

// หน้าภายในสำหรับพนักงาน แจ้งปัญหาระบบ SMART — ไม่ต้องล็อกอิน · ไม่ให้ Google เก็บ · ไม่อยู่ใน sitemap
export const metadata: Metadata = {
  title: 'แจ้งปัญหาระบบ SMART (พนักงาน)',
  robots: { index: false, follow: false, nocache: true },
  alternates: { canonical: '/smart-report' },
}

export default async function SmartReportPage() {
  const { branches } = await getSiteData()
  return (
    <main className="container" style={{ paddingTop: 24, paddingBottom: 48, maxWidth: 720 }}>
      <h1 style={{ fontSize: 26, marginBottom: 6 }}>แจ้งปัญหาระบบ SMART</h1>
      <p className="mute" style={{ marginBottom: 20 }}>สำหรับพนักงาน Hi-Class ฝ่ายขายและฝ่ายบริการ เลือกฝ่าย เล่าปัญหา แนบภาพหน้าจอ แล้วกดส่ง</p>
      <SmartReportForm branches={branches.map((b) => b.name)} />
    </main>
  )
}
