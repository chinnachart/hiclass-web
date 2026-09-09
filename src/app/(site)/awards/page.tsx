import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import Icon from '@/components/Icons'
import { mediaOf } from '@/components/CarImage'
import Jsonld, { SITE } from '@/components/Jsonld'
import { AWARDS, AWARD_STATS, LEVEL_LABEL } from '@/lib/awards'
import { getPageContent, getSiteData } from '@/lib/data'
import type { AwardItem, Media } from '@/lib/types'

export const dynamic = 'force-dynamic'

const s = AWARD_STATS

/** ข้อความและรูปตั้งต้น — ใช้เมื่อยังไม่ได้กรอกในหลังบ้าน (ข้อความในหน้าต่างๆ → รางวัล) */
const D = {
  kicker: `BYD Dealer of the Year ${s.dealerOfYear}`,
  headline: 'กลุ่มดีลเลอร์ BYD',
  headline2: 'ยอดขายอันดับ 1 ของประเทศ',
  lead: `Hi-Class Group ส่งมอบรถ BYD แล้วกว่า ${s.deliveredUnits.toLocaleString('th-TH')} คัน และได้รับ ${s.nationalAwardsLatest} รางวัลสูงสุดระดับประเทศประจำปี ${s.dealerOfYear} ทั้งด้านยอดขายและคุณภาพบริการหลังการขาย`,
  asOf: s.asOf,
  stats: [
    { value: 'No.1', label: 'ยอดขายกลุ่มดีลเลอร์ BYD ทั่วประเทศ' },
    { value: `${s.deliveredUnits.toLocaleString('th-TH')}+`, label: 'คัน ส่งมอบให้ลูกค้าแล้ว' },
    { value: String(s.techAwardsTotal), label: 'รางวัลทีมช่างเทคนิค 2 ปีซ้อน' },
  ],
  heroSrc: '/awards/kunlun-2025.webp',
  heroAlt: 'ผู้บริหาร Hi-Class Group ถือโล่รางวัล BYD KUNLUN Award 2025',
  techTitle: 'ทีมช่างเทคนิค',
  techSub: `BYD Thailand Tech Star & Skill Contest — ${s.techAwardsTotal} รางวัล 2 ปีซ้อน`,
  techNote:
    'ช่างที่ดูแลรถของคุณในทุกสาขา คือทีมเดียวกับที่ผ่านการแข่งขันทักษะระดับประเทศของ BYD — ตรวจเช็กระยะ ซ่อมตัวถัง และวิเคราะห์แบตเตอรี่ตามมาตรฐานเดียวกันทั้งกลุ่ม',
  techSrc: '/awards/techstar-2024-2025.webp',
  techAlt: 'โล่รางวัล BYD Thailand Tech Star and Skill Contest 2024 และ 2025',
  ctaTitle: 'ทดลองขับกับดีลเลอร์ที่ BYD ให้รางวัล',
  ctaSub: 'เลือกสาขาที่สะดวก ทีมขายโทรยืนยันกลับภายใน 1 ชั่วโมงในเวลาทำการ',
  seoTitle: 'รางวัล BYD Dealer of the Year 2025 — Hi-Class Group ดีลเลอร์ BYD ยอดขายอันดับ 1',
  seoDesc:
    'Hi-Class Group ผู้จำหน่าย BYD ที่ได้รับรางวัล KUNLUN, HUASHAN และ NPS Award จาก BYD Dealer of the Year 2025 พร้อมรางวัลระดับเอเชียแปซิฟิกและ 12 รางวัลทีมช่างเทคนิค ส่งมอบแล้วกว่า 10,000 คัน',
  /** รูปประกอบรายปีตั้งต้น — ไฟล์ที่วางไว้ใน /public ตั้งแต่ต้น */
  yearImages: {
    2024: { src: '/awards/apac-2024.webp', alt: 'โล่รางวัล BYD Asia Pacific Dealer Conference 2025 ทั้ง 3 รางวัล', w: 1000, h: 933 },
  } as Record<number, { src: string; alt: string; w: number; h: number } | undefined>,
}

export async function generateMetadata(): Promise<Metadata> {
  const pc = await getPageContent()
  return {
    title: pc.awSeoTitle || D.seoTitle,
    description: pc.awSeoDesc || D.seoDesc,
    alternates: { canonical: '/awards' },
    openGraph: { images: [mediaOf(pc.awHeroImage)?.url || D.heroSrc] },
  }
}

export default async function AwardsPage() {
  const [{ settings }, pc] = await Promise.all([getSiteData(), getPageContent()])

  const items: AwardItem[] = (pc.awItems?.length ? pc.awItems : AWARDS).map((a) => ({ ...a, year: Number(a.year) }))
  const years = [...new Set(items.map((a) => a.year))].sort((a, b) => b - a)
  const techAwards = items.filter((a) => a.count)
  const stats = pc.awStats?.length ? pc.awStats : D.stats
  const hero = mediaOf(pc.awHeroImage)
  const techImg = mediaOf(pc.awTechImage)

  /** รูปประกอบของปีนั้น — ของหลังบ้านมาก่อน ถ้าไม่มีค่อยใช้ไฟล์ตั้งต้น */
  const yearPhoto = (year: number) => {
    const fromCms = pc.awYearPhotos?.find((p) => Number(p.year) === year)
    const m = fromCms ? (mediaOf(fromCms.image) as Media | null) : null
    if (m?.url) return { src: m.url, alt: m.alt || `รางวัลปี ${year}`, w: m.width || 1000, h: m.height || 933 }
    return D.yearImages[year]
  }

  const awardNames = items.map((a) => `${a.title} ${a.year}${a.count ? ` (${a.count} awards)` : ''}`)

  return (
    <>
      <Jsonld
        data={{
          '@context': 'https://schema.org',
          '@type': 'AutoDealer',
          name: 'BYD Hi-Class EV Car',
          url: SITE,
          brand: { '@type': 'Brand', name: 'BYD' },
          award: awardNames,
        }}
      />

      {/* ---------- Hero ---------- */}
      <section className="aw-hero">
        <div className="container aw-hero-in">
          <div className="aw-hero-copy">
            <p className="kicker">
              <Icon name="check" size={14} sw={3} />
              {pc.awKicker || D.kicker}
            </p>
            <h1>
              {pc.awHeadline || D.headline}
              <br />
              {pc.awHeadline2 || D.headline2}
            </h1>
            <p className="lead">{pc.awLead || D.lead}</p>
            {stats.length > 0 ? (
              <div className="stats aw-stats">
                {stats.map((st) => (
                  <div className="card stat" key={st.label}><b>{st.value}</b><span>{st.label}</span></div>
                ))}
              </div>
            ) : null}
            <p className="aw-asof">{pc.awAsOf || D.asOf}</p>
          </div>
          <div className="aw-hero-photo">
            <Image
              src={hero?.url || D.heroSrc}
              alt={hero?.alt || D.heroAlt}
              width={hero?.width || 1200}
              height={hero?.height || 1600}
              sizes="(max-width: 900px) 100vw, 480px"
              priority
            />
          </div>
        </div>
      </section>

      <main className="container">
        {/* ---------- ไทม์ไลน์รางวัล ---------- */}
        {years.map((year) => {
          const list = items.filter((a) => a.year === year && !a.count)
          const img = yearPhoto(year)
          if (list.length === 0) return null
          return (
            <section className="section aw-year" key={year} id={`y${year}`}>
              <div className="sec-head">
                <div>
                  <h2>{year}</h2>
                  <p>{list[0].event}</p>
                </div>
                <span className="aw-badge">{LEVEL_LABEL[list[0].level]}</span>
              </div>
              <div className={img ? 'aw-year-grid' : undefined}>
                <ol className="aw-list">
                  {list.map((a) => (
                    <li className="card aw-item" key={a.title}>
                      <span className="aw-medal"><Icon name="check" size={16} sw={3} color="#fff" /></span>
                      <div>
                        <h3>{a.title}</h3>
                        <p>{a.th}</p>
                      </div>
                    </li>
                  ))}
                </ol>
                {img ? (
                  <figure className="card aw-figure">
                    <Image src={img.src} alt={img.alt} width={img.w} height={img.h} sizes="(max-width: 900px) 100vw, 420px" />
                  </figure>
                ) : null}
              </div>
            </section>
          )
        })}

        {/* ---------- ทีมช่าง ---------- */}
        {techAwards.length > 0 ? (
          <section className="section aw-year" id="tech">
            <div className="sec-head">
              <div>
                <h2>{pc.awTechTitle || D.techTitle}</h2>
                <p>{pc.awTechSub || D.techSub}</p>
              </div>
              <span className="aw-badge">ระดับประเทศ</span>
            </div>
            <div className="aw-year-grid aw-tech">
              <figure className="card aw-figure">
                <Image
                  src={techImg?.url || D.techSrc}
                  alt={techImg?.alt || D.techAlt}
                  width={techImg?.width || 1200}
                  height={techImg?.height || 685}
                  sizes="(max-width: 900px) 100vw, 560px"
                />
              </figure>
              <div>
                <ol className="aw-list">
                  {techAwards.map((a) => (
                    <li className="card aw-item" key={a.event}>
                      <span className="aw-medal"><b>{a.count}</b></span>
                      <div>
                        <h3>{a.event}</h3>
                        <p>{a.th}</p>
                      </div>
                    </li>
                  ))}
                </ol>
                <p className="mute aw-note">{pc.awTechNote || D.techNote}</p>
              </div>
            </div>
          </section>
        ) : null}

        {/* ---------- CTA ---------- */}
        <section className="section">
          <div className="card aw-cta">
            <div>
              <h2>{pc.awCtaTitle || D.ctaTitle}</h2>
              <p className="mute">{pc.awCtaSub || D.ctaSub}</p>
            </div>
            <div className="aw-cta-btns">
              <Link className="btn btn-red btn-lg" href="/test-drive"><Icon name="wheel" size={20} color="#fff" />นัดทดลองขับฟรี</Link>
              {settings.lineUrl ? (
                <a className="btn btn-green btn-lg" href={settings.lineUrl} target="_blank" rel="noopener noreferrer"><Icon name="chat" size={20} color="#fff" />แอด LINE</a>
              ) : (
                <Link className="btn btn-outline btn-lg" href="/service"><Icon name="wrench" size={20} />ศูนย์บริการ</Link>
              )}
            </div>
          </div>
        </section>
      </main>
    </>
  )
}
