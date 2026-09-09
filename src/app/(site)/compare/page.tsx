import type { Metadata } from 'next'
import CompareTool from '@/components/CompareTool'
import { getSiteData } from '@/lib/data'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'เปรียบเทียบรถ BYD ทุกรุ่น ราคา ระยะทาง สเปก',
  description: 'เลือก 2–3 รุ่น BYD มาเทียบกัน ราคาเริ่มต้น ค่างวดต่อเดือน ระยะทางต่อการชาร์จ จำนวนสี และสเปกหลัก เพื่อเลือกรุ่นที่เหมาะกับคุณ',
  alternates: { canonical: '/compare' },
}

export default async function ComparePage({ searchParams }: { searchParams: Promise<{ m?: string }> }) {
  const sp = await searchParams
  const { models, settings } = await getSiteData()
  const initial = (sp.m || '').split(',').filter(Boolean)
  return (
    <>
      <section className="page-head">
        <div className="container">
          <p className="kicker">เปรียบเทียบรุ่น</p>
          <h1>BYD รุ่นไหนเหมาะกับคุณ</h1>
          <p className="lead">เลือกได้สูงสุด 3 รุ่น เห็นราคา ค่างวด ระยะทาง และสเปกเคียงกัน แชร์ลิงก์ผลเปรียบเทียบให้คนที่บ้านดูได้</p>
        </div>
      </section>
      <main className="container">
        <section className="section" style={{ paddingTop: 20 }}>
          <CompareTool models={models} settings={settings} initialSlugs={initial} />
        </section>
      </main>
    </>
  )
}
