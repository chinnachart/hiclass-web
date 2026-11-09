import type { Metadata } from 'next'
import Link from 'next/link'
import Icon from '@/components/Icons'
import { Faq } from '@/components/Cards'
import Jsonld, { breadcrumbLd } from '@/components/Jsonld'
import { getPageContent, getSiteData } from '@/lib/data'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'คำถามที่พบบ่อย ซื้อ BYD ทดลองขับ ผ่อน เทิร์นรถ ศูนย์บริการ | Hi-Class',
  description:
    'รวมคำถามที่ลูกค้าถามบ่อยก่อนซื้อ BYD กับ Hi-Class EV Car ทั้งการนัดทดลองขับ ค่างวด เทิร์นรถเก่า เช่ารถ และศูนย์บริการ 6 สาขาในกรุงเทพฯ',
  alternates: { canonical: '/faq' },
}

/**
 * หน้ารวมคำถาม — ดึงชุดเดียวกับหน้าบริการ/เทิร์นรถ/เช่ารถจากหลังบ้าน (แก้ที่เดียวเปลี่ยนทั้งสองหน้า)
 * ไม่ใส่ FAQPage schema ซ้ำ เพราะหน้าต้นทางใส่ไว้แล้ว — Google ให้มี schema คำถามเดียวกันแค่หน้าเดียว
 */
export default async function FaqPage() {
  const [{ branches }, pc] = await Promise.all([getSiteData(), getPageContent()])
  const names = branches.map((b) => b.name).join(' ')

  const buy = [
    {
      question: 'นัดทดลองขับ BYD มีค่าใช้จ่ายไหม',
      answer: `ทดลองขับฟรีทุกรุ่น ไม่มีข้อผูกมัด ที่ Hi-Class ทั้ง ${branches.length} สาขา (${names}) กรอกชื่อกับเบอร์ในหน้านัดทดลองขับ ทีมขายโทรยืนยันคิวภายใน 25 นาทีในเวลาทำการ`,
    },
    {
      question: 'ผ่อน BYD เดือนละเท่าไหร่',
      answer: 'ขึ้นอยู่กับรุ่น เงินดาวน์ และจำนวนงวด ดูค่างวดทุกรุ่นได้ทันทีที่หน้าตารางผ่อน ปรับดาวน์และงวดได้เอง',
    },
    {
      question: 'ยังเลือกรุ่นไม่ได้ ควรเริ่มจากตรงไหน',
      answer: 'ใช้หน้าเปรียบเทียบรุ่น เลือก 2–3 รุ่นมาเทียบราคา ค่างวด ระยะทางต่อการชาร์จ และสเปกหลักได้ในหน้าเดียว หรือนัดทดลองขับหลายรุ่นในวันเดียวกันที่สาขา',
    },
  ]

  const groups = [
    { id: 'buy', title: 'ซื้อรถและทดลองขับ', items: buy, more: { href: '/test-drive', label: 'นัดทดลองขับฟรี' } },
    { id: 'trade-in', title: 'เทิร์นรถเก่า', items: pc.tiFaq || [], more: { href: '/trade-in', label: 'ประเมินราคารถเทิร์น' } },
    { id: 'service', title: 'ศูนย์บริการและหลังการขาย', items: pc.svFaq || [], more: { href: '/service', label: 'นัดเข้าศูนย์บริการ' } },
    { id: 'rental', title: 'เช่ารถ BYD', items: pc.rtFaq || [], more: { href: '/rental', label: 'ดูรถเช่า' } },
  ].filter((g) => g.items.length > 0)

  return (
    <>
      <Jsonld data={breadcrumbLd([{ name: 'คำถามที่พบบ่อย', path: '/faq' }])} />
      <section className="page-head">
        <div className="container">
          <p className="kicker"><Icon name="chat" size={14} />คำถามที่พบบ่อย</p>
          <h1>ทุกคำตอบก่อนซื้อ BYD กับ Hi-Class</h1>
          <p className="lead">รวมเรื่องที่ลูกค้าถามบ่อย ทั้งทดลองขับ ค่างวด เทิร์นรถเก่า และศูนย์บริการ ไม่เจอคำตอบที่ต้องการ โทรหรือทักแชทสาขาที่สะดวกได้เลย</p>
          <p style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12 }}>
            {groups.map((g) => (
              <a key={g.id} className="btn btn-outline" style={{ height: 36, fontSize: 13 }} href={`#${g.id}`}>{g.title}</a>
            ))}
            <Link className="btn btn-outline" style={{ height: 36, fontSize: 13 }} href="/price">ตารางผ่อน</Link>
            <Link className="btn btn-outline" style={{ height: 36, fontSize: 13 }} href="/compare">เปรียบเทียบรุ่น</Link>
          </p>
        </div>
      </section>
      <main className="container">
        {groups.map((g) => (
          <section key={g.id} id={g.id} className="section">
            <h2>{g.title}</h2>
            <Faq items={g.items} />
            <p style={{ marginTop: 12 }}>
              <Link className="more" href={g.more.href}>{g.more.label} <Icon name="arrow" size={14} /></Link>
            </p>
          </section>
        ))}
      </main>
    </>
  )
}
