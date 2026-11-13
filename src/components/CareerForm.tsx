'use client'

import Link from 'next/link'
import { useRef, useState } from 'react'
import BotTrap from './BotTrap'
import Icon from './Icons'

type Props = { branches: { name: string; phone: string }[] }

const MAX_BYTES = 5 * 1024 * 1024
const TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp']
const SOURCES = ['Facebook', 'TikTok', 'Instagram', 'LINE', 'JobThai / JobsDB', 'เพื่อนแนะนำ', 'หน้าเว็บไซต์', 'อื่นๆ']

const newDraftId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (ch) => {
        const r = (Math.random() * 16) | 0
        return (ch === 'x' ? r : (r & 0x3) | 0x8).toString(16)
      })

export default function CareerForm({ branches }: Props) {
  const [file, setFile] = useState<File | null>(null)
  const [fileErr, setFileErr] = useState('')
  const [state, setState] = useState<'idle' | 'sending' | 'done' | 'error'>('idle')
  const [progress, setProgress] = useState('')
  const [message, setMessage] = useState('')
  const fileInput = useRef<HTMLInputElement>(null)

  function pick(list: FileList | null) {
    setFileErr('')
    const f = list?.[0]
    if (!f) return
    if (!TYPES.includes(f.type)) return setFileErr('รองรับไฟล์ PDF หรือรูป (JPG, PNG) เท่านั้น')
    if (f.size > MAX_BYTES) return setFileErr('ไฟล์ใหญ่เกิน 5MB')
    setFile(f)
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (state === 'sending') return
    setState('sending')
    setMessage('')
    const fd = new FormData(e.currentTarget)
    try {
      let resumePath = ''
      if (file) {
        setProgress('กำลังส่งเรซูเม่…')
        const body = new FormData()
        body.set('draft', newDraftId())
        body.set('file', file, file.name)
        const r = await fetch('/api/careers/resume', { method: 'POST', body })
        const j = await r.json().catch(() => ({}))
        if (!r.ok) throw new Error(j?.message || 'ส่งไฟล์ไม่สำเร็จ')
        resumePath = j.path || ''
      }
      setProgress('กำลังส่งใบสมัคร…')
      const r = await fetch('/api/careers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          position: 'ที่ปรึกษาการขาย',
          fullName: fd.get('fullName'),
          nickname: fd.get('nickname'),
          phone: fd.get('phone'),
          lineId: fd.get('lineId'),
          email: fd.get('email'),
          age: fd.get('age'),
          branch: fd.get('branch'),
          expYears: fd.get('expYears'),
          expBrands: fd.get('expBrands'),
          hasLicense: fd.get('hasLicense'),
          canLive: fd.get('canLive'),
          intro: fd.get('intro'),
          source: fd.get('source'),
          consent: fd.get('consent') === 'on',
          resumePath,
          hp: fd.get('website') || '',
          t: fd.get('_t') || '',
        }),
      })
      const j = await r.json().catch(() => ({}))
      if (!r.ok) throw new Error(j?.message || 'ส่งไม่สำเร็จ')
      setState('done')
    } catch (err) {
      setState('error')
      setMessage(err instanceof Error ? err.message : 'ส่งไม่สำเร็จ')
    } finally {
      setProgress('')
    }
  }

  if (state === 'done') {
    return (
      <div style={{ padding: 8, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <span className="branch-ico" style={{ width: 48, height: 48, borderRadius: 14, background: 'var(--green-soft)', color: 'var(--green-dark)', display: 'grid', placeItems: 'center' }}>
          <Icon name="check" size={26} sw={2.5} />
        </span>
        <h3 style={{ fontSize: 22, margin: 0 }}>ได้รับใบสมัครของคุณแล้ว</h3>
        <p className="mute" style={{ margin: 0 }}>ขอบคุณที่สนใจร่วมงานกับ BYD Hi-Class EV Car ทีมงานจะพิจารณาและติดต่อกลับทางโทรศัพท์เพื่อนัดสัมภาษณ์</p>
      </div>
    )
  }

  const sending = state === 'sending'
  return (
    <form className="form" onSubmit={onSubmit} style={{ position: 'relative' }}>
      <BotTrap />
      <div className="row">
        <div className="field">
          <label htmlFor="fullName">ชื่อ-นามสกุล *</label>
          <input id="fullName" name="fullName" type="text" required autoComplete="name" />
        </div>
        <div className="field">
          <label htmlFor="nickname">ชื่อเล่น</label>
          <input id="nickname" name="nickname" type="text" autoComplete="nickname" />
        </div>
      </div>
      <div className="row">
        <div className="field">
          <label htmlFor="phone">เบอร์โทร *</label>
          <input id="phone" name="phone" type="tel" required inputMode="tel" autoComplete="tel" placeholder="08x-xxx-xxxx" />
        </div>
        <div className="field">
          <label htmlFor="age">อายุ</label>
          <input id="age" name="age" type="number" inputMode="numeric" min={18} max={70} />
        </div>
      </div>
      <div className="row">
        <div className="field">
          <label htmlFor="lineId">LINE ID</label>
          <input id="lineId" name="lineId" type="text" />
        </div>
        <div className="field">
          <label htmlFor="email">อีเมล</label>
          <input id="email" name="email" type="email" autoComplete="email" />
        </div>
      </div>
      <div className="field">
        <label htmlFor="branch">สาขาที่ต้องการทำงาน</label>
        <select id="branch" name="branch" defaultValue="any">
          <option value="any">สาขาไหนก็ได้</option>
          {branches.map((b) => (
            <option key={b.name} value={b.name}>
              สาขา{b.name}
            </option>
          ))}
        </select>
      </div>
      <div className="row">
        <div className="field">
          <label htmlFor="expYears">ประสบการณ์ขายรถ (ปี)</label>
          <input id="expYears" name="expYears" type="number" inputMode="decimal" min={0} max={50} step={0.5} placeholder="0 ถ้ายังไม่เคย" />
        </div>
        <div className="field">
          <label htmlFor="expBrands">เคยขายแบรนด์ / ที่ไหน</label>
          <input id="expBrands" name="expBrands" type="text" placeholder="เช่น Toyota 3 ปี, MG 1 ปี" />
        </div>
      </div>
      <div className="row">
        <div className="field">
          <label htmlFor="hasLicense">มีใบขับขี่รถยนต์</label>
          <select id="hasLicense" name="hasLicense" defaultValue="">
            <option value="">— เลือก —</option>
            <option value="yes">มี</option>
            <option value="no">ไม่มี</option>
          </select>
        </div>
        <div className="field">
          <label htmlFor="canLive">กล้ารีวิวรถ / Live สด</label>
          <select id="canLive" name="canLive" defaultValue="">
            <option value="">— เลือก —</option>
            <option value="yes">ได้</option>
            <option value="no">ยังไม่ถนัด</option>
          </select>
        </div>
      </div>
      <div className="field">
        <label htmlFor="intro">แนะนำตัว / ทำไมอยากร่วมงานกับเรา</label>
        <textarea id="intro" name="intro" rows={4} maxLength={1500} />
      </div>
      <div className="field">
        <span style={{ fontSize: 13, fontWeight: 600 }}>แนบเรซูเม่ (PDF หรือรูป ไม่เกิน 5MB | ไม่บังคับ)</span>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <button type="button" className="chip" onClick={() => fileInput.current?.click()} style={{ height: 44 }}>
            {file ? 'เปลี่ยนไฟล์' : '+ เลือกไฟล์'}
          </button>
          {file ? (
            <span style={{ fontSize: 14 }}>
              {file.name}{' '}
              <button type="button" onClick={() => setFile(null)} aria-label="เอาไฟล์ออก" style={{ border: 0, background: 'none', color: 'var(--red)', cursor: 'pointer', fontSize: 14 }}>
                เอาออก
              </button>
            </span>
          ) : null}
        </div>
        {fileErr ? <span style={{ color: 'var(--red)', fontSize: 13 }}>{fileErr}</span> : null}
        <input ref={fileInput} type="file" accept="application/pdf,image/jpeg,image/png,image/webp" hidden onChange={(e) => pick(e.target.files)} />
      </div>
      <div className="field">
        <label htmlFor="source">เห็นประกาศรับสมัครจากที่ไหน</label>
        <select id="source" name="source" defaultValue="">
          <option value="">— เลือก —</option>
          {SOURCES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>
      <label style={{ display: 'flex', gap: 10, alignItems: 'flex-start', fontSize: 14 }}>
        <input type="checkbox" name="consent" required style={{ marginTop: 4 }} />
        <span>
          ยินยอมให้บริษัทเก็บและใช้ข้อมูลนี้เพื่อการพิจารณารับสมัครงาน ตาม<Link href="/privacy">นโยบายความเป็นส่วนตัว</Link>
        </span>
      </label>
      {state === 'error' && message ? <p style={{ color: 'var(--red)', margin: 0 }}>{message}</p> : null}
      <button className="btn btn-red" type="submit" disabled={sending} style={{ width: '100%' }}>
        {sending ? progress || 'กำลังส่ง…' : 'ส่งใบสมัคร'}
      </button>
    </form>
  )
}
