import type { Metadata } from 'next'
import ModelGrid from '@/components/ModelGrid'
import Jsonld, { dealerLd } from '@/components/Jsonld'
import { getSiteData } from '@/lib/data'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'รถยนต์ไฟฟ้า BYD ทุกรุ่น ราคาและสเปก',
  description: 'ดูรถยนต์ไฟฟ้าและไฮบริด BYD ทุกรุ่นที่จำหน่าย พร้อมราคา ระยะทางต่อการชาร์จ และสเปกเต็ม นัดทดลองขับฟรีได้ทุกรุ่น',
  alternates: { canonical: '/car-model' },
}

export default async function CarModelIndex() {
  const { models, branches } = await getSiteData()
  return (
    <>
      <Jsonld data={dealerLd(branches, models.map((m) => m.priceFrom))} />
      <section className="page-head">
        <div className="container">
          <p className="kicker">Car Model</p>
          <h1>รถยนต์ไฟฟ้า BYD ทุกรุ่น</h1>
          <p className="lead">เลือกดูตามประเภทตัวถัง กดเข้าไปดูสเปกเต็มและค่างวดของแต่ละรุ่น นัดทดลองขับฟรีได้ทุกรุ่น</p>
        </div>
      </section>
      <main className="container">
        <section className="section" style={{ paddingTop: 20 }}>
          <ModelGrid models={models} wide />
        </section>
      </main>
    </>
  )
}
