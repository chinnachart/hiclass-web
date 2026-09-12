import type { Metadata } from 'next'
import { BranchCard } from '@/components/Cards'
import Jsonld, { dealerLd } from '@/components/Jsonld'
import { getSiteData } from '@/lib/data'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'สาขา BYD Hi-Class ทั้ง 5 สาขาในกรุงเทพฯ',
  description: 'เลือกสาขา BYD Hi-Class ที่ใกล้บ้าน รัชดา ลาดพร้าว พระราม 5 บองมาร์เช่ กาญจนาภิเษก โทร แอด LINE นำทาง หรือนัดทดลองขับที่สาขานั้นได้ทันที',
  alternates: { canonical: '/branches' },
}

export default async function BranchesPage() {
  const { branches, models, settings } = await getSiteData()
  return (
    <>
      <Jsonld data={dealerLd(branches, models.map((m) => m.priceFrom))} />
      <section className="page-head">
        <div className="container">
          <p className="kicker">สาขาของเรา</p>
          <h1>เลือกสาขาที่ใกล้คุณ</h1>
          <p className="lead">โทร แอด LINE หรือกดนำทางไปสาขาได้ทันที และนัดทดลองขับที่สาขานั้นได้ในปุ่มเดียว</p>
        </div>
      </section>
      <main className="container">
        <section className="section" style={{ paddingTop: 20 }}>
          <div className="branch-list">
            {branches.map((b) => <BranchCard key={b.id} b={b} lineUrl={settings.lineUrl} />)}
          </div>
        </section>
      </main>
    </>
  )
}
