'use client'

import { useState } from 'react'
import Icon from './Icons'
import CallPicker from './CallPicker'
import type { Branch, CarModel, SiteSettings } from '@/lib/types'
import { APPOINTMENT_SLOTS } from '@/lib/appointment'
import { attributionText, track } from '@/lib/track'

type Props = {
  models: CarModel[]
  branches: Branch[]
  settings: SiteSettings
  defaultModel?: string
  defaultBranch?: string
  offerNote?: string
}

const SLOTS = APPOINTMENT_SLOTS

/** ฟอร์มนัดทดลองขับ — เลือกรุ่นเป็นชิป เลือกสาขา ชื่อ เบอร์ วัน ช่วงเวลา แล้วส่งเข้า CRM */
export default function TestDriveForm({ models, branches, settings, defaultModel, defaultBranch, offerNote }: Props) {
  const initialModel = models.find((m) => m.name === defaultModel)?.name || models[0]?.name || ''
  const [model, setModel] = useState(initialModel)
  const [state, setState] = useState<'idle' | 'sending' | 'done' | 'error'>('idle')
  const [message, setMessage] = useState('')

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setState('sending')
    const fd = new FormData(e.currentTarget)
    const appointmentDate = String(fd.get('date') || '') // YYYY-MM-DD จาก <input type=date>
    const appointmentSlot = String(fd.get('slot') || '')
    try {
      const res = await fetch('/api/test-drive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: fd.get('customerName'),
          phone: fd.get('phone'),
          model,
          branch: fd.get('branch'),
          appointmentDate,
          appointmentSlot,
          offerNote: offerNote || '',
          attribution: attributionText(),
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.message || 'ส่งไม่สำเร็จ')
      track('test_drive', settings, { model, branch: String(fd.get('branch') || '') })
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
        <h3 style={{ fontSize: 22 }}>รับนัดเรียบร้อยแล้ว</h3>
        <p className="mute">
          ทีมขายสาขาที่คุณเลือกได้รับแจ้งแล้ว จะโทรยืนยันวันเวลาให้ภายใน 1 ชั่วโมงในเวลาทำการ
          ระหว่างนี้ถ้าอยากคุยเลย โทรหาสาขาได้ทันที
        </p>
        <CallPicker branches={branches} label="โทรหาสาขา" title="โทรคุยกับทีมขาย — เลือกสาขา" />
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
      <div className="field">
        <span style={{ fontSize: 13, fontWeight: 600 }}>รุ่นที่สนใจ</span>
        <div className="chips" role="radiogroup" aria-label="รุ่นที่สนใจ">
          {models.map((m) => (
            <button
              key={m.id}
              type="button"
              className={`chip${model === m.name ? ' on' : ''}`}
              onClick={() => setModel(m.name)}
              role="radio"
              aria-checked={model === m.name}
            >
              {m.name}
            </button>
          ))}
        </div>
      </div>

      <div className="field">
        <label htmlFor="branch">สาขาที่สะดวก</label>
        <select id="branch" name="branch" defaultValue={defaultBranch || branches[0]?.name}>
          {branches.map((b) => (
            <option key={b.id} value={b.name}>BYD Hi-Class {b.name}</option>
          ))}
        </select>
      </div>

      <div className="field">
        <label htmlFor="customerName">ชื่อ</label>
        <input id="customerName" name="customerName" type="text" required placeholder="ชื่อ-นามสกุล" autoComplete="name" />
      </div>
      <div className="field">
        <label htmlFor="phone">เบอร์โทร</label>
        <input id="phone" name="phone" type="tel" required inputMode="tel" pattern="[0-9\-\s+]{9,20}" placeholder="08x-xxx-xxxx" autoComplete="tel" />
      </div>

      <div className="row">
        <div className="field">
          <label htmlFor="date">วันที่สะดวก</label>
          <input id="date" name="date" type="date" min={new Date().toISOString().slice(0, 10)} />
        </div>
        <div className="field">
          <label htmlFor="slot">ช่วงเวลา</label>
          <select id="slot" name="slot" defaultValue={SLOTS[1]}>
            {SLOTS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {offerNote ? <div className="notice ok">{offerNote}</div> : null}

      <label className="check">
        <input type="checkbox" required defaultChecked />
        <span>ยินยอมให้ติดต่อกลับเพื่อยืนยันนัดทดลองขับ ข้อมูลใช้เพื่อการนี้เท่านั้น</span>
      </label>

      <button className="btn btn-red btn-lg btn-block" type="submit" disabled={state === 'sending'}>
        {state === 'sending' ? 'กำลังส่ง…' : 'ยืนยันนัดทดลองขับ'}
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
        <CallPicker branches={branches} title="โทรคุยกับทีมขาย — เลือกสาขา" />
      </div>
    </form>
  )
}
