import Link from 'next/link'
import Image from 'next/image'
import Icon from '@/components/Icons'
import { AWARD_STATS } from '@/lib/awards'

/**
 * แถบรางวัลบนหน้าแรก — หลักฐานความน่าเชื่อถือ วางไว้ก่อนโปรโมชั่น
 * ตัวเลขทั้งหมดมาจาก src/lib/awards.ts
 */
export function AwardsStrip() {
  const s = AWARD_STATS
  return (
    <section className="section awards-strip" id="awards">
      <Link className="card aw-strip-in" href="/awards">
        <div className="aw-strip-photo">
          <Image src="/awards/kunlun-2025.webp" alt="โล่รางวัล BYD KUNLUN Award 2025 ของ Hi-Class Group" width={300} height={400} sizes="(max-width: 900px) 120px, 180px" />
        </div>
        <div className="aw-strip-copy">
          <p className="kicker">BYD Dealer of the Year {s.dealerOfYear}</p>
          <h2>กลุ่มดีลเลอร์ BYD ยอดขายอันดับ 1 ของประเทศ</h2>
          <p className="mute">
            ส่งมอบแล้วกว่า {s.deliveredUnits.toLocaleString('th-TH')} คัน · {s.nationalAwardsLatest} รางวัลระดับประเทศปี {s.dealerOfYear} · {s.techAwardsTotal} รางวัลทีมช่างเทคนิค
          </p>
          <span className="sec-link">ดูรางวัลทั้งหมด <Icon name="chev" size={16} /></span>
        </div>
      </Link>
    </section>
  )
}
