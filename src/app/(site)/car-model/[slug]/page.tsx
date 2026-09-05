import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import Icon from '@/components/Icons'
import CarImage, { mediaOf } from '@/components/CarImage'
import PaymentCalculator from '@/components/PaymentCalculator'
import { BranchRow, Faq } from '@/components/Cards'
import { ModelCard } from '@/components/ModelGrid'
import Jsonld, { carLd, faqLd } from '@/components/Jsonld'
import { getSiteData, getModelBySlug } from '@/lib/data'
import { baht } from '@/lib/format'
import { monthlyPayment } from '@/lib/finance'
import type { Media } from '@/lib/types'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const m = await getModelBySlug(slug)
  if (!m) return { title: 'ไม่พบรุ่นรถที่ค้นหา' }
  return {
    title: `BYD ${m.name} ราคา สเปก และตารางผ่อน`,
    description: `BYD ${m.name} ${m.tagline} ราคาเริ่มต้น ${baht(m.priceFrom)} บาท${m.rangeKm ? ` วิ่งได้ ${m.rangeKm} กม. ต่อการชาร์จ` : ''} ดูสเปกเต็ม คำนวณค่างวด และนัดทดลองขับฟรีที่สาขาใกล้บ้าน`,
    alternates: { canonical: `/car-model/${m.slug}` },
  }
}

const SWATCHES = ['#E8E9EC', '#2B2D31', '#8A96A8', '#4A6B8A', '#B8322A', '#5B6B5A']

export default async function ModelPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const [m, site] = await Promise.all([getModelBySlug(slug), getSiteData()])
  if (!m) notFound()
  const { models, branches, settings } = site
  const gallery = (m.gallery || []).map(mediaOf).filter(Boolean) as Media[]
  const { perMonth } = monthlyPayment(m.priceFrom, settings.defaultDownPercent ?? 20, settings.defaultTerm ?? 60, settings.financeRate ?? 0)
  const others = models.filter((x) => x.id !== m.id).slice(0, 4)

  return (
    <>
      <Jsonld data={carLd(m)} />
      {m.faq && m.faq.length > 0 ? <Jsonld data={faqLd(m.faq)} /> : null}

      <section className="model-hero">
        <div className="container model-hero-in">
          <div>
            <p className="kicker">{m.tagline}</p>
            <h1>BYD {m.name}</h1>
            <div className="price-line">
              <small>ราคาเริ่มต้น</small>
              <b>{baht(m.priceFrom)}</b>
              <small>บาท</small>
            </div>
            <p className="small mute">
              หรือผ่อนเริ่มต้นประมาณ <b style={{ color: 'var(--ink)' }}>{baht(perMonth)} บาท/เดือน</b> · ดาวน์ {settings.defaultDownPercent ?? 20}% · {settings.defaultTerm ?? 60} งวด
            </p>
            <div className="cta-pair" style={{ marginTop: 16 }}>
              <Link className="btn btn-red" href={`/test-drive?model=${encodeURIComponent(m.name)}`}>
                <Icon name="wheel" size={20} color="#fff" />นัดทดลองขับ
              </Link>
              {settings.lineUrl ? (
                <a className="btn btn-green" href={settings.lineUrl} target="_blank" rel="noopener noreferrer">
                  <Icon name="chat" size={20} color="#fff" />ถามใน LINE
                </a>
              ) : (
                <Link className="btn btn-outline" href="/contact"><Icon name="chat" size={20} />สอบถาม</Link>
              )}
            </div>
          </div>
          <div className="model-visual" style={{ position: 'relative' }}>
            <CarImage media={m.heroImage} alt={`BYD ${m.name}`} sizes="(max-width: 900px) 100vw, 640px" fallbackWidth={340} priority />
          </div>
          {m.colorsCount ? (
            <div className="colors" style={{ gridColumn: '1 / -1' }}>
              {SWATCHES.slice(0, Math.min(m.colorsCount, 6)).map((c) => <span key={c} style={{ background: c }} />)}
              <span className="small mute" style={{ width: 'auto', height: 'auto', boxShadow: 'none', border: 0, marginLeft: 4 }}>{m.colorsCount} สี</span>
            </div>
          ) : null}
        </div>
      </section>

      <main className="container">
        {(m.specs?.length || m.rangeKm) ? (
          <section className="section">
            <div className="sec-head"><div><h2>สเปกหลัก</h2></div></div>
            <div className="spec-grid">
              {m.rangeKm ? <div className="card spec"><span>ระยะทางต่อการชาร์จ</span><b>{m.rangeKm} กม.</b></div> : null}
              {(m.specs || []).map((s, i) => (
                <div className="card spec" key={i}><span>{s.label}</span><b>{s.value}</b></div>
              ))}
            </div>
          </section>
        ) : null}

        {gallery.length > 0 ? (
          <section className="section">
            <div className="sec-head"><div><h2>รูปเพิ่มเติม</h2></div></div>
            <div className="gallery">
              {gallery.map((g) => (
                <div className="g" key={g.id}>
                  {g.url ? <Image src={g.url} alt={g.alt || `BYD ${m.name}`} fill sizes="(max-width: 900px) 50vw, 400px" style={{ objectFit: 'cover' }} /> : null}
                </div>
              ))}
            </div>
          </section>
        ) : null}

        <section className="section" id="calc">
          <div className="sec-head">
            <div>
              <h2>คำนวณค่างวด {m.name}</h2>
              <p>ปรับเงินดาวน์และจำนวนงวด ดูค่างวดทันที</p>
            </div>
          </div>
          <div className="grid-2" style={{ alignItems: 'start' }}>
            <PaymentCalculator models={models} settings={settings} fixedModel={m} compact />
            <div className="stack">
              <div className="sec-head" style={{ marginBottom: 0 }}><div><h2 style={{ fontSize: 18 }}>ลองขับได้ที่</h2></div></div>
              {branches.map((b) => <BranchRow key={b.id} b={b} />)}
            </div>
          </div>
        </section>

        {m.faq && m.faq.length > 0 ? (
          <section className="section">
            <div className="sec-head"><div><h2>คำถามที่พบบ่อยเกี่ยวกับ {m.name}</h2></div></div>
            <Faq items={m.faq} />
          </section>
        ) : null}

        {others.length > 0 ? (
          <section className="section">
            <div className="sec-head">
              <div><h2>รุ่นอื่นที่น่าสนใจ</h2></div>
              <Link className="sec-link" href="/car-model">ทุกรุ่น <Icon name="chev" size={16} /></Link>
            </div>
            <div className="models">
              {others.map((x) => <ModelCard key={x.id} m={x} />)}
            </div>
          </section>
        ) : null}
      </main>

    </>
  )
}
