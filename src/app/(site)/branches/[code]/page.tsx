import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import Icon from '@/components/Icons'
import { mediaOf } from '@/components/CarImage'
import { BranchCard } from '@/components/Cards'
import { ModelCard } from '@/components/ModelGrid'
import Jsonld, { SITE, breadcrumbLd } from '@/components/Jsonld'
import { thaiAddressLd, openingHoursLd, priceRangeOf } from '@/lib/localbiz'
import { getSiteData } from '@/lib/data'
import type { Media } from '@/lib/types'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: Promise<{ code: string }> }): Promise<Metadata> {
  const { code } = await params
  const { branches } = await getSiteData()
  const b = branches.find((x) => x.code === code)
  if (!b) return { title: 'ไม่พบสาขา' }
  return {
    title: `BYD Hi-Class ${b.name} — โชว์รูมและศูนย์บริการ BYD`,
    description: `โชว์รูม BYD Hi-Class สาขา${b.name} ${b.address || ''} โทร ${b.phone} เปิด ${b.openHours || 'ทุกวัน'} นัดทดลองขับฟรีทุกรุ่นที่สาขานี้`,
    alternates: { canonical: `/branches/${b.code}` },
  }
}

export default async function BranchPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params
  const { branches, models, settings } = await getSiteData()
  const b = branches.find((x) => x.code === code) as (typeof branches)[number] & { photos?: (Media | number)[] | null; team?: { name: string; role?: string | null; phone?: string | null }[] | null }
  if (!b) notFound()
  const photos = ((b.photos || []) as (Media | number)[]).map(mediaOf).filter(Boolean) as Media[]

  const ld = {
    '@context': 'https://schema.org',
    '@type': 'AutoDealer',
    name: `BYD Hi-Class ${b.name}`,
    telephone: b.phone,
    ...(settings.contactEmail ? { email: settings.contactEmail } : {}),
    url: `${SITE}/branches/${b.code}`,
    // เวลาทำการแบบที่ Google อ่านได้ (แปลงจากข้อความไทยในหลังบ้าน) + ข้อความเดิมไว้ให้คนอ่าน
    ...(openingHoursLd(b.openHours) ? { openingHoursSpecification: openingHoursLd(b.openHours) } : {}),
    ...(b.openHours ? { openingHours: b.openHours } : {}),
    ...(thaiAddressLd(b.address) ? { address: thaiAddressLd(b.address) } : {}),
    // Google ขอรูปกับช่วงราคากับธุรกิจที่มีหน้าร้าน — ไม่มีรูปสาขาก็ใช้รูปรถที่สาขานี้มีให้ลองขับ
    image: photos[0]?.url || mediaOf(models[0]?.heroImage)?.url || `${SITE}/opengraph-image.png`,
    priceRange: priceRangeOf(models.map((x) => x.priceFrom)),
    ...(b.mapUrl ? { hasMap: b.mapUrl } : {}),
    // เพจโซเชียลของสาขา — ช่วยให้ Google ผูกโชว์รูมกับเพจจริงได้
    ...(() => {
      const same = [b.facebookUrl, b.instagramUrl, b.tiktokUrl, b.youtubeUrl, b.lineUrl].filter(Boolean)
      return same.length ? { sameAs: same } : {}
    })(),
    brand: { '@type': 'Brand', name: 'BYD' },
  }

  return (
    <>
      <Jsonld data={ld} />
      <Jsonld data={breadcrumbLd([{ name: 'สาขาของเรา', path: '/branches' }, { name: `BYD Hi-Class ${b.name}`, path: `/branches/${b.code}` }])} />
      <section className="page-head">
        <div className="container">
          <p className="kicker"><Icon name="pin" size={14} />สาขา{b.name}{b.nameEn ? ` · ${b.nameEn}` : ''}</p>
          <h1>BYD Hi-Class {b.name}</h1>
          {b.intro ? <p className="lead">{b.intro}</p> : null}
        </div>
      </section>
      <main className="container">
        <section className="section" style={{ paddingTop: 20 }}>
          <div className="grid-2" style={{ alignItems: 'start' }}>
            <BranchCard b={b} lineUrl={settings.lineUrl} />
            {photos.length > 0 ? (
              <div className="gallery" style={{ gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' }}>
                {photos.map((p) => (
                  <div className="g" key={p.id}>
                    {p.url ? <Image src={p.url} alt={p.alt || `โชว์รูม BYD Hi-Class ${b.name}`} fill sizes="(max-width: 900px) 50vw, 300px" style={{ objectFit: 'cover' }} /> : null}
                  </div>
                ))}
              </div>
            ) : (
              <div className="card" style={{ padding: 20 }}>
                <h3 style={{ fontSize: 17 }}>เวลาทำการ</h3>
                <p className="mute" style={{ marginTop: 6 }}>{b.openHours || 'เปิดทุกวัน'}</p>
                {b.address ? <><h3 style={{ fontSize: 17, marginTop: 16 }}>ที่อยู่</h3><p className="mute" style={{ marginTop: 6, whiteSpace: 'pre-line' }}>{b.address}</p></> : null}
              </div>
            )}
          </div>
        </section>

        {b.team && b.team.length > 0 ? (
          <section className="section">
            <div className="sec-head"><div><h2>ทีมขายประจำสาขา</h2></div></div>
            <div className="grid-3">
              {b.team.map((t, i) => (
                <div className="card svc" key={i}>
                  <h3>{t.name}</h3>
                  {t.role ? <p>{t.role}</p> : null}
                  {t.phone ? <a className="more" href={`tel:${t.phone.replace(/[^0-9+]/g, '')}`}><Icon name="phone" size={14} />{t.phone}</a> : null}
                </div>
              ))}
            </div>
          </section>
        ) : null}

        <section className="section">
          <div className="sec-head">
            <div><h2>รุ่นที่ทดลองขับได้ที่สาขานี้</h2></div>
            <Link className="sec-link" href="/car-model">ทุกรุ่น <Icon name="chev" size={16} /></Link>
          </div>
          <div className="models">
            {models.slice(0, 4).map((m) => <ModelCard key={m.id} m={m} />)}
          </div>
        </section>
      </main>
    </>
  )
}
