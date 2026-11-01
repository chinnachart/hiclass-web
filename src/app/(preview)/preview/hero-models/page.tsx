import ModelCarousel, { type CarouselModel } from '@/components/ModelCarousel'

export const metadata = { title: 'ทดลอง: ปัดดูรถทุกรุ่น' }

// ข้อมูลคัดลอกจากหลังบ้าน 1 พ.ย. 2026 · รูปดึงจากเว็บจริง — ใช้ดูดีไซน์เท่านั้น ของจริงจะอ่านจากหลังบ้าน
const IMG = 'https://hiclassevcar.com/api/media/file/'
const MODELS: CarouselModel[] = [
  { name: 'Sealion 7', slug: 'sealion-7', tagline: 'SUV ไฟฟ้า', priceFrom: 1199900, rangeKm: 567, powertrain: 'ev', img: IMG + 'Carnewweb10-800x396.png' },
  { name: 'Sealion 6', slug: 'sealion-6', tagline: 'SUV ไฮบริด DM-i', priceFrom: 859900, rangeKm: 900, powertrain: 'phev', img: IMG + 'CarnewWeb-02-800x396.png' },
  { name: 'Sealion 5', slug: 'sealion-5', tagline: 'SUV ไฮบริด DM-i', priceFrom: 699900, rangeKm: 1200, powertrain: 'phev', img: IMG + 'CarnewWeb-09-800x396.png' },
  { name: 'Atto 3', slug: 'atto-3', tagline: 'SUV ไฟฟ้า', priceFrom: 669900, rangeKm: 410, powertrain: 'ev', img: IMG + 'CarnewWeb-07-800x396.png' },
  { name: 'Atto 2', slug: 'atto-2', tagline: 'SUV ไฟฟ้าขนาดเล็ก', priceFrom: 629900, rangeKm: 410, powertrain: 'ev', img: IMG + 'CarnewWeb-05-800x396.png' },
  { name: 'Atto 1', slug: 'atto-1', tagline: 'ซิตี้คาร์ไฟฟ้า', priceFrom: 429900, rangeKm: 380, powertrain: 'ev', img: IMG + 'CarnewWeb-08-800x396.png' },
  { name: 'Dolphin', slug: 'dolphin', tagline: 'แฮทช์แบ็กไฟฟ้า', priceFrom: 509900, rangeKm: 490, powertrain: 'ev', img: IMG + 'CarnewWeb-01-800x396.png' },
  { name: 'Seal 5', slug: 'seal-5', tagline: 'ซีดานไฮบริด DM-i', priceFrom: 599900, rangeKm: 1200, powertrain: 'phev', img: IMG + 'CarnewWeb-03-800x396.png' },
  { name: 'Seal 6', slug: 'seal-6', tagline: 'ซีดานไฟฟ้า', priceFrom: 799900, rangeKm: 485, powertrain: 'ev', img: IMG + 'CarnewWeb-04-800x396.png' },
  { name: 'M6', slug: 'm6', tagline: 'MPV 7 ที่นั่ง', priceFrom: 769900, rangeKm: 530, powertrain: 'ev', img: IMG + 'CarnewWeb-06-800x396.png' },
]

const bar: React.CSSProperties = { borderRadius: 14, padding: '12px 4px', textAlign: 'center', fontWeight: 600, fontSize: 14, textDecoration: 'none' }

export default function PreviewHeroModels() {
  return (
    <>
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', borderBottom: '1px solid #eee', position: 'sticky', top: 0, background: '#fff', zIndex: 5 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <b style={{ fontFamily: 'var(--font-display)', color: '#c8102e', fontSize: 24, letterSpacing: 3 }}>BYD</b>
          <span style={{ borderLeft: '1px solid #ccc', paddingLeft: 10, fontFamily: 'var(--font-display)', letterSpacing: 2, fontSize: 15 }}>HI-CLASS</span>
        </div>
        <span style={{ fontSize: 13, color: '#c8102e', fontWeight: 600 }}>หน้าทดลอง</span>
      </header>
      <ModelCarousel models={MODELS} lineUrl={null} />
      <section style={{ padding: '22px 20px 110px', color: '#555', fontSize: 14 }}>(ส่วนเดิมของหน้าแรกต่อจากตรงนี้ ไม่เปลี่ยน)</section>
      <nav style={{ position: 'fixed', left: 0, right: 0, bottom: 0, background: '#fff', borderTop: '1px solid #eee', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, padding: '10px 12px 18px' }}>
        <a style={{ ...bar, border: '1.5px solid #111', color: '#111' }} href="#">โทร</a>
        <a style={{ ...bar, background: '#06c755', color: '#fff' }} href="#">ติดต่อเรา</a>
        <a style={{ ...bar, background: '#c8102e', color: '#fff' }} href="#">ทดลองขับ</a>
      </nav>
    </>
  )
}
