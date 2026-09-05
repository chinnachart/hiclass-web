import type { Metadata } from 'next'
import Icon from '@/components/Icons'
import TestDriveForm from '@/components/TestDriveForm'
import { getSiteData } from '@/lib/data'
import { baht } from '@/lib/format'

export const metadata: Metadata = {
  title: 'นัดทดลองขับ BYD ฟรี ทุกรุ่น',
  description: 'เลือกรุ่น เลือกสาขา และวันเวลาที่สะดวก ทีมขายยืนยันกลับภายใน 1 ชั่วโมงในเวลาทำการ',
  alternates: { canonical: '/test-drive' },
}

export const dynamic = 'force-dynamic'

export default async function TestDrivePage({
  searchParams,
}: {
  searchParams: Promise<{ model?: string; branch?: string; down?: string; term?: string; monthly?: string }>
}) {
  const sp = await searchParams
  const { models, branches, settings } = await getSiteData()
  const offerNote =
    sp.monthly && sp.term
      ? `จากเครื่องคำนวณ: ดาวน์ ${sp.down}% · ${sp.term} งวด · ประมาณ ${baht(Number(sp.monthly))} บาท/เดือน`
      : ''

  return (
    <>
      <section className="page-head">
        <div className="container">
          <p className="kicker"><Icon name="wheel" size={14} />ทดลองขับฟรี ทุกรุ่น</p>
          <h1>นัดลองขับฟรี ใช้เวลา 1 นาที</h1>
          <p className="lead">ทีมขายสาขาที่เลือกจะโทรยืนยันวันเวลาให้ภายใน 1 ชั่วโมง (เวลาทำการ) ไม่มีค่าใช้จ่าย ไม่มีข้อผูกมัด</p>
        </div>
      </section>
      <main className="container">
        <section className="section" style={{ paddingTop: 20 }}>
          <div className="grid-2" style={{ alignItems: 'start', gridTemplateColumns: 'minmax(0, 1fr)' }}>
            <div className="card" style={{ padding: 20, maxWidth: 640 }}>
              <TestDriveForm models={models} branches={branches} settings={settings} defaultModel={sp.model} defaultBranch={sp.branch} offerNote={offerNote} />
            </div>
          </div>
        </section>
      </main>
    </>
  )
}
