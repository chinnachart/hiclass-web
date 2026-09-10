'use client'

import { useState } from 'react'
import Link from 'next/link'
import Icon from './Icons'
import { telHref } from '@/lib/format'
import type { Branch, CarModel, SiteSettings } from '@/lib/types'

type Props = {
  models: CarModel[]
  branches: Branch[]
  settings: SiteSettings
  defaultModel?: string
  defaultBranch?: string
}

/** รุ่นแคมเปญที่ดันขึ้นบนสุดและติดป้าย "ดีลลับ" (เทียบด้วยชื่อแบบไม่มีช่องว่าง ตัวพิมพ์เล็ก) */
const NEW_MODELS = ['atto1', 'atto2', 'atto3']
const NEW_LABEL = 'ดีลลับ'
const key = (s: string) => s.replace(/\s+/g, '').toLowerCase()

export function orderModels(models: CarModel[]) {
  const isNew = (m: CarModel) => NEW_MODELS.includes(key(m.name))
  const news = NEW_MODELS.map((k) => models.find((m) => key(m.name) === k)).filter((m): m is CarModel => !!m)
  return [...news, ...models.filter((m) => !isNew(m))]
}

/** ฟอร์มลงทะเบียนความสนใจ (แทน Google Form) — ยินยอม PDPA · ชื่อ · เบอร์ · อีเมล · รุ่น · LINE ID · สาขา · หมายเหตุ → CRM */
export default function RegisterForm({ models, branches, settings, defaultModel, defaultBranch }: Props) {
  const ordered = orderModels(models)
  const initialModel = ordered.find((m) => m.name === defaultModel)?.name || ''
  const [state, setState] = useState<'idle' | 'sending' | 'done' | 'error'>('idle')
  const [message, setMessage] = useState('')

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setState('sending')
    const fd = new FormData(e.currentTarget)
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: fd.get('customerName'),
          phone: fd.get('phone'),
          email: fd.get('email'),
          model: fd.get('model'),
          lineId: fd.get('lineId'),
          branch: fd.get('branch'),
          comment: fd.get('comment'),
          consent: fd.get('consent') === 'on',
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.message || 'ส่งไม่สำเร็จ')
      setState('done')
    } catch (err) {
      setState('error')
      setMessage(err instanceof Error ? err.message : 'ส่งไม่สำเร็จ')
    }
  }

  if (state === 'done') {
    return (
      <div className="card" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <span className="branch-ico" style={{ width: 48, height: 48, borderRadius: 14, background: 'var(--green-soft)', color: 'var(--green-dark)' }}>
          <Icon name="check" size={26} sw={2.5} />
        </span>
        <h3 style={{ fontSize: 22 }}>ลงทะเบียนเรียบร้อยแล้ว</h3>
        <p className="mute">
          ขอบคุณที่สนใจ BYD ทีมขายสาขาที่คุณเลือกจะติดต่อกลับโดยเร็วในเวลาทำการ
          ระหว่างนี้ถ้าอยากคุยเลย โทรหาเราได้ที่ {settings.mainPhone}
        </p>
        {settings.lineUrl ? (
          <a className="btn btn-green" href={settings.lineUrl} target="_blank" rel="noopener noreferrer">
            <Icon name="chat" size={18} color="#fff" />แอด LINE ไว้คุยต่อ
          </a>
        ) : null}
      </div>
    )
  }

  return (
    <form className="form" onSubmit={onSubmit}>
      <label className="check" style={{ fontSize: 13, color: 'var(--ink)' }}>
        <input type="checkbox" name="consent" required />
        <span>
          ข้าพเจ้าได้อ่านและรับทราบเงื่อนไข และยินยอมให้ บริษัท ไฮคลาส อีวี คาร์ จำกัด เก็บรวบรวม ใช้ และเปิดเผยข้อมูลส่วนบุคคลของข้าพเจ้า
          เพื่อการนำเสนอผลิตภัณฑ์รถยนต์ กิจกรรมส่งเสริมการขาย และข้อเสนอพิเศษ ตาม{' '}
          <Link href="/privacy" target="_blank" style={{ textDecoration: 'underline' }}>นโยบายความเป็นส่วนตัว</Link>
          {' '}<span style={{ color: 'var(--red)' }}>*</span>
        </span>
      </label>

      <div className="field">
        <label htmlFor="customerName">ชื่อ <span style={{ color: 'var(--red)' }}>*</span></label>
        <input id="customerName" name="customerName" type="text" required placeholder="ชื่อ-นามสกุล" autoComplete="name" />
      </div>
      <div className="row">
        <div className="field">
          <label htmlFor="phone">เบอร์โทรติดต่อ <span style={{ color: 'var(--red)' }}>*</span></label>
          <input id="phone" name="phone" type="tel" required inputMode="tel" pattern="[0-9\-\s+]{9,20}" placeholder="08x-xxx-xxxx" autoComplete="tel" />
        </div>
        <div className="field">
          <label htmlFor="email">อีเมล <span style={{ color: 'var(--red)' }}>*</span></label>
          <input id="email" name="email" type="email" required placeholder="name@example.com" autoComplete="email" />
        </div>
      </div>

      <div className="field">
        <label htmlFor="model">รุ่นที่สนใจ <span style={{ color: 'var(--red)' }}>*</span></label>
        <select id="model" name="model" required defaultValue={initialModel}>
          <option value="" disabled>เลือกรุ่น</option>
          {ordered.map((m) => (
            <option key={m.id} value={m.name}>
              {NEW_MODELS.includes(key(m.name)) ? `BYD ${m.name} (${NEW_LABEL})` : `BYD ${m.name}`}
            </option>
          ))}
        </select>
      </div>

      <div className="field">
        <label htmlFor="lineId">LINE ID</label>
        <input id="lineId" name="lineId" type="text" placeholder="ไม่บังคับ" autoComplete="off" />
      </div>

      <div className="field">
        <span style={{ fontSize: 13, fontWeight: 600 }}>สาขาที่ท่านต้องการ <span style={{ color: 'var(--red)' }}>*</span></span>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {branches.map((b, i) => (
            <label key={b.id} className="check" style={{ fontSize: 14, color: 'var(--ink)', alignItems: 'center' }}>
              <input type="radio" name="branch" value={b.name} required defaultChecked={defaultBranch ? b.name === defaultBranch : i === 0} />
              <span>สาขา {b.name}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="field">
        <label htmlFor="comment">หมายเหตุ</label>
        <textarea id="comment" name="comment" maxLength={500} placeholder="เช่น สีที่สนใจ ช่วงเวลาที่สะดวกให้ติดต่อ (ไม่บังคับ)" />
      </div>

      <button className="btn btn-red btn-lg btn-block" type="submit" disabled={state === 'sending'}>
        {state === 'sending' ? 'กำลังส่ง…' : 'ส่งข้อมูลลงทะเบียน'}
        {state !== 'sending' ? <Icon name="arrow" size={20} color="#fff" /> : null}
      </button>

      {state === 'error' ? <div className="notice err">{message} — รบกวนลองใหม่ หรือโทรหาสาขาโดยตรง</div> : null}

      <div className="divider">หรือคุยกับเราตอนนี้</div>
      <div className="row" style={{ gridTemplateColumns: settings.lineUrl ? '1fr 1fr' : '1fr' }}>
        {settings.lineUrl ? (
          <a className="btn btn-green" href={settings.lineUrl} target="_blank" rel="noopener noreferrer">
            <Icon name="chat" size={18} color="#fff" />แอด LINE
          </a>
        ) : null}
        <a className="btn btn-outline" href={telHref(settings.mainPhone)}>
          <Icon name="phone" size={18} />{settings.mainPhone}
        </a>
      </div>
    </form>
  )
}
