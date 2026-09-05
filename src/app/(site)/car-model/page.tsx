import type { Metadata } from 'next'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import ModelGrid from '@/components/ModelGrid'
import Jsonld, { dealerLd } from '@/components/Jsonld'
import { getSiteData } from '@/lib/data'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'รถยนต์ไฟฟ้า BYD ทุกรุ่น ราคาและสเปก',
  description:
    'ดูรถยนต์ไฟฟ้าและไฮบริด BYD ทุกรุ่นที่จำหน่าย พร้อมราคา ระยะทางต่อการชาร์จ และสเปกเต็ม นัดทดลองขับฟรีได้ทุกรุ่น',
  alternates: { canonical: '/car-model' },
}

export default async function CarModelIndex() {
  const { models, branches, settings } = await getSiteData()
  return (
    <>
      <Jsonld data={dealerLd(branches)} />
      <Header models={models} branches={branches} phone={settings.mainPhone} />
      <main className="shell">
        <section className="pagehead">
          <p className="kicker">Car Model</p>
          <h1 className="pagetitle">รถยนต์ไฟฟ้า BYD ทุกรุ่น</h1>
          <p className="pagelede">
            เลือกดูตามประเภทตัวถัง กดเข้าไปดูสเปกเต็มและค่างวดของแต่ละรุ่นได้
          </p>
          <ModelGrid models={models} />
        </section>
      </main>
      <Footer models={models} branches={branches} settings={settings} />
    </>
  )
}
