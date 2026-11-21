import type { Metadata } from 'next'
import Icon from '@/components/Icons'
import OutingForm from '@/components/OutingForm'
import { OUTING } from '@/lib/outing'

// ลิงก์ภายในสำหรับพนักงาน — ไม่อยู่ในเมนู/sitemap และไม่ให้ Google เก็บ
export const metadata: Metadata = {
  title: 'แบบสำรวจ Outing ปีใหม่ 2570 สำหรับพนักงาน Hi-Class',
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
}

export const dynamic = 'force-dynamic'

export default function OutingPage() {
  return (
    <>
      <section className="page-head">
        <div className="container">
          <p className="kicker"><Icon name="calendar" size={14} />สำหรับพนักงาน Hi-Class | คำเชิญร่วมงานเลี้ยง</p>
          <h1>{OUTING.title}</h1>
          <p className="lead">{OUTING.place} {OUTING.when}</p>
          <p className="mute" style={{ marginTop: 6 }}>{OUTING.holiday} | {OUTING.note}</p>
        </div>
      </section>
      <main className="container">
        <section className="section" style={{ paddingTop: 20, maxWidth: 720, margin: '0 auto' }}>
          <div className="card" style={{ padding: 20 }}>
            <OutingForm />
          </div>
        </section>
      </main>
    </>
  )
}
