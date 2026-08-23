import type { Metadata } from 'next'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import TestDriveForm from '@/components/TestDriveForm'
import { getSiteData } from '@/lib/data'
import { baht } from '@/lib/format'

export const metadata: Metadata = {
  title: 'นัดทดลองขับ BYD ฟรี ทุกรุ่น',
  description: 'เลือกรุ่น เลือกสาขา และวันเวลาที่สะดวก ทีมขายยืนยันกลับภายใน 1 ชั่วโมงในเวลาทำการ',
}

export const revalidate = 300

export default async function TestDrivePage({
  searchParams,
}: {
  searchParams: Promise<{ model?: string; down?: string; term?: string; monthly?: string }>
}) {
  const sp = await searchParams
  const { models, branches, settings } = await getSiteData()

  const offerNote =
    sp.monthly && sp.term
      ? `จากเครื่องคำนวณ: ดาวน์ ${sp.down}% · ${sp.term} งวด · ประมาณ ${baht(Number(sp.monthly))} บาท/เดือน`
      : ''

  return (
    <>
      <Header models={models} branches={branches} phone={settings.mainPhone} />
      <main className="shell" style={{ paddingTop: 56 }}>
        <section id="testdrive" style={{ borderTop: 'none', paddingTop: 0 }}>
          <div className="td">
            <div className="td-copy">
              <h2>สนใจทดลองขับ<br />ใช้เวลากรอก 40 วินาที</h2>
              <p>ฟอร์มนี้ส่งเข้าระบบที่ทีมขายใช้จริงทันที ไม่ได้ค้างอยู่ในเว็บ</p>
              <ul className="tick">
                <li><i>→</i> เซลส์สาขาที่คุณเลือกได้รับแจ้งทันที</li>
                <li><i>→</i> ยืนยันวันเวลากลับภายใน 1 ชั่วโมงในเวลาทำการ</li>
                <li><i>→</i> เตรียมรถรุ่นและสีที่คุณเลือกไว้ให้ก่อนถึง</li>
                <li><i>→</i> ไม่มีค่าใช้จ่าย ไม่ผูกมัด</li>
              </ul>
              {offerNote ? (
                <p style={{ color: 'var(--lime)', fontSize: 14, marginTop: 4 }}>{offerNote}</p>
              ) : null}
            </div>
            <TestDriveForm
              models={models}
              branches={branches}
              defaultModel={sp.model}
              offerNote={offerNote}
            />
          </div>
        </section>
      </main>
      <Footer models={models} branches={branches} settings={settings} />
    </>
  )
}
