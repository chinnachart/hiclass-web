import Image from 'next/image'
import Link from 'next/link'
import Icon from './Icons'
import { mediaOf } from './CarImage'
import { telHref } from '@/lib/format'
import type { Branch, Promotion } from '@/lib/types'

/** ปุ่มโซเชียลของสาขา — ขึ้นเฉพาะช่องที่กรอกไว้ในหลังบ้าน */
export function BranchSocial({ b }: { b: Branch }) {
  const items = [
    { url: b.facebookUrl, icon: 'facebook', label: 'Facebook' },
    { url: b.instagramUrl, icon: 'instagram', label: 'Instagram' },
    { url: b.tiktokUrl, icon: 'tiktok', label: 'TikTok' },
    { url: b.youtubeUrl, icon: 'youtube', label: 'YouTube' },
  ].filter((x) => x.url)
  if (items.length === 0) return null
  return (
    <div className="branch-social">
      {items.map((x) => (
        <a key={x.icon} href={x.url as string} target="_blank" rel="noopener noreferrer" aria-label={`${x.label} สาขา${b.name}`}>
          <Icon name={x.icon} size={16} />
          <span>{x.label}</span>
        </a>
      ))}
    </div>
  )
}

export const thDate = (iso?: string | null) =>
  iso ? new Date(iso).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' }) : null

/** การ์ดโปรโมชั่น — โปรเด่นเป็นการ์ดใหญ่พื้นดำ */
export function PromoCard({ p }: { p: Promotion }) {
  const href = p.ctaHref || '/test-drive'
  const pic = mediaOf(p.image)
  const inner = (
    <>
      {pic?.url ? (
        <span className="promo-pic">
          <Image
            src={pic.url}
            alt={pic.alt || p.title}
            fill
            sizes="(max-width: 700px) 100vw, (max-width: 1100px) 50vw, 420px"
            style={{ objectFit: 'cover' }}
          />
        </span>
      ) : null}
      {p.badge ? <span className="badge">{p.badge}</span> : null}
      <h3>{p.title}</h3>
      <p>{p.summary}</p>
      <span className="until">{p.endDate ? `ถึง ${thDate(p.endDate)}` : 'ไม่มีกำหนดสิ้นสุด'}</span>
      <span className="more">
        {p.ctaLabel || 'ดูเงื่อนไข'} <Icon name="arrow" size={16} />
      </span>
    </>
  )
  return (
    <Link href={href} className={`card promo${p.featured ? ' lead' : ''}`}>
      {inner}
    </Link>
  )
}

export function PromoGrid({ promotions, limit = 3 }: { promotions: Promotion[]; limit?: number }) {
  const featured = promotions.find((p) => p.featured)
  const rest = promotions.filter((p) => p !== featured)
  const list = (featured ? [featured, ...rest] : rest).slice(0, limit)
  if (list.length === 0) return null
  return (
    <div className={`promos${featured ? ' has-lead' : ''}`}>
      {list.map((p) => <PromoCard key={p.id} p={p} />)}
    </div>
  )
}

/** แถวสาขาแบบย่อ (หน้าแรก) */
export function BranchRow({ b }: { b: Branch }) {
  return (
    <Link href={`/branches/${b.code}`} className="card branch-row">
      <span className="branch-ico"><Icon name="pin" size={20} /></span>
      <span style={{ flexGrow: 1, minWidth: 0 }}>
        <span className="bname" style={{ display: 'block' }}>BYD Hi-Class {b.name}</span>
        <span className="baddr" style={{ display: 'block' }}>{b.address?.split('\n')[0] || b.nameEn}</span>
      </span>
      <span className="bmeta">
        <b>{b.phone}</b>
        <span>{b.openHours || 'เปิดทุกวัน'}</span>
      </span>
    </Link>
  )
}

/** การ์ดสาขาแบบเต็ม (หน้าเลือกสาขา) — โทร / LINE / นำทาง / นัดที่สาขานี้ */
export function BranchCard({ b, lineUrl: siteLine, showIntro = false }: { b: Branch; lineUrl?: string | null; showIntro?: boolean }) {
  // LINE ของสาขาก่อน ถ้าไม่มีค่อยใช้ LINE กลาง
  const lineUrl = b.lineUrl || siteLine
  return (
    <div className="card branch-card">
      <div className="top">
        <span className="branch-ico"><Icon name="pin" size={22} /></span>
        <div style={{ flexGrow: 1, minWidth: 0 }}>
          <h3><Link href={`/branches/${b.code}`}>BYD Hi-Class {b.name}</Link></h3>
          {b.address ? <p className="small mute" style={{ marginTop: 2 }}>{b.address}</p> : null}
          <div className="meta">
            <span className="open">{b.openHours || 'เปิดทุกวัน'}</span>
            <span>{b.phone}</span>
          </div>
        </div>
      </div>
      {showIntro && b.intro ? <p className="intro">{b.intro}</p> : null}
      <BranchSocial b={b} />
      <div className="acts">
        <a className="btn btn-soft" href={telHref(b.phone)}>
          <Icon name="phone" size={16} />โทร
        </a>
        {lineUrl ? (
          <a className="btn btn-green" href={lineUrl} target="_blank" rel="noopener noreferrer">
            <Icon name="chat" size={16} color="#fff" />LINE
          </a>
        ) : (
          <Link className="btn btn-soft" href="/contact">
            <Icon name="chat" size={16} />ติดต่อ
          </Link>
        )}
        {b.mapUrl ? (
          <a className="btn btn-soft" href={b.mapUrl} target="_blank" rel="noopener noreferrer">
            <Icon name="nav" size={16} />นำทาง
          </a>
        ) : (
          <Link className="btn btn-soft" href={`/branches/${b.code}`}>
            <Icon name="nav" size={16} />ดูสาขา
          </Link>
        )}
      </div>
      <Link className="btn btn-red" href={`/test-drive?branch=${encodeURIComponent(b.name)}`}>
        <Icon name="wheel" size={18} color="#fff" />
        นัดทดลองขับที่สาขานี้
      </Link>
    </div>
  )
}

/** คำถามที่พบบ่อย — ใช้ <details> ให้ Google อ่านได้และไม่ต้องใช้ JS */
export function Faq({ items }: { items: { question: string; answer: string }[] }) {
  if (!items?.length) return null
  return (
    <div className="faq">
      {items.map((f, i) => (
        <details key={i} open={i === 0}>
          <summary>
            {f.question}
            <Icon name="chevd" size={18} />
          </summary>
          <div className="ans">{f.answer}</div>
        </details>
      ))}
    </div>
  )
}
