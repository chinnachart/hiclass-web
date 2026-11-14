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
  // 14 พ.ย. 2569: แถบสว่างเต็มความกว้างจอ (เดิมเป็นการ์ดในกรอบกลาง) ตัวเลขสำคัญเรียงด้านขวา
  return (
    <section className="aw-band" id="awards">
      <Link className="container aw-band-in" href="/awards">
        <div className="aw-strip-photo">
          <Image src="/awards/kunlun-2025.webp" alt="โล่รางวัล BYD KUNLUN Award 2025 ของ Hi-Class Group" width={300} height={400} sizes="(max-width: 900px) 120px, 180px" />
        </div>
        <div className="aw-strip-copy">
          <p className="kicker">BYD Dealer of the Year {s.dealerOfYear}</p>
          <h2>กลุ่มดีลเลอร์ BYD ยอดขายอันดับ 1 ของประเทศ</h2>
          <span className="sec-link">ดูรางวัลทั้งหมด <Icon name="chev" size={16} /></span>
        </div>
        <dl className="aw-stats">
          <div><dt>{s.deliveredUnits.toLocaleString('th-TH')}+</dt><dd>คันที่ส่งมอบแล้ว</dd></div>
          <div><dt>{s.nationalAwardsLatest}</dt><dd>รางวัลระดับประเทศปี {s.dealerOfYear}</dd></div>
          <div><dt>{s.techAwardsTotal}</dt><dd>รางวัลทีมช่างเทคนิค</dd></div>
        </dl>
      </Link>
    </section>
  )
}
