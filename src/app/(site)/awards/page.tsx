import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import Icon from '@/components/Icons'
import Jsonld, { SITE } from '@/components/Jsonld'
import { AWARDS, AWARD_NAMES, AWARD_STATS, AWARD_YEARS, LEVEL_LABEL } from '@/lib/awards'
import { getSiteData } from '@/lib/data'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'รางวัล BYD Dealer of the Year 2025 — Hi-Class Group ดีลเลอร์ BYD ยอดขายอันดับ 1',
  description:
    'Hi-Class Group ผู้จำหน่าย BYD ที่ได้รับรางวัล KUNLUN, HUASHAN และ NPS Award จาก BYD Dealer of the Year 2025 พร้อมรางวัลระดับเอเชียแปซิฟิกและ 12 รางวัลทีมช่างเทคนิค ส่งมอบแล้วกว่า 10,000 คัน',
  alternates: { canonical: '/awards' },
  openGraph: { images: ['/awards/kunlun-2025.webp'] },
}

const YEAR_IMAGE: Record<number, { src: string; alt: string; w: number; h: number } | undefined> = {
  2024: { src: '/awards/apac-2024.webp', alt: 'โล่รางวัล BYD Asia Pacific Dealer Conference 2025 ทั้ง 3 รางวัล', w: 1000, h: 933 },
}

const s = AWARD_STATS

export default async function AwardsPage() {
  const { settings } = await getSiteData()
  const techAwards = AWARDS.filter((a) => a.count)

  return (
    <>
      <Jsonld
        data={{
          '@context': 'https://schema.org',
          '@type': 'AutoDealer',
          name: 'BYD Hi-Class EV Car',
          url: SITE,
          brand: { '@type': 'Brand', name: 'BYD' },
          award: AWARD_NAMES,
        }}
      />

      {/* ---------- Hero ---------- */}
      <section className="aw-hero">
        <div className="container aw-hero-in">
          <div className="aw-hero-copy">
            <p className="kicker">
              <Icon name="check" size={14} sw={3} />
              BYD Dealer of the Year {s.dealerOfYear}
            </p>
            <h1>
              กลุ่มดีลเลอร์ BYD<br />ยอดขายอันดับ 1 ของประเทศ
            </h1>
            <p className="lead">
              Hi-Class Group ส่งมอบรถ BYD แล้วกว่า {s.deliveredUnits.toLocaleString('th-TH')} คัน และได้รับ {s.nationalAwardsLatest} รางวัลสูงสุดระดับประเทศประจำปี {s.dealerOfYear} ทั้งด้านยอดขายและคุณภาพบริการหลังการขาย
            </p>
            <div className="stats aw-stats">
              <div className="card stat"><b>No.1</b><span>ยอดขายกลุ่มดีลเลอร์ BYD ทั่วประเทศ</span></div>
              <div className="card stat"><b>{s.deliveredUnits.toLocaleString('th-TH')}+</b><span>คัน ส่งมอบให้ลูกค้าแล้ว</span></div>
              <div className="card stat"><b>{s.techAwardsTotal}</b><span>รางวัลทีมช่างเทคนิค 2 ปีซ้อน</span></div>
            </div>
            <p className="aw-asof">{s.asOf}</p>
          </div>
          <div className="aw-hero-photo">
            <Image
              src="/awards/kunlun-2025.webp"
              alt="ผู้บริหาร Hi-Class Group ถือโล่รางวัล BYD KUNLUN Award 2025"
              width={1200}
              height={1600}
              sizes="(max-width: 900px) 100vw, 480px"
              priority
            />
          </div>
        </div>
      </section>

      <main className="container">
        {/* ---------- ไทม์ไลน์รางวัล ---------- */}
        {AWARD_YEARS.map((year) => {
          const list = AWARDS.filter((a) => a.year === year && !a.count)
          const img = YEAR_IMAGE[year]
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
        <section className="section aw-year" id="tech">
          <div className="sec-head">
            <div>
              <h2>ทีมช่างเทคนิค</h2>
              <p>BYD Thailand Tech Star &amp; Skill Contest — {s.techAwardsTotal} รางวัล 2 ปีซ้อน</p>
            </div>
            <span className="aw-badge">ระดับประเทศ</span>
          </div>
          <div className="aw-year-grid aw-tech">
            <figure className="card aw-figure">
              <Image src="/awards/techstar-2024-2025.webp" alt="โล่รางวัล BYD Thailand Tech Star and Skill Contest 2024 และ 2025" width={1200} height={685} sizes="(max-width: 900px) 100vw, 560px" />
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
              <p className="mute aw-note">
                ช่างที่ดูแลรถของคุณในทุกสาขา คือทีมเดียวกับที่ผ่านการแข่งขันทักษะระดับประเทศของ BYD — ตรวจเช็กระยะ ซ่อมตัวถัง และวิเคราะห์แบตเตอรี่ตามมาตรฐานเดียวกันทั้งกลุ่ม
              </p>
            </div>
          </div>
        </section>

        {/* ---------- CTA ---------- */}
        <section className="section">
          <div className="card aw-cta">
            <div>
              <h2>ทดลองขับกับดีลเลอร์ที่ BYD ให้รางวัล</h2>
              <p className="mute">เลือกสาขาที่สะดวก ทีมขายโทรยืนยันกลับภายใน 1 ชั่วโมงในเวลาทำการ</p>
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
