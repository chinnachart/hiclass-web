import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import Icon from '@/components/Icons'
import CarImage, { mediaOf } from '@/components/CarImage'
import PaymentCalculator from '@/components/PaymentCalculator'
import TestDriveForm from '@/components/TestDriveForm'
import { BranchRow, Faq } from '@/components/Cards'
import { ModelCard } from '@/components/ModelGrid'
import Jsonld, { carLd, faqLd, breadcrumbLd } from '@/components/Jsonld'
import { getSiteData, getModelBySlug, getNewsList, getReviews } from '@/lib/data'
import { newsForModel, newsMentionsModel } from '@/lib/newsLinks'
import { NewsCard } from '@/components/Cards'
import { ReviewGrid } from '@/components/Reviews'
import { baht, rangeLabel } from '@/lib/format'
import { financeTable } from '@/lib/finance'
import { modelTitle, modelDescription, defaultFaq, colorList, seoYear } from '@/lib/seoModel'
import type { Media, NewsItem } from '@/lib/types'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const [m, site] = await Promise.all([getModelBySlug(slug), getSiteData()])
  if (!m) return { title: 'ไม่พบรุ่นรถที่ค้นหา' }
  // zip #39 — title/description ตอบคำที่คนค้นจริง (ราคา ตารางผ่อน สเปค สี) + ปี → CTR
  const ft = financeTable(site.settings)
  const { perMonth } = ft.pay(m.priceFrom, ft.defaultDown, ft.defaultTerm)
  const title = modelTitle(m)
  const description = modelDescription(m, perMonth)
  const img = mediaOf(m.heroImage)?.url
  return {
    title,
    description,
    alternates: { canonical: `/car-model/${m.slug}` },
    openGraph: { title, description, type: 'website', ...(img ? { images: [img] } : {}) },
  }
}

export default async function ModelPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const [m, site, allNews, allReviews] = await Promise.all([getModelBySlug(slug), getSiteData(), getNewsList(60), getReviews(80).catch(() => [])])
  if (!m) notFound()
  const { models, branches, settings } = site
  // zip #40 — บทความที่พูดถึงรุ่นนี้ (ลิงก์ภายในให้ Google ตามไป index บทความ)
  const articles = newsForModel(allNews as unknown as NewsItem[], m)
  // zip #40 — รีวิวลูกค้าที่ออกรุ่นนี้ก่อน ไม่พอค่อยเติมรีวิวล่าสุด (หน้ารุ่นเดิมไม่มีรีวิวเลย ทั้งที่มีรีวิว Google 700+)
  const ownReviews = allReviews.filter((r) => r.model && newsMentionsModel({ slug: '', title: r.model }, m))
  const reviews = [...ownReviews, ...allReviews.filter((r) => !ownReviews.includes(r))].slice(0, 3)
  const gallery = (m.gallery || []).map(mediaOf).filter(Boolean) as Media[]
  const ft = financeTable(settings)
  const { perMonth } = ft.pay(m.priceFrom, ft.defaultDown, ft.defaultTerm)
  const others = models.filter((x) => x.id !== m.id).slice(0, 4)
  const year = seoYear()
  const colors = colorList(m)
  // zip #39 — FAQ: ของหลังบ้านมาก่อน ไม่มีค่อยใช้ชุดสำรอง (ทั้งบนหน้าและใน schema)
  const faq = m.faq && m.faq.length > 0 ? m.faq : defaultFaq({ m, branches, perMonth, defaultDown: ft.defaultDown, defaultTerm: ft.defaultTerm, year })
  // ตารางผ่อนย่อ 3 ดาวน์ × งวดเริ่มต้น — คนค้น "ตารางผ่อน <รุ่น>" ต้องเห็นตัวเลขทันทีไม่ต้องกดต่อ
  const miniDowns = Array.from(new Set([ft.downs[ft.downs.length - 1], ft.defaultDown, ft.downs[0]])).filter((d) => typeof d === 'number').sort((a, b) => a - b)
  const priceRows = (m.variants && m.variants.length > 0 ? m.variants : [{ name: m.name, price: m.priceFrom, note: null }]).filter((v) => v.price > 0)
  const compareWith = models.filter((x) => x.id !== m.id && x.bodyType === m.bodyType).slice(0, 2)

  return (
    <>
      <Jsonld data={carLd({ ...m, imageUrl: mediaOf(m.heroImage)?.url })} />
      <Jsonld data={breadcrumbLd([{ name: 'รุ่นรถ', path: '/car-model' }, { name: `BYD ${m.name}`, path: `/car-model/${m.slug}` }])} />
      {faq.length > 0 ? <Jsonld data={faqLd(faq)} /> : null}

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
              หรือผ่อนเริ่มต้นประมาณ <b style={{ color: 'var(--ink)' }}>{baht(perMonth)} บาท/เดือน</b> · ดาวน์ {ft.defaultDown}% · {ft.defaultTerm} งวด ·{' '}
              <Link href={`/price/${m.slug}`} style={{ color: 'var(--red)', fontWeight: 600 }}>ดูตารางผ่อนเต็ม</Link>
            </p>
            {m.variants && m.variants.length > 0 ? (
              <div className="stack" style={{ gap: 6, marginTop: 12 }}>
                {m.variants.map((v) => (
                  <div key={v.name} style={{ display: 'flex', justifyContent: 'space-between', gap: 10, padding: '8px 12px', border: '1px solid var(--line)', borderRadius: 10, background: 'var(--paper)', fontSize: 14 }}>
                    <span><b>{v.name}</b>{v.note ? <span className="mute"> · {v.note}</span> : null}</span>
                    <b className="display">{baht(v.price)} ฿</b>
                  </div>
                ))}
              </div>
            ) : null}
            <div className="cta-pair" style={{ marginTop: 16 }}>
              <a className="btn btn-red" href="#test-drive">
                <Icon name="wheel" size={20} color="#fff" />นัดทดลองขับ
              </a>
              {settings.lineUrl ? (
                <a className="btn btn-green" href={settings.lineUrl} target="_blank" rel="noopener noreferrer">
                  <Icon name="chat" size={20} color="#fff" />สอบถามทาง LINE
                </a>
              ) : (
                <Link className="btn btn-outline" href="/contact"><Icon name="chat" size={20} />สอบถาม</Link>
              )}
            </div>
          </div>
          <div className="model-visual" style={{ position: 'relative' }}>
            <CarImage media={m.heroImage} alt={`BYD ${m.name}`} sizes="(max-width: 900px) 100vw, 640px" fallbackWidth={340} priority />
          </div>
          {colors.length > 0 ? (
            <div className="colors" style={{ gridColumn: '1 / -1' }} aria-label={`สี BYD ${m.name}`}>
              {colors.slice(0, 8).map((c) => <span key={c.name} title={c.name} style={{ background: c.hex }} />)}
              <span className="small mute" style={{ width: 'auto', height: 'auto', boxShadow: 'none', border: 0, marginLeft: 4 }}>{colors.length} สี · <a href="#colors" style={{ color: 'inherit' }}>ดูชื่อสี</a></span>
            </div>
          ) : m.colorsCount ? (
            <div className="colors" style={{ gridColumn: '1 / -1' }}>
              {['#E8E9EC', '#2B2D31', '#8A96A8', '#4A6B8A', '#B8322A', '#5B6B5A'].slice(0, Math.min(m.colorsCount, 6)).map((c) => <span key={c} style={{ background: c }} />)}
              <span className="small mute" style={{ width: 'auto', height: 'auto', boxShadow: 'none', border: 0, marginLeft: 4 }}>{m.colorsCount} สี</span>
            </div>
          ) : null}
        </div>
      </section>

      <main className="container">
        {/* ฟอร์มสั้นในหน้ารุ่น — คนจากแอดส่วนใหญ่ลงหน้านี้ ไม่ต้องเปลี่ยนหน้าไป /test-drive */}
        <section className="section" id="test-drive" style={{ scrollMarginTop: 80 }}>
          <div className="card" style={{ padding: 20, maxWidth: 640 }}>
            <h2 style={{ fontSize: 22, marginBottom: 4 }}>นัดทดลองขับ {m.name} ฟรี</h2>
            <p className="small mute" style={{ marginBottom: 14 }}>กรอกแค่ชื่อกับเบอร์ ทีมขายโทรยืนยันภายใน 1 ชั่วโมง (เวลาทำการ) ไม่มีข้อผูกมัด</p>
            <TestDriveForm models={models} branches={branches} settings={settings} defaultModel={m.name} compact />
          </div>
        </section>

        {/* zip #39 — ราคา + ตารางผ่อนย่อ ตอบคำค้น "<รุ่น> ราคา / ตารางผ่อน / ดาวน์" ในหน้าเดียว */}
        <section className="section" id="price">
          <div className="sec-head">
            <div>
              <h2>ราคา BYD {m.name} {year}</h2>
              <p>ราคาตามแคมเปญ BYD ประเทศไทย อัปเดตโดยทีม Hi-Class · ผ่อน {ft.defaultTerm} งวด ดอกเบี้ย {ft.rate(ft.defaultDown, ft.defaultTerm)}%</p>
            </div>
            <Link className="sec-link" href={`/price/${m.slug}`}>ตารางผ่อนเต็ม <Icon name="chev" size={16} /></Link>
          </div>
          <div className="card" style={{ overflowX: 'auto' }}>
            <table className="price-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', padding: '10px 12px' }}>รุ่นย่อย</th>
                  <th style={{ textAlign: 'right', padding: '10px 12px' }}>ราคา (บาท)</th>
                  {miniDowns.map((d) => (
                    <th key={d} style={{ textAlign: 'right', padding: '10px 12px', whiteSpace: 'nowrap' }}>ดาวน์ {d}%<br /><span className="small mute" style={{ fontWeight: 400 }}>บาท/เดือน</span></th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {priceRows.map((v) => (
                  <tr key={v.name} style={{ borderTop: '1px solid var(--line)' }}>
                    <td style={{ padding: '10px 12px' }}><b>{v.name}</b>{v.note ? <span className="small mute"> · {v.note}</span> : null}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right' }}><b className="display">{baht(v.price)}</b></td>
                    {miniDowns.map((d) => (
                      <td key={d} style={{ padding: '10px 12px', textAlign: 'right' }}>{baht(ft.pay(v.price, d, ft.defaultTerm).perMonth)}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="small mute" style={{ marginTop: 8 }}>ค่างวดเป็นค่าประมาณจากดอกเบี้ยคงที่ ยังไม่รวมประกันและค่าธรรมเนียม เงื่อนไขจริงขึ้นกับไฟแนนซ์และแคมเปญในวันจอง</p>
        </section>

        {colors.length > 0 ? (
          <section className="section" id="colors" style={{ scrollMarginTop: 80 }}>
            <div className="sec-head"><div><h2>สี BYD {m.name} ทั้ง {colors.length} สี</h2><p>สีที่มีในสต็อกต่างกันแต่ละสาขา ถามทีมขายก่อนจองได้</p></div></div>
            <div className="spec-grid">
              {(m.colors || []).map((c, i) => {
                const img = mediaOf(c.image)
                return (
                  <div className="card spec" key={c.name} style={{ alignItems: 'center' }}>
                    {img?.url ? (
                      <span style={{ position: 'relative', width: '100%', aspectRatio: '16/9', display: 'block', marginBottom: 6 }}>
                        <Image src={img.url} alt={`BYD ${m.name} สี${c.name}`} fill sizes="(max-width: 900px) 50vw, 300px" style={{ objectFit: 'contain' }} />
                      </span>
                    ) : (
                      <span style={{ width: 36, height: 36, borderRadius: '50%', background: colors[i]?.hex, border: '1px solid var(--line)', display: 'block', marginBottom: 6 }} />
                    )}
                    <b style={{ fontSize: 14 }}>{c.name}</b>
                  </div>
                )
              })}
            </div>
          </section>
        ) : null}

        {(m.specs?.length || m.rangeKm) ? (
          <section className="section">
            <div className="sec-head"><div><h2>สเปค BYD {m.name}</h2></div></div>
            <div className="spec-grid">
              {m.rangeKm ? <div className="card spec"><span>{rangeLabel(m)}</span><b>{m.rangeKm} กม.</b></div> : null}
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

        {faq.length > 0 ? (
          <section className="section" id="faq">
            <div className="sec-head"><div><h2>คำถามที่พบบ่อยเกี่ยวกับ BYD {m.name}</h2></div></div>
            <Faq items={faq} />
          </section>
        ) : null}

        {compareWith.length > 0 ? (
          <section className="section" style={{ paddingTop: 0 }}>
            <div className="card" style={{ padding: 16, display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
              <b>ยังลังเล?</b>
              {compareWith.map((x) => (
                <Link key={x.id} className="btn btn-outline" href={`/compare?m=${m.slug},${x.slug}`}>เทียบ {m.name} กับ {x.name}</Link>
              ))}
            </div>
          </section>
        ) : null}

        {reviews.length > 0 ? (
          <section className="section" id="reviews">
            <div className="sec-head">
              <div>
                <h2>รีวิวจากลูกค้า{ownReviews.length > 0 ? ` BYD ${m.name}` : ''}</h2>
                {settings.googleRating ? <p>คะแนนรีวิวบน Google {settings.googleRating.toFixed(1)} ★{settings.trustNote ? ` · ${settings.trustNote}` : ''}</p> : null}
              </div>
              <Link className="sec-link" href="/reviews">รีวิวทั้งหมด <Icon name="chev" size={16} /></Link>
            </div>
            <ReviewGrid reviews={reviews} />
          </section>
        ) : null}

        {articles.length > 0 ? (
          <section className="section" id="articles">
            <div className="sec-head">
              <div><h2>บทความเกี่ยวกับ BYD {m.name}</h2></div>
              <Link className="sec-link" href="/news">บทความทั้งหมด <Icon name="chev" size={16} /></Link>
            </div>
            <div className="grid-3">
              {articles.map((n) => <NewsCard key={n.id} n={n} />)}
            </div>
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
