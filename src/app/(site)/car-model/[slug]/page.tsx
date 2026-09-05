import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import PaymentCalculator from '@/components/PaymentCalculator'
import Jsonld, { carLd, faqLd } from '@/components/Jsonld'
import { getSiteData, getModelBySlug } from '@/lib/data'
import { baht, telHref } from '@/lib/format'
import { monthlyPayment } from '@/lib/finance'
import type { Media } from '@/lib/types'

export const dynamic = 'force-dynamic'

const img = (v: unknown): Media | null => (v && typeof v === 'object' ? (v as Media) : null)

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const m = await getModelBySlug(slug)
  if (!m) return { title: 'ไม่พบรุ่นรถที่ค้นหา' }
  return {
    title: `BYD ${m.name} ราคา สเปก และตารางผ่อน`,
    description: `BYD ${m.name} ${m.tagline} ราคาเริ่มต้น ${baht(m.priceFrom)} บาท${
      m.rangeKm ? ` วิ่งได้ ${m.rangeKm} กม. ต่อการชาร์จ` : ''
    } ดูสเปกเต็ม คำนวณค่างวด และนัดทดลองขับฟรีที่สาขาใกล้บ้าน`,
    alternates: { canonical: `/car-model/${m.slug}` },
  }
}

export default async function ModelPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const [m, site] = await Promise.all([getModelBySlug(slug), getSiteData()])
  if (!m) notFound()

  const { models, branches, settings } = site
  const hero = img(m.heroImage)
  const gallery = (m.gallery || []).map(img).filter(Boolean) as Media[]
  const term = settings.defaultTerm ?? 60
  const downPct = settings.defaultDownPercent ?? 20
  const { perMonth } = monthlyPayment(m.priceFrom, downPct, term, settings.financeRate ?? 0)

  return (
    <>
      <Jsonld data={carLd(m)} />
      {m.faq && m.faq.length > 0 ? <Jsonld data={faqLd(m.faq)} /> : null}
      <Header models={models} branches={branches} phone={settings.mainPhone} />

      <main className="shell">
        <section className="pagehead">
          <nav className="crumb">
            <Link href="/car-model">รุ่นรถทั้งหมด</Link> <span>/</span> <span>BYD {m.name}</span>
          </nav>

          <div className="model-hero">
            <div className="mh-stage">
              {hero?.url ? (
                <Image
                  src={hero.url}
                  alt={hero.alt || `BYD ${m.name}`}
                  fill priority
                  sizes="(max-width: 900px) 100vw, 620px"
                  style={{ objectFit: 'contain', objectPosition: 'center 65%' }}
                />
              ) : (
                <span className="ph">ยังไม่ได้ใส่รูปของรุ่นนี้</span>
              )}
            </div>

            <div className="mh-info">
              <p className="kicker">{m.tagline}</p>
              <h1 className="pagetitle">BYD {m.name}</h1>

              <div className="keyfacts">
                <div><b>{baht(m.priceFrom)}</b><span>ราคาเริ่มต้น (บาท)</span></div>
                {m.rangeKm ? <div><b>{m.rangeKm}</b><span>กม. ต่อการชาร์จ</span></div> : null}
                <div><b>{baht(perMonth)}</b><span>ผ่อน/เดือน · ดาวน์ {downPct}% · {term} งวด</span></div>
              </div>

              <div className="cta-row">
                <Link className="btn" href={`/test-drive?model=${encodeURIComponent(m.name)}`}>
                  นัดทดลองขับรุ่นนี้
                </Link>
                <a className="btn ghost" href={telHref(settings.mainPhone)}>โทรสอบถาม</a>
              </div>
              <p className="fineprint-block">{settings.financeNote}</p>
            </div>
          </div>
        </section>

        {m.specs && m.specs.length > 0 ? (
          <section>
            <div className="sec-head"><div><h2>สเปก BYD {m.name}</h2></div></div>
            <div className="scroller">
              <table className="spec">
                <tbody>
                  {m.specs.map((s) => (
                    <tr key={s.label}><th>{s.label}</th><td>{s.value}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ) : null}

        {gallery.length > 0 ? (
          <section>
            <div className="sec-head"><div><h2>ภาพ BYD {m.name}</h2></div></div>
            <div className="gallery">
              {gallery.map((g) => (
                <div className="gitem" key={g.id}>
                  <Image
                    src={g.url || ''} alt={g.alt || `BYD ${m.name}`}
                    fill sizes="(max-width: 700px) 100vw, 380px"
                    style={{ objectFit: 'cover' }}
                  />
                </div>
              ))}
            </div>
          </section>
        ) : null}

        <section>
          <div className="sec-head">
            <div>
              <h2>คำนวณค่างวด BYD {m.name}</h2>
              <p>ปรับเงินดาวน์และจำนวนงวดเพื่อดูค่าผ่อนที่เหมาะกับคุณ</p>
            </div>
            <Link className="sec-link" href="/price">เทียบราคาทุกรุ่น →</Link>
          </div>
          <div className="calc-wrap">
            <PaymentCalculator models={[m, ...models.filter((x) => x.id !== m.id)]} settings={settings} />
          </div>
        </section>

        {m.faq && m.faq.length > 0 ? (
          <section>
            <div className="sec-head"><div><h2>คำถามที่ถามบ่อยเกี่ยวกับ BYD {m.name}</h2></div></div>
            <div className="faq">
              {m.faq.map((f) => (
                <details key={f.question}>
                  <summary>{f.question}</summary>
                  <p>{f.answer}</p>
                </details>
              ))}
            </div>
          </section>
        ) : null}

        <section>
          <div className="sec-head">
            <div>
              <h2>ลองขับ BYD {m.name} ได้ที่สาขาใกล้บ้าน</h2>
              <p>โทรหาสาขาโดยตรงเพื่อเช็คว่ามีรุ่นนี้ให้ลองขับวันไหน</p>
            </div>
          </div>
          <div className="branches">
            {branches.map((b) => (
              <div className="br" key={b.id}>
                <h3>{b.name}</h3>
                <p className="area">{b.nameEn}</p>
                <a className="ph-num" href={telHref(b.phone)}>{b.phone}</a>
                <span className="open">{b.openHours}</span>
                <div className="acts">
                  <Link href={`/test-drive?model=${encodeURIComponent(m.name)}`}>นัดลองขับ</Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <Footer models={models} branches={branches} settings={settings} />
    </>
  )
}
