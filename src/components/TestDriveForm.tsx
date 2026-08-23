'use client'

import { useState } from 'react'
import type { Branch, CarModel } from '@/lib/types'

type Props = {
  models: CarModel[]
  branches: Branch[]
  defaultModel?: string
  offerNote?: string
}

export default function TestDriveForm({ models, branches, defaultModel, offerNote }: Props) {
  const [state, setState] = useState<'idle' | 'sending' | 'done' | 'error'>('idle')
  const [message, setMessage] = useState('')

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setState('sending')
    const fd = new FormData(e.currentTarget)
    try {
      const res = await fetch('/api/test-drive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: fd.get('customerName'),
          phone: fd.get('phone'),
          model: fd.get('model'),
          branch: fd.get('branch'),
          preferredTime: fd.get('preferredTime'),
          offerNote: offerNote || '',
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
      <div className="td-form">
        <h3 style={{ fontFamily: '"Chakra Petch",sans-serif', fontSize: 21, margin: '0 0 10px' }}>
          รับคำขอเรียบร้อยแล้ว
        </h3>
        <p style={{ color: 'var(--dim)', fontSize: 15, margin: 0 }}>
          ทีมขายสาขาที่คุณเลือกได้รับแจ้งแล้ว และจะติดต่อกลับเพื่อยืนยันวันเวลาภายใน 1 ชั่วโมงในเวลาทำการ
        </p>
      </div>
    )
  }

  return (
    <form className="td-form" onSubmit={onSubmit}>
      <div className="row">
        <div className="field">
          <label htmlFor="customerName">ชื่อ–นามสกุล</label>
          <input id="customerName" name="customerName" type="text" required placeholder="ชื่อของคุณ" />
        </div>
        <div className="field">
          <label htmlFor="phone">เบอร์โทร</label>
          <input
            id="phone" name="phone" type="tel" required
            pattern="[0-9\-\s+]{9,20}" placeholder="08X-XXX-XXXX"
          />
        </div>
      </div>
      <div className="row">
        <div className="field">
          <label htmlFor="model">รุ่นที่สนใจ</label>
          <select id="model" name="model" defaultValue={defaultModel || models[0]?.name}>
            {models.map((m) => (
              <option key={m.id} value={m.name}>{m.name} — {m.tagline}</option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="branch">สาขาที่สะดวก</label>
          <select id="branch" name="branch">
            {branches.map((b) => (
              <option key={b.id} value={b.name}>{b.name}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="field">
        <label htmlFor="preferredTime">วันที่สะดวก</label>
        <input id="preferredTime" name="preferredTime" type="text" placeholder="เช่น เสาร์นี้ ช่วงบ่าย" />
      </div>

      <button className="btn" type="submit" disabled={state === 'sending'}
        style={{ width: '100%', padding: 13 }}>
        {state === 'sending' ? 'กำลังส่ง…' : 'ส่งคำขอนัดทดลองขับ'}
      </button>

      {state === 'error' ? (
        <p style={{ color: '#F2857E', fontSize: 13, margin: '10px 0 0' }}>
          {message} — รบกวนลองใหม่อีกครั้ง หรือโทรหาสาขาโดยตรง
        </p>
      ) : null}

      <p className="privacy">ข้อมูลของคุณใช้สำหรับติดต่อกลับเรื่องการนัดทดลองขับเท่านั้น</p>
    </form>
  )
}
