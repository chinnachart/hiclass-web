import type { Metadata } from 'next'
import Icon from '@/components/Icons'
import Jsonld, { faqLd } from '@/components/Jsonld'
import EvCareForm from '@/components/EvCareForm'
import { getSiteData } from '@/lib/data'
import { EV_CARE } from '@/lib/evcare'

export const dynamic = 'force-dynamic'

const NAVY = '#0f172a'
const GOLD = '#c9a24b'

const POINTS = [
  { icon: 'shield', title: 'คุ้มครองครอบคลุม', text: 'แผนประกันภัยรถยนต์ที่ออกแบบสำหรับรถยนต์ไฟฟ้าโดยเฉพาะ' },
  { icon: 'bolt', title: 'เข้าใจรถ EV อย่างแท้จริง', text: 'ทีมงานเชี่ยวชาญรถยนต์ไฟฟ้า ให้คำแนะนำตรงกับการใช้งานจริง' },
  { icon: 'clock', title: 'พร้อมดูแลตลอด 24 ชั่วโมง', text: 'มีทีมช่วยเหลือประสานงานเมื่อเกิดเหตุ' },
  { icon: 'chat', title: 'ดูแลใกล้ชิดด้วยทีมมืออาชีพ', text: 'มีเจ้าหน้าที่ประจำโครงการดูแลตั้งแต่เสนอราคาจนต่ออายุ' },
] as const

const STEPS = [
  'เจ้าหน้าที่จะแนะนำตัวว่ามาจาก “โครงการ Hi-Class EV Care”',
  'ใบเสนอราคาเบี้ยประกันจะมีหัวเอกสาร “โครงการ HI CLASS EV CARE” และชื่อ ' + EV_CARE.partnerName,
  'ช่องทาง LINE ของโครงการ คือบัญชี LINE Official ตาม QR ในหน้านี้เท่านั้น',
]

const FAQ = [
  {
    question: 'Hi-Class EV Care คืออะไร',
    answer: `Hi-Class EV Care คือโครงการประกันภัยรถยนต์ไฟฟ้าสำหรับลูกค้า BYD Hi-Class EV Car ให้บริการโดยพาร์ทเนอร์อย่างเป็นทางการของเรา ${EV_CARE.partnerName}`,
  },
  {
    question: 'มีคนโทรมาแจ้งว่ามาจาก Hi-Class EV Care เรื่องต่อประกัน เป็นของ Hi-Class จริงไหม',
    answer: `จริง หากเจ้าหน้าที่แนะนำตัวว่ามาจากโครงการ Hi-Class EV Care และส่งใบเสนอราคาที่มีชื่อโครงการพร้อมชื่อ ${EV_CARE.partnerName} ท่านตรวจสอบได้จากหน้านี้ หรือเพิ่มเพื่อน LINE Official ของโครงการตาม QR ด้านบน`,
  },
  {
    question: 'จำเป็นต้องต่อประกันกับโครงการนี้ไหม',
    answer: 'ไม่จำเป็น ลูกค้าเลือกบริษัทประกันได้เองตามความสะดวก Hi-Class EV Care เป็นทางเลือกที่เราแนะนำ เพราะมีทีมงานที่เข้าใจรถยนต์ไฟฟ้าและประสานงานกับศูนย์บริการ Hi-Class ได้โดยตรง',
  },
  {
    question: 'ขอใบเสนอราคาต้องเตรียมอะไรบ้าง',
    answer: 'รายการจดทะเบียนรถ สำเนาบัตรประชาชน และวันที่ต้องการเริ่มคุ้มครอง กรณีนิติบุคคลใช้ ภพ.20 หรือหนังสือรับรองบริษัท เบื้องต้นกรอกฟอร์มในหน้านี้ก่อนได้ เจ้าหน้าที่จะแจ้งเอกสารที่ต้องใช้อีกครั้ง',
  },
  {
    question: 'รถที่ไม่ได้ซื้อจาก Hi-Class ขอใบเสนอราคาได้ไหม',
    answer: 'ได้ กรอกฟอร์มและเลือก “รุ่นอื่น / ยี่ห้ออื่น” เจ้าหน้าที่โครงการจะติดต่อกลับเพื่อสอบถามรายละเอียด',
  },
]

export const metadata: Metadata = {
  title: 'Hi-Class EV Care ประกันภัยรถยนต์ไฟฟ้า สำหรับลูกค้า BYD Hi-Class',
  description:
    'Hi-Class EV Care โครงการประกันภัยรถยนต์ไฟฟ้าสำหรับลูกค้า BYD Hi-Class EV Car ให้บริการโดยพาร์ทเนอร์อย่างเป็นทางการ บริษัท โคโรเนท โบรกเกอร์ จำกัด ขอใบเสนอราคาเบี้ยประกันออนไลน์ได้ที่นี่',
  alternates: { canonical: '/ev-care' },
}

export default async function EvCarePage() {
  const { models } = await getSiteData()

  return (
    <>
      <Jsonld data={faqLd(FAQ)} />
      <section className="page-head" style={{ background: NAVY, color: '#fff' }}>
        <div className="container">
          <p className="kicker" style={{ color: GOLD }}><Icon name="shield" size={14} color={GOLD} />โครงการประกันภัยรถยนต์ไฟฟ้า</p>
          <h1 style={{ color: '#fff' }}>Hi-Class EV Care</h1>
          <p className="lead" style={{ color: 'rgba(255,255,255,.85)' }}>
            โครงการประกันภัยรถยนต์ไฟฟ้าสำหรับลูกค้า BYD Hi-Class EV Car ให้บริการโดยพาร์ทเนอร์อย่างเป็นทางการของเรา {EV_CARE.partnerName}
          </p>
          <a className="btn btn-red" href="#quote" style={{ marginTop: 16, background: GOLD, color: NAVY }}>
            ขอใบเสนอราคาประกันภัย <Icon name="arrow" size={18} color={NAVY} />
          </a>
        </div>
      </section>

      <main className="container">
        <div style={{ marginTop: 20, borderRadius: 'var(--radius)', overflow: 'hidden', border: '1px solid var(--line)' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={EV_CARE.banner} alt="Hi-Class EV Care และ Coronet ประกันภัยรถยนต์ไฟฟ้า ครบครัน มั่นใจทุกเส้นทาง" width={1920} height={1080} style={{ display: 'block', width: '100%', height: 'auto' }} />
        </div>

        <section className="section" style={{ paddingTop: 24 }}>
          <h2>พาร์ทเนอร์ของเรา</h2>
          <div className="card" style={{ padding: 20, marginTop: 12, display: 'grid', gap: 10 }}>
            <p style={{ margin: 0, fontSize: 16, lineHeight: 1.6 }}>
              <strong>Hi-Class EV Care</strong> ดำเนินการโดย <strong>{EV_CARE.partnerName}</strong> ({EV_CARE.partnerNameEn}) ผู้ให้บริการนายหน้าประกันภัย
              ซึ่งเป็นพาร์ทเนอร์ด้านประกันภัยรถยนต์อย่างเป็นทางการของ BYD Hi-Class EV Car
            </p>
            <p className="mute" style={{ margin: 0, fontSize: 14 }}>
              การเสนอราคา การรับประกันภัย และการบริการกรมธรรม์ ดำเนินการโดย {EV_CARE.partnerName} และบริษัทประกันภัยที่ลูกค้าเลือก
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 4 }}>
              <a className="btn btn-green" href={EV_CARE.lineUrl} target="_blank" rel="noopener">
                <Icon name="chat" size={18} color="#fff" /> เพิ่มเพื่อน LINE โครงการ
              </a>
              <a className="btn" href={EV_CARE.partnerUrl} target="_blank" rel="noopener" style={{ border: '1.5px solid var(--ink)', background: '#fff' }}>
                เว็บไซต์ Coronet Brokers <Icon name="arrow" size={16} />
              </a>
            </div>
          </div>
        </section>

        <section className="section">
          <h2>จุดเด่นของโครงการ</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: 12, marginTop: 12 }}>
            {POINTS.map((p) => (
              <div key={p.title} className="card" style={{ padding: 18, display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                <span style={{ width: 44, height: 44, borderRadius: 12, background: NAVY, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                  <Icon name={p.icon} size={22} color={GOLD} />
                </span>
                <div>
                  <h3 style={{ fontSize: 17, margin: 0 }}>{p.title}</h3>
                  <p className="mute" style={{ margin: '4px 0 0', fontSize: 14 }}>{p.text}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="section">
          <h2>เจ้าหน้าที่โครงการจะติดต่อคุณอย่างไร</h2>
          <div className="card" style={{ padding: 20, marginTop: 12 }}>
            <ul style={{ margin: 0, paddingLeft: 0, listStyle: 'none', display: 'grid', gap: 10 }}>
              {STEPS.map((s) => (
                <li key={s} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', fontSize: 15, lineHeight: 1.55 }}>
                  <span style={{ flexShrink: 0, marginTop: 2 }}><Icon name="check" size={18} color="var(--green)" /></span>
                  <span>{s}</span>
                </li>
              ))}
            </ul>
            <p className="mute" style={{ margin: '12px 0 0', fontSize: 14 }}>
              หากไม่แน่ใจว่าผู้ที่ติดต่อมาเป็นเจ้าหน้าที่โครงการจริงหรือไม่ กรอกฟอร์มด้านล่าง ทีมงาน Hi-Class EV Car จะประสานให้เจ้าหน้าที่โครงการติดต่อกลับโดยตรง
            </p>
          </div>
        </section>

        <section className="section" id="quote" style={{ scrollMarginTop: 80 }}>
          <h2>ขอใบเสนอราคาประกันภัย</h2>
          <p className="mute" style={{ margin: '4px 0 12px', fontSize: 14 }}>กรอกข้อมูลสั้นๆ เจ้าหน้าที่โครงการ Hi-Class EV Care จะติดต่อกลับพร้อมใบเสนอราคา ไม่มีค่าใช้จ่าย ไม่มีข้อผูกมัด</p>
          <div className="card" style={{ padding: 20, maxWidth: 640, position: 'relative' }}>
            <EvCareForm models={models.map((m) => m.name)} partnerName={EV_CARE.partnerName} lineUrl={EV_CARE.lineUrl} />
          </div>
        </section>

        <section className="section">
          <h2>คำถามที่พบบ่อย</h2>
          <div className="faq">
            {FAQ.map((f) => (
              <details key={f.question}>
                <summary>{f.question}</summary>
                <p>{f.answer}</p>
              </details>
            ))}
          </div>
        </section>
      </main>
    </>
  )
}
