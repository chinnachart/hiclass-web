'use client'

import { useState } from 'react'
import Icon from './Icons'
import type { Branch, CarModel } from '@/lib/types'

/** ฟอร์มเขียนรีวิว — ชื่อ · รุ่นรถ · สาขาที่ซื้อ · ข้อความ → /api/reviews (รออนุมัติก่อนขึ้นเว็บ) */
export default function ReviewForm({ models, branches }: { models: CarModel[]; branches: Branch[] }) {
  const [state, setState] = useState<'idle' | 'sending' | 'done' | 'error'>('idle')
  const [message, setMessage] = useState('')

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setState('sending')
    const fd = new FormData(e.currentTarget)
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: fd.get('name'),
          model: fd.get('model'),
          branch: fd.get('branch'),
          message: fd.get('message'),
          website: fd.get('website'),
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
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <span className="branch-ico" style={{ width: 48, height: 48, borderRadius: 14, background: 'var(--green-soft)', color: 'var(--green-dark)' }}>
          <Icon name="check" size={26} sw={2.5} />
        </span>
        <h3 style={{ fontSize: 20 }}>ขอบคุณสำหรับรีวิว</h3>
        <p className="mute">ขอบคุณที่แบ่งปันประสบการณ์กับ BYD Hi-Class</p>
      </div>
    )
  }

  return (
    <form className="form" onSubmit={onSubmit}>
      <div className="field">
        <label htmlFor="rv-name">ชื่อที่ให้แสดง <span style={{ color: 'var(--red)' }}>*</span></label>
        <input id="rv-name" name="name" type="text" required minLength={2} maxLength={60} placeholder="เช่น คุณสมชาย ก." autoComplete="name" />
      </div>
      <div className="row">
        <div className="field">
          <label htmlFor="rv-model">รุ่นรถ</label>
          <select id="rv-model" name="model" defaultValue="">
            <option value="">ไม่ระบุ</option>
            {models.map((m) => <option key={m.id} value={m.name}>BYD {m.name}</option>)}
          </select>
        </div>
        <div className="field">
          <label htmlFor="rv-branch">สาขาที่ซื้อ</label>
          <select id="rv-branch" name="branch" defaultValue="">
            <option value="">ไม่ระบุ</option>
            {branches.map((b) => <option key={b.id} value={b.name}>สาขา{b.name}</option>)}
          </select>
        </div>
      </div>
      <div className="field">
        <label htmlFor="rv-message">รีวิวของคุณ <span style={{ color: 'var(--red)' }}>*</span></label>
        <textarea id="rv-message" name="message" required minLength={10} maxLength={1000} rows={5} placeholder="เล่าประสบการณ์การซื้อรถ การใช้งาน หรือการบริการของเรา" />
      </div>
      {/* ช่องล่อบอท — ซ่อนจากคนจริง */}
      <div aria-hidden="true" style={{ position: 'absolute', left: -9999, width: 1, height: 1, overflow: 'hidden' }}>
        <label htmlFor="rv-website">Website</label>
        <input id="rv-website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>
      <label className="check" style={{ fontSize: 13, color: 'var(--ink)' }}>
        <input type="checkbox" name="consent" required />
        <span>ยินยอมให้ บริษัท ไฮคลาส อีวี คาร์ จำกัด แสดงชื่อและข้อความรีวิวนี้บนเว็บไซต์และสื่อของบริษัท <span style={{ color: 'var(--red)' }}>*</span></span>
      </label>
      <button className="btn btn-red btn-lg btn-block" type="submit" disabled={state === 'sending'}>
        {state === 'sending' ? 'กำลังส่ง…' : 'ส่งรีวิว'}
        {state !== 'sending' ? <Icon name="arrow" size={20} color="#fff" /> : null}
      </button>
      {state === 'error' ? <p className="notice warn" style={{ marginTop: 4 }}>{message}</p> : null}
    </form>
  )
}
