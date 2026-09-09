import type { AdminViewServerProps } from 'payload'
import { Gutter } from '@payloadcms/ui'
import Link from 'next/link'
import { AdminIcon as Ic } from './AdminIcons'
import { IMG_TABLE } from '../../lib/imageSpecs'

/**
 * หน้าแรกหลังบ้านสำหรับทีมการตลาด — "วันนี้อยากทำอะไร"
 * งานประจำ 3 อย่าง (แก้ราคา · เพิ่มโปร · อัปรูป) ต้องเสร็จภายใน 1 นาที ไม่ต้องรู้โค้ด
 */
export async function Dashboard(props: AdminViewServerProps) {
  const { req } = props.initPageResult
  const payload = req.payload
  const user = req.user
  const now = new Date()
  const in7 = new Date(now.getTime() + 7 * 864e5).toISOString()
  const nowIso = now.toISOString()

  const [models, promos, mediaCount] = await Promise.all([
    payload.find({ collection: 'car-models', limit: 50, depth: 0, sort: 'sortOrder' }),
    payload.find({ collection: 'promotions', limit: 50, depth: 0, sort: 'sortOrder' }),
    payload.count({ collection: 'media' }),
  ])

  const noImage = models.docs.filter((m) => !m.heroImage)
  const promoNoImage = promos.docs.filter((p) => !p.image)
  const unpublished = models.docs.filter((m) => !m.published)
  const live = promos.docs.filter((p) => (!p.startDate || p.startDate <= nowIso) && (!p.endDate || p.endDate >= nowIso))
  const expiringSoon = live.filter((p) => p.endDate && p.endDate <= in7)
  const expired = promos.docs.filter((p) => p.endDate && p.endDate < nowIso)
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || '/'
  const th = (iso?: string | null) => (iso ? new Date(iso).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' }) : '')

  const tasks = [
    { href: '/admin/prices', title: 'แก้ราคารถ', desc: 'แก้ราคาเริ่มต้นทุกรุ่นในหน้าเดียว ค่างวดคำนวณให้', icon: 'car', hot: true },
    { href: '/admin/collections/promotions/create', title: 'เพิ่มโปรโมชั่น', desc: 'ใส่หัวข้อ รูป วันเริ่ม–สิ้นสุด แล้วขึ้นเว็บทันที', icon: 'tag' },
    { href: '/admin/collections/media/create', title: 'อัปโหลดรูป', desc: 'ลากรูปมาวาง ระบบย่อและแปลงเป็น WebP ให้เอง', icon: 'image' },
    { href: '/admin/collections/branches', title: 'แก้ข้อมูลสาขา', desc: 'เบอร์โทร เวลาเปิด-ปิด ที่อยู่ แผนที่', icon: 'pin' },
  ]

  // Payload ห่อหน้าแดชบอร์ดด้วยเทมเพลตมาตรฐาน (เมนูซ้าย/หัวบน) ให้อยู่แล้ว
  return (
      <Gutter className="hc-dash">
        <div className="hc-dash__head">
          <div>
            <h1 className="hc-dash__title">สวัสดี{user?.email ? ` คุณ${user.email.split('@')[0]}` : ''}</h1>
            <p className="hc-dash__sub">วันนี้อยากทำอะไร? ทุกอย่างที่แก้ที่นี่ขึ้นบนเว็บภายในไม่กี่วินาที</p>
          </div>
          <Link className="hc-btn hc-btn--red" href="/admin/collections/promotions/create">
            <Ic name="plus" size={16} color="#fff" /> เพิ่มโปรโมชั่นใหม่
          </Link>
        </div>

        <div className="hc-tasks">
          {tasks.map((t) => (
            <Link key={t.href} href={t.href} className="hc-task">
              <span className={`hc-task__ico${t.hot ? ' hc-task__ico--hot' : ''}`}><Ic name={t.icon} size={22} /></span>
              <span className="hc-task__title">{t.title}</span>
              <span className="hc-task__desc">{t.desc}</span>
            </Link>
          ))}
        </div>

        <div className="hc-cols">
          <div className="hc-panel">
            <div className="hc-panel__head">
              <h2>โปรโมชั่นที่แสดงบนเว็บ ({live.length})</h2>
              <Link href="/admin/collections/promotions">ดูทั้งหมด</Link>
            </div>
            {live.length === 0 ? <p className="hc-muted">ยังไม่มีโปรโมชั่นที่แสดงอยู่ — กด "เพิ่มโปรโมชั่นใหม่"</p> : null}
            {live.map((p) => (
              <div className="hc-row" key={p.id}>
                <span className={`hc-dot${p.endDate && p.endDate <= in7 ? ' hc-dot--amber' : ' hc-dot--green'}`} />
                <div className="hc-row__body">
                  <div className="hc-row__title">{p.title}{p.featured ? <span className="hc-pill">เด่น</span> : null}</div>
                  <div className="hc-row__sub">{p.endDate ? `หมดอายุ ${th(p.endDate)}` : 'ไม่มีวันหมด'}</div>
                </div>
                <Link className="hc-btn hc-btn--ghost" href={`/admin/collections/promotions/${p.id}`}><Ic name="edit" size={14} /> แก้ไข</Link>
              </div>
            ))}
            {expired.length > 0 ? (
              <p className="hc-muted" style={{ marginTop: 10 }}>{expired.length} โปรหมดอายุแล้ว ซ่อนจากเว็บอัตโนมัติ ไม่ต้องลบ</p>
            ) : null}
          </div>

          <div className="hc-panel">
            <div className="hc-panel__head"><h2>สิ่งที่ยังไม่เรียบร้อย</h2></div>
            {noImage.length > 0 ? (
              <div className="hc-note hc-note--amber">
                <strong>{noImage.length} รุ่น</strong> ยังไม่มีรูปหลัก — เว็บแสดงเงารถแทน:{' '}
                {noImage.slice(0, 4).map((m, i) => (
                  <span key={m.id}>{i > 0 ? ', ' : ''}<Link href={`/admin/collections/car-models/${m.id}`}>{m.name}</Link></span>
                ))}
                {noImage.length > 4 ? ` และอีก ${noImage.length - 4} รุ่น` : ''}
              </div>
            ) : (
              <div className="hc-note hc-note--green">ทุกรุ่นมีรูปหลักแล้ว</div>
            )}
            {expiringSoon.length > 0 ? (
              <div className="hc-note hc-note--amber"><strong>{expiringSoon.length} โปร</strong> จะหมดอายุภายใน 7 วัน — ต่ออายุหรือปล่อยให้หายเอง</div>
            ) : null}
            {unpublished.length > 0 ? (
              <div className="hc-note hc-note--amber"><strong>{unpublished.length} รุ่น</strong> ถูกซ่อนจากเว็บอยู่ (ไม่ได้ติ๊ก "แสดงบนเว็บ")</div>
            ) : null}
            {promoNoImage.length > 0 ? (
              <div className="hc-note hc-note--amber"><strong>{promoNoImage.length} โปรโมชั่น</strong> ยังไม่ได้ใส่รูปประกอบ — การ์ดจะเป็นตัวหนังสือล้วน</div>
            ) : null}
            <div className="hc-note hc-note--gray">รุ่นรถ {models.docs.length} · โปรโมชั่นทั้งหมด {promos.docs.length} · รูปในคลัง {mediaCount.totalDocs}</div>
            <a className="hc-btn hc-btn--ghost" href={siteUrl} target="_blank" rel="noopener noreferrer" style={{ marginTop: 6 }}>
              <Ic name="eye" size={14} /> เปิดดูเว็บจริง
            </a>
          </div>
        </div>

        <div className="hc-panel" style={{ marginTop: 16 }}>
          <div className="hc-panel__head"><h2>ขนาดรูปที่ต้องใช้ (ส่งให้ทีมกราฟิกได้เลย)</h2></div>
          <p className="hc-muted" style={{ marginBottom: 10 }}>
            เว็บออกแบบให้มือถือมาก่อน แต่จอคอมกว้างได้ถึง 1920 px — อัปโหลดไฟล์ใหญ่ตามตารางนี้มาได้เลย
            ระบบจะย่อและแปลงเป็น WebP ให้เอง มือถือจะโหลดเฉพาะตัวเล็ก ไม่ต้องกลัวเว็บช้า
          </p>
          <div className="hc-imgspec">
            {IMG_TABLE.map((r) => (
              <div className="hc-row" key={r.where}>
                <div className="hc-row__body">
                  <div className="hc-row__title">{r.where}</div>
                  <div className="hc-row__sub">{r.ratio}</div>
                </div>
                <span className="hc-pill">{r.size} px</span>
              </div>
            ))}
          </div>
          <p className="hc-muted" style={{ marginTop: 10 }}>
            กฎ 3 ข้อ: 1) กว้างอย่างน้อย 1600 px 2) ไฟล์ไม่เกิน 5 MB 3) วางรถ/ข้อความสำคัญไว้กลางภาพ
            เพราะบนมือถือภาพจะถูกครอบจากกึ่งกลาง
          </p>
        </div>
      </Gutter>
  )
}
