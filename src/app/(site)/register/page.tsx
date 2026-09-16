import type { Metadata } from 'next'
import Image from 'next/image'
import Icon from '@/components/Icons'
import RegisterForm from '@/components/RegisterForm'
import { getSiteData } from '@/lib/data'

export const metadata: Metadata = {
  title: 'ลงทะเบียนความสนใจ รถยนต์ BYD — Register your Interest',
  description: 'ลงทะเบียนรับดีลลับ BYD Seal 5, Sealion 5 และข้อเสนอพิเศษทุกรุ่น จาก BYD Hi-Class EV Car ทีมขายสาขาที่เลือกติดต่อกลับในเวลาทำการ',
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
          <p className="lead">รับดีลลับ BYD Seal 5 · Sealion 5 ก่อนใคร กรอกแค่ 1 นาที ทีมขายสาขาที่เลือกจะติดต่อกลับในเวลาทำการ</p>
        </div>
      </section>
      <main className="container">
        <section className="section" style={{ paddingTop: 20 }}>
          <div className="grid-2" style={{ alignItems: 'start', gap: 20 }}>
            {/* โปสเตอร์แคมเปญ — เปลี่ยนไฟล์ที่ public/campaign/ แล้วแก้ src/alt ตรงนี้ */}
            <div className="card" style={{ overflow: 'hidden', lineHeight: 0 }}>
              <Image
                src="/campaign/byd-dmiweek.jpg"
                alt="BYD DM-i WEEK — ดีลพิเศษที่สุดในรอบปี BYD Seal 5 DM-i และ Sealion 5 DM-i 3 วันเท่านั้น 18–20 ก.ย. 69 รับสิทธิ์ Trade-in ส่วนลด 100,000 บาท"
                width={1200}
                height={1500}
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
