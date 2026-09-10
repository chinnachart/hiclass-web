import type { Metadata } from 'next'
import Image from 'next/image'
import Icon from '@/components/Icons'
import RegisterForm from '@/components/RegisterForm'
import { getSiteData } from '@/lib/data'

export const metadata: Metadata = {
  title: 'ลงทะเบียนความสนใจ รถยนต์ BYD — Register your Interest',
  description: 'ลงทะเบียนรับข้อเสนอพิเศษ BYD Atto 1, Atto 2, Atto 3 และทุกรุ่น จาก BYD Hi-Class EV Car ทีมขายสาขาที่เลือกติดต่อกลับในเวลาทำการ',
  alternates: { canonical: '/register' },
}

export const dynamic = 'force-dynamic'

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ model?: string; branch?: string }>
}) {
  const sp = await searchParams
  const { models, branches, settings } = await getSiteData()

  return (
    <>
      <section className="page-head">
        <div className="container">
          <p className="kicker"><Icon name="wheel" size={14} />Register your Interest</p>
          <h1>ลงทะเบียนความสนใจ รถยนต์ BYD</h1>
          <p className="lead">รับข้อเสนอพิเศษและข้อมูลรุ่นใหม่ BYD Atto 1 · Atto 2 · Atto 3 ก่อนใคร กรอกแค่ 1 นาที ทีมขายสาขาที่เลือกจะติดต่อกลับในเวลาทำการ</p>
        </div>
      </section>
      <main className="container">
        <section className="section" style={{ paddingTop: 20 }}>
          <div className="grid-2" style={{ alignItems: 'start', gap: 20 }}>
            {/* โปสเตอร์แคมเปญ — เปลี่ยนไฟล์ที่ public/campaign/ แล้วแก้ src/alt ตรงนี้ */}
            <div className="card" style={{ overflow: 'hidden', lineHeight: 0 }}>
              <Image
                src="/campaign/atto-week-surprise-deal.jpg"
                alt="ATTO WEEK SURPRISE DEAL — ดีลสุดพิเศษ BYD Atto 1, Atto 2, Atto 3 ทั้ง 3 รุ่น 3 วันเท่านั้น 11–13 ก.ย. 69"
                width={1200}
                height={1499}
                priority
                sizes="(min-width: 700px) 50vw, 100vw"
                style={{ width: '100%', height: 'auto', display: 'block' }}
              />
            </div>
            <div className="card" style={{ padding: 20 }}>
              <RegisterForm models={models} branches={branches} settings={settings} defaultModel={sp.model} defaultBranch={sp.branch} />
            </div>
          </div>
        </section>
      </main>
    </>
  )
}
