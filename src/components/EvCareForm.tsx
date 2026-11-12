'use client'

import { useState } from 'react'
import Icon from './Icons'

type Props = { models: string[]; partnerName: string; lineUrl: string }

/** ฟอร์มขอใบเสนอราคาประกันภัย Hi-Class EV Care → /api/ev-care → Cinco (แท็บลีดประกันภัย · admin เท่านั้น) */
export default function EvCareForm({ models, partnerName, lineUrl }: Props) {
  const [state, setState] = useState<'idle' | 'sending' | 'done' | 'error'>('idle')
  const [message, setMessage] = useState('')
  const thisYear = new Date().getFullYear()

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (state === 'sending') return
    setState('sending')
    setMessage('')
    const fd = new FormData(e.currentTarget)
    try {
      const r = await fetch('/api/ev-care', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: fd.get('customerName'),
          phone: fd.get('phone'),
          lineId: fd.get('lineId'),
          carModel: fd.get('carModel'),
          carYear: fd.get('carYear'),
          plate: fd.get('plate'),
          insuranceExpiry: fd.get('insuranceExpiry'),
          currentInsurer: fd.get('currentInsurer'),
          note: fd.get('note'),
          consent: fd.get('consent') === 'on',
          website: fd.get('website'),
          source: typeof document !== 'undefined' ? (document.referrer || '').slice(0, 300) : '',
        }),
      })
      const j = await r.json().catch(() => ({}))
      if (!r.ok) throw new Error(j?.message || 'ส่งไม่สำเร็จ')
      setMessage(j?.message || 'ได้รับข้อมูลแล้ว เจ้าหน้าที่จะติดต่อกลับโดยเร็วที่สุด')
      setState('done')
    } catch (err) {
      setState('error')
      setMessage(err instanceof Error ? err.message : 'ส่งไม่สำเร็จ')
    }
  }

  if (state === 'done') {
    return (
      <div className="notice ok" role="status" style={{ fontSize: 15 }}>
        <strong style={{ display: 'block', marginBottom: 4 }}>ส่งข้อมูลเรียบร้อย</strong>
        {message}
        <a className="btn btn-green btn-block" href={lineUrl} target="_blank" rel="noopener" style={{ marginTop: 12 }}>
          <Icon name="chat" size={18} color="#fff" /> เพิ่มเพื่อน LINE โครงการ เพื่อรับใบเสนอราคา
        </a>
      </div>
    )
  }

  return (
    <form className="form" onSubmit={onSubmit}>
      <div className="row">
        <div className="field">
          <label htmlFor="ec-name">ชื่อ-นามสกุล</label>
          <input id="ec-name" name="customerName" type="text" required minLength={2} maxLength={120} placeholder="ชื่อ-นามสกุล" autoComplete="name" />
        </div>
        <div className="field">
          <label htmlFor="ec-phone">เบอร์โทร</label>
          <input id="ec-phone" name="phone" type="tel" required inputMode="tel" pattern="[0-9\-\s+]{9,20}" placeholder="08x-xxx-xxxx" autoComplete="tel" />
        </div>
      </div>
      <div className="row">
        <div className="field">
          <label htmlFor="ec-model">รุ่นรถ</label>
          <select id="ec-model" name="carModel" defaultValue="">
            <option value="">เลือกรุ่นรถ</option>
            {models.map((m) => (
              <option key={m} value={`BYD ${m}`}>BYD {m}</option>
            ))}
            <option value="รุ่นอื่น / ยี่ห้ออื่น">รุ่นอื่น / ยี่ห้ออื่น</option>
          </select>
        </div>
        <div className="field">
          <label htmlFor="ec-year">ปีรถ (ค.ศ.)</label>
          <input id="ec-year" name="carYear" type="number" inputMode="numeric" min={2015} max={thisYear + 1} placeholder={`เช่น ${thisYear - 1}`} />
        </div>
      </div>
      <div className="row">
        <div className="field">
          <label htmlFor="ec-plate">ทะเบียนรถ (ถ้ามี)</label>
          <input id="ec-plate" name="plate" type="text" maxLength={30} placeholder="เช่น 1กข 1234 กรุงเทพฯ" />
        </div>
        <div className="field">
          <label htmlFor="ec-exp">วันที่ประกันหมดอายุ (ถ้าทราบ)</label>
          <input id="ec-exp" name="insuranceExpiry" type="date" />
        </div>
      </div>
      <div className="row">
        <div className="field">
          <label htmlFor="ec-ins">บริษัทประกันปัจจุบัน (ถ้ามี)</label>
          <input id="ec-ins" name="currentInsurer" type="text" maxLength={80} placeholder="เช่น วิริยะ / ยังไม่มี" />
        </div>
        <div className="field">
          <label htmlFor="ec-line">LINE ID (ถ้ามี)</label>
          <input id="ec-line" name="lineId" type="text" maxLength={60} placeholder="สะดวกให้ติดต่อทาง LINE" />
        </div>
      </div>
      <div className="field">
        <label htmlFor="ec-note">รายละเอียดเพิ่มเติม (ถ้ามี)</label>
        <textarea id="ec-note" name="note" rows={3} maxLength={800} placeholder="เช่น ต้องการประกันชั้น 1 ซ่อมศูนย์ / สะดวกให้โทรช่วงบ่าย" />
      </div>
      {/* ช่องล่อบอท — ซ่อนจากคนจริง */}
      <div aria-hidden="true" style={{ position: 'absolute', left: '-9999px', width: 1, height: 1, overflow: 'hidden' }}>
        <label htmlFor="ec-website">เว็บไซต์</label>
        <input id="ec-website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <label className="check">
        <input type="checkbox" name="consent" required />
        <span>
          ยินยอมให้ Hi-Class EV Car ส่งข้อมูลนี้ให้ {partnerName} ซึ่งเป็นผู้ให้บริการโครงการ Hi-Class EV Care เพื่อติดต่อกลับและเสนอราคาประกันภัยรถยนต์ ข้อมูลใช้เพื่อการนี้เท่านั้น
        </span>
      </label>

      <button className="btn btn-red btn-lg btn-block" type="submit" disabled={state === 'sending'}>
        {state === 'sending' ? 'กำลังส่ง…' : 'ขอใบเสนอราคาประกันภัย'}
        {state !== 'sending' ? <Icon name="arrow" size={20} color="#fff" /> : null}
      </button>

      {state === 'error' ? <div className="notice err" role="alert">{message}</div> : null}
    </form>
  )
}
