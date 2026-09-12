import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import Icon from '@/components/Icons'
import Jsonld, { breadcrumbLd } from '@/components/Jsonld'
import { getDeliveryPhotos, getSiteData } from '@/lib/data'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'ภาพส่งมอบรถ BYD — ลูกค้าจริงจาก BYD Hi-Class EV Car',
  description:
    'ภาพบรรยากาศวันรับมอบรถ BYD ของลูกค้า BYD Hi-Class EV Car ทั้ง 5 สาขาในกรุงเทพฯ ส่งมอบแล้วกว่า 10,000 คัน พร้อมทีมดูแลตั้งแต่วันจองจนถึงหลังการขาย',
  alternates: { canonical: '/delivery' },
}

export default async function DeliveryPage() {
  const [photos, { branches }] = await Promise.all([getDeliveryPhotos(200), getSiteData()])

  return (
    <>
      <Jsonld data={breadcrumbLd([{ name: 'ภาพส่งมอบรถ', path: '/delivery' }])} />

      <section className="page-head">
        <div className="container">
          <p className="kicker">
            <Icon name="check" size={14} sw={3} />
            ลูกค้าจริง ทุกสาขา
          </p>
          <h1>ภาพส่งมอบรถ BYD</h1>
          <p className="lead">
            บรรยากาศวันรับมอบรถของลูกค้า BYD Hi-Class EV Car ทั้ง {branches.length} สาขาในกรุงเทพฯ
            ทุกคันดูแลโดยทีมขายที่อยู่กับลูกค้าตั้งแต่วันจองจนถึงหลังการขาย
          </p>
        </div>
      </section>

      <main className="container">
        <section className="section">
          {photos.length > 0 ? (
            <div className="gallery gallery-sq">
              {photos.map((p, i) => (
                <div className="g" key={p.id}>
                  <Image
                    src={p.url as string}
                    alt={p.alt || 'ลูกค้ารับมอบรถ BYD ที่โชว์รูม BYD Hi-Class EV Car'}
                    fill
                    sizes="(max-width: 900px) 50vw, 300px"
                    style={{ objectFit: 'cover' }}
                    priority={i < 4}
                  />
                </div>
              ))}
            </div>
          ) : (
            <p className="mute">ยังไม่มีภาพส่งมอบในระบบ</p>
          )}
        </section>

        <section className="section">
          <div className="card" style={{ padding: 24, textAlign: 'center' }}>
            <h2>อยากเป็นคันต่อไปไหม</h2>
            <p className="mute" style={{ marginTop: 8 }}>
              นัดทดลองขับฟรีทุกรุ่น เลือกสาขาที่สะดวก ทีมขายโทรยืนยันคิวภายใน 1 ชั่วโมง
            </p>
            <div className="hero-cta" style={{ justifyContent: 'center', marginTop: 16, display: 'flex', flexWrap: 'wrap', gap: 12 }}>
              <Link className="btn btn-red btn-lg" href="/test-drive">
                <Icon name="wheel" size={20} color="#fff" />
                นัดทดลองขับฟรี
              </Link>
              <Link className="btn btn-outline btn-lg" href="/branches">
                <Icon name="pin" size={20} />
                เลือกสาขา
              </Link>
            </div>
          </div>
        </section>
      </main>
    </>
  )
}
