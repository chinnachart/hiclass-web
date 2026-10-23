import type { Metadata } from 'next'
import Icon from '@/components/Icons'
import AiCourseForm from '@/components/AiCourseForm'
import { getSiteData } from '@/lib/data'

// ลิงก์ภายในสำหรับพนักงาน — ไม่อยู่ในเมนู/sitemap และไม่ให้ Google เก็บ
export const metadata: Metadata = {
  title: 'แบบสำรวจคอร์ส AI สำหรับพนักงาน Hi-Class',
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
}

export const dynamic = 'force-dynamic'

export default async function AiCoursePage() {
  const { branches } = await getSiteData()

  return (
    <>
      <section className="page-head">
        <div className="container">
          <p className="kicker"><Icon name="wheel" size={14} />สำหรับพนักงาน Hi-Class</p>
          <h1>คอร์สใช้ AI ในการทำงาน</h1>
          <p className="lead">บอกเราหน่อยว่าอยากเรียนอะไร อยากเอาไปต่อยอดอะไร และสะดวกเรียนที่ไหน เมื่อไหร่ — ใช้เวลา 3 นาที</p>
        </div>
      </section>
      <main className="container">
        <section className="section" style={{ paddingTop: 20, maxWidth: 720, margin: '0 auto' }}>
          <div className="card" style={{ padding: 20 }}>
            <AiCourseForm branches={branches} />
          </div>
        </section>
      </main>
    </>
  )
}
