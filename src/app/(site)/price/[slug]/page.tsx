import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import Icon from '@/components/Icons'
import CarImage from '@/components/CarImage'
import PaymentCalculator from '@/components/PaymentCalculator'
import { BranchRow, Faq } from '@/components/Cards'
import Jsonld, { carLd, faqLd, breadcrumbLd } from '@/components/Jsonld'
import { getSiteData, getModelBySlug } from '@/lib/data'
import { baht } from '@/lib/format'
import { financeTable, rateRangeText, TERMS } from '@/lib/finance'

export const dynamic = 'force-dynamic'

const YEAR = new Date().getFullYear() + 543 // พ.ศ.
const YEAR_EN = new Date().getFullYear()

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const m = await getModelBySlug(slug)
  if (!m) return { title: 'ไม่พบรุ่นรถ' }
  const { settings } = await getSiteData()
  const ft = financeTable(settings)
  const { perMonth } = ft.pay(m.priceFrom, ft.defaultDown, ft.defaultTerm)
  const downs = [...ft.downs].sort((a, b) => a - b)
  return {
    title: `ตารางผ่อน BYD ${m.name} ${YEAR_EN} ราคา ดาวน์ ค่างวดต่อเดือน`,
    description: `ตารางผ่อน BYD ${m.name} ${YEAR_EN} ราคาเริ่มต้น ${baht(m.priceFrom)} บาท ผ่อนเริ่มต้นประมาณ ${baht(perMonth)} บาท/เดือน ดูค่างวดทุกเงินดาวน์ ${downs[0]}–${downs[downs.length - 1]}% และทุกจำนวนงวด พร้อมนัดทดลองขับฟรีที่ 5 สาขาในกรุงเทพฯ`,
    alternates: { canonical: `/price/${m.slug}` },
  }
}

export default async function ModelPricePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const [m, site] = await Promise.all([getModelBySlug(slug), getSiteData()])
  if (!m) notFound()
  const { models, branches, settings } = site
  const ft = financeTable(settings)
  const rateTxt = rateRangeText(ft)
  const minDown = Math.min(...ft.downs)
  const variants = m.variants && m.variants.length > 0 ? m.variants : [{ name: m.name, price: m.priceFrom, note: null }]
  const cheapest = variants.reduce((a, b) => (a.price < b.price ? a : b), variants[0])
  const others = models.filter((x) => x.id !== m.id)

  const faq = [
    {
      question: `BYD ${m.name} ผ่อนเดือนละเท่าไหร่`,
      answer: `ที่ราคาเริ่มต้น ${baht(m.priceFrom)} บาท ดาวน์ ${ft.defaultDown}% ผ่อน ${ft.defaultTerm} งวด (ดอกเบี้ย ${ft.rate(ft.defaultDown, ft.defaultTerm)}% ต่อปี) ค่างวดอยู่ที่ประมาณ ${baht(ft.pay(m.priceFrom, ft.defaultDown, ft.defaultTerm).perMonth)} บาท/เดือน ดูตารางด้านบนสำหรับเงินดาวน์และจำนวนงวดอื่นๆ`,
    },
    {
      question: `BYD ${m.name} ดาวน์ต่ำสุดเท่าไหร่`,
      answer: `ดาวน์เริ่มต้น ${minDown}% ผ่อนได้สูงสุด ${TERMS[TERMS.length - 1]} งวด ค่างวดอยู่ที่ประมาณ ${baht(ft.pay(m.priceFrom, minDown, TERMS[TERMS.length - 1]).perMonth)} บาท/เดือน (ดอกเบี้ย ${ft.rate(minDown, TERMS[TERMS.length - 1])}% ต่อปี) เงื่อนไขอื่นขึ้นกับสถาบันการเงินและโปรโมชั่นในช่วงนั้น ทีมขายช่วยตรวจสอบสิทธิ์ให้ก่อนได้`,
    },
    {
      question: 'ตัวเลขในตารางนี้ใช้ดอกเบี้ยเท่าไหร่',
      answer: `ดอกเบี้ยคงที่ ${rateTxt} ต่อปี ขึ้นกับเงินดาวน์และจำนวนงวด (ดาวน์มาก ผ่อนสั้น ดอกยิ่งต่ำ) ดอกเบี้ยของแต่ละช่องแสดงเป็นตัวเลขสีแดงเหนือค่างวดในตาราง เป็นตัวเลขประมาณการ ยังไม่รวมประกันภัยและค่าจดทะเบียน เงื่อนไขจริงขึ้นกับการอนุมัติของสถาบันการเงิน`,
    },
    {
      question: 'ออกรถ BYD ต้องใช้เอกสารอะไรบ้าง',
      answer: 'พนักงานประจำ: บัตรประชาชน ทะเบียนบ้าน สลิปเงินเดือน 3 เดือน และรายการเดินบัญชี 6 เดือน · เจ้าของกิจการ: เพิ่มหนังสือรับรองบริษัทหรือทะเบียนพาณิชย์ · อาชีพอิสระ: รายการเดินบัญชี 6–12 เดือน ทีมขายแนะนำเอกสารให้ครบก่อนยื่น',
    },
  ]

  return (
    <>
      <Jsonld data={carLd(m)} />
      <Jsonld data={faqLd(faq)} />
      <Jsonld data={breadcrumbLd([{ name: 'ราคาและตารางผ่อน', path: '/price' }, { name: `BYD ${m.name}`, path: `/price/${m.slug}` }])} />

      <section className="page-head">
        <div className="container">
          <p className="kicker">ตารางผ่อน · อัปเดต {YEAR_EN}</p>
          <h1>ตารางผ่อน BYD {m.name} {YEAR_EN}</h1>
          <p className="lead">
            ราคาเริ่มต้น <strong style={{ color: 'var(--ink)' }}>{baht(m.priceFrom)} บาท</strong> · ดอกเบี้ยคงที่ {rateTxt} ต่อปีตามเงินดาวน์และจำนวนงวด · ค่างวดทุกเงินดาวน์และทุกจำนวนงวดอยู่ในตารางด้านล่าง เลื่อนปรับเองได้ในเครื่องคำนวณ
          </p>
        </div>
      </section>

      <main className="container">
        <section className="section" style={{ paddingTop: 20 }}>
          <div className="grid-2" style={{ alignItems: 'start' }}>
            <div className="card" style={{ position: 'relative', minHeight: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--soft)' }}>
              <CarImage media={m.heroImage} alt={`BYD ${m.name}`} sizes="(max-width: 900px) 100vw, 560px" fallbackWidth={300} priority />
            </div>
            <div className="stack">
              {variants.map((v) => {
                const r = ft.pay(v.price, ft.defaultDown, ft.defaultTerm)
                return (
                  <div className="card" key={v.name} style={{ padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                    <div>
                      <div style={{ fontWeight: 600 }}>{m.variants?.length ? `${m.name} ${v.name}` : `BYD ${m.name}`}</div>
                      {v.note ? <div className="small mute">{v.note}</div> : null}
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div className="display" style={{ fontSize: 18 }}>{baht(v.price)} ฿</div>
                      <div className="small" style={{ color: 'var(--red)', fontWeight: 600 }}>≈ {baht(r.perMonth)} ฿/เดือน</div>
                    </div>
                  </div>
                )
              })}
              <Link className="btn btn-red btn-lg" href={`/test-drive?model=${encodeURIComponent(m.name)}`}>
                <Icon name="wheel" size={20} color="#fff" />ขอใบเสนอราคา / นัดทดลองขับ
              </Link>
            </div>
          </div>
        </section>

        {variants.map((v) => (
          <section className="section" key={v.name}>
            <div className="sec-head">
              <div>
                <h2>{m.variants?.length ? `${m.name} ${v.name}` : `BYD ${m.name}`} — {baht(v.price)} บาท</h2>
                <p>ค่างวดต่อเดือน (บาท) ตามเงินดาวน์และจำนวนงวด · <span style={{ color: 'var(--red)' }}>ตัวเลขสีแดง = ดอกเบี้ยคงที่ต่อปี</span></p>
              </div>
            </div>
            <div className="price-table" style={{ display: 'block' }}>
              <table className="rate-grid">
                <thead>
                  <tr>
                    <th>เงินดาวน์</th>
                    <th className="hide-m" style={{ textAlign: 'right' }}>ยอดจัด</th>
                    {TERMS.map((t) => <th key={t} style={{ textAlign: 'right' }}>{t} งวด</th>)}
                  </tr>
                </thead>
                <tbody>
                  {ft.downs.map((d) => {
                    const base = ft.pay(v.price, d, TERMS[0])
                    return (
                      <tr key={d}>
                        <td><b>{d}%</b> <span className="mute small hide-m">({baht(base.down)})</span></td>
                        <td className="num mute hide-m">{baht(base.financed)}</td>
                        {TERMS.map((t) => {
                          const c = ft.pay(v.price, d, t)
                          return (
                            <td key={t} className={`num${d === ft.defaultDown && t === ft.defaultTerm ? ' pick' : ''}`}>
                              <span className="rate">{c.rate}%</span>
                              {baht(c.perMonth)}
                            </td>
                          )
                        })}
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </section>
        ))}

        <section className="section" id="calc">
          <div className="sec-head"><div><h2>ปรับเงื่อนไขเอง</h2><p>เลือกเงินดาวน์และจำนวนงวด เห็นค่างวดทันที</p></div></div>
          <div className="grid-2" style={{ alignItems: 'start' }}>
            <PaymentCalculator models={models} settings={settings} fixedModel={{ ...m, priceFrom: cheapest.price }} compact />
            <div className="stack">
              <div className="sec-head" style={{ marginBottom: 0 }}><div><h2 style={{ fontSize: 18 }}>ยื่นไฟแนนซ์และทดลองขับได้ที่</h2></div></div>
              {branches.map((b) => <BranchRow key={b.id} b={b} />)}
            </div>
          </div>
        </section>

        <section className="section">
          <div className="sec-head"><div><h2>คำถามที่พบบ่อยเรื่องผ่อน BYD {m.name}</h2></div></div>
          <Faq items={faq} />
        </section>

        <section className="section">
          <div className="sec-head">
            <div><h2>ตารางผ่อนรุ่นอื่น</h2></div>
            <Link className="sec-link" href="/price">ดูรวมทุกรุ่น <Icon name="chev" size={16} /></Link>
          </div>
          <div className="chips">
            {others.map((x) => (
              <Link key={x.id} className="chip" href={`/price/${x.slug}`}>ตารางผ่อน {x.name}</Link>
            ))}
          </div>
          <p className="small mute" style={{ marginTop: 12 }}>
            ดูสเปกและรูปของรุ่นนี้ที่ <Link href={`/car-model/${m.slug}`} style={{ color: 'var(--red)', fontWeight: 600 }}>หน้า BYD {m.name}</Link>
          </p>
        </section>
      </main>
    </>
  )
}
