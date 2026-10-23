'use client'

import { useState } from 'react'
import Icon from './Icons'
import BotTrap from './BotTrap'
import type { Branch } from '@/lib/types'
import { AI_LEVELS, HOME_BRANCH_EXTRA, KNOWN_AIS, TOPICS } from '@/lib/aiCourse'

const req = <span style={{ color: 'var(--red)' }}>*</span>
const groupTitle: React.CSSProperties = { fontSize: 13, fontWeight: 600 }
const checks: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: 8 }
const opt: React.CSSProperties = { fontSize: 14, color: 'var(--ink)', alignItems: 'center' }

/** แบบสำรวจคอร์ส AI สำหรับพนักงาน → /api/ai-course */
export default function AiCourseForm({ branches }: { branches: Branch[] }) {
  const [state, setState] = useState<'idle' | 'sending' | 'done' | 'error'>('idle')
  const [message, setMessage] = useState('')

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const topics = fd.getAll('topics')
    const topicsFree = String(fd.get('topicsFree') || '').trim()
    const prefBranches = fd.getAll('prefBranches')
    if (!topics.length && !topicsFree) {
      setState('error')
      setMessage('บอกหัวข้อที่อยากเรียนอย่างน้อย 1 อย่าง (ติ๊กหรือพิมพ์เองก็ได้)')
      return
    }
    if (!prefBranches.length) {
      setState('error')
      setMessage('เลือกสาขาที่สะดวกเรียนอย่างน้อย 1 สาขา')
      return
    }
    setState('sending')
    try {
      const res = await fetch('/api/ai-course', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: fd.get('fullName'),
          nickname: fd.get('nickname'),
          homeBranch: fd.get('homeBranch'),
          position: fd.get('position'),
          phone: fd.get('phone'),
          aiLevel: fd.get('aiLevel'),
          knownAis: fd.getAll('knownAis'),
          knownAisOther: fd.get('knownAisOther'),
          topics,
          topicsFree,
          useCases: fd.get('useCases'),
          prefBranches,
          prefTime: fd.get('prefTime'),
          note: fd.get('note'),
          hp: fd.get('website') || '',
          t: fd.get('_t') || '',
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.message || 'ส่งไม่สำเร็จ')
      setState('done')
      window.scrollTo({ top: 0, behavior: 'smooth' })
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
        <h3 style={{ fontSize: 22 }}>ส่งคำตอบเรียบร้อย ขอบคุณครับ</h3>
        <p className="mute">จะนำไปจัดตารางคอร์ส AI แล้วแจ้งวันเรียนให้ทราบอีกครั้ง</p>
      </div>
    )
  }

  return (
    <form className="form" onSubmit={onSubmit} style={{ position: 'relative' }}>
      <BotTrap />

      <h3 style={{ fontSize: 18 }}>1. ข้อมูลผู้กรอก</h3>
      <div className="row">
        <div className="field">
          <label htmlFor="fullName">ชื่อ-นามสกุล {req}</label>
          <input id="fullName" name="fullName" type="text" required minLength={2} autoComplete="name" />
        </div>
        <div className="field">
          <label htmlFor="nickname">ชื่อเล่น</label>
          <input id="nickname" name="nickname" type="text" autoComplete="nickname" />
        </div>
      </div>
      <div className="row">
        <div className="field">
          <label htmlFor="homeBranch">สาขาที่สังกัด {req}</label>
          <select id="homeBranch" name="homeBranch" required defaultValue="">
            <option value="" disabled>เลือกสาขา</option>
            {branches.map((b) => (
              <option key={b.id} value={b.name}>สาขา {b.name}</option>
            ))}
            {HOME_BRANCH_EXTRA.map((x) => (
              <option key={x} value={x}>{x}</option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="position">ตำแหน่ง {req}</label>
          <input id="position" name="position" type="text" required placeholder="เช่น ที่ปรึกษาการขาย, ธุรการ, SA" />
        </div>
      </div>
      <div className="field">
        <label htmlFor="phone">เบอร์โทร {req}</label>
        <input id="phone" name="phone" type="tel" required inputMode="tel" pattern="[0-9\-\s+]{9,20}" placeholder="08x-xxx-xxxx" autoComplete="tel" />
      </div>

      <h3 style={{ fontSize: 18, marginTop: 8 }}>2. ตอนนี้ใช้ AI ระดับไหน</h3>
      <div className="field">
        <span style={groupTitle}>ระดับความรู้ AI ตอนนี้ {req}</span>
        <div style={checks}>
          {AI_LEVELS.map((x) => (
            <label key={x} className="check" style={opt}>
              <input type="radio" name="aiLevel" value={x} required />
              <span>{x}</span>
            </label>
          ))}
        </div>
      </div>
      <div className="field">
        <span style={groupTitle}>รู้จัก AI ตัวไหนบ้าง (เลือกได้หลายข้อ)</span>
        <div style={checks}>
          {KNOWN_AIS.map((x) => (
            <label key={x} className="check" style={opt}>
              <input type="checkbox" name="knownAis" value={x} />
              <span>{x}</span>
            </label>
          ))}
        </div>
        <input name="knownAisOther" type="text" maxLength={200} placeholder="ตัวอื่นที่รู้จัก (พิมพ์เอง)" />
      </div>

      <h3 style={{ fontSize: 18, marginTop: 8 }}>3. อยากเรียนอะไร</h3>
      <div className="field">
        <label htmlFor="topicsFree">อยากเรียนรู้อะไรเกี่ยวกับ AI — เล่ามาได้เต็มที่ {req}</label>
        <textarea
          id="topicsFree"
          name="topicsFree"
          rows={5}
          maxLength={2000}
          placeholder="เช่น อยากให้ AI ช่วยตอบลูกค้าที่ถามเรื่องผ่อนบ่อยๆ, อยากทำรูปโปรลงเพจเอง, อยากให้ช่วยสรุปยอดรายเดือน"
        />
      </div>
      <div className="field">
        <span style={groupTitle}>หรือติ๊กหัวข้อที่สนใจ (เลือกได้หลายข้อ)</span>
        <div style={checks}>
          {TOPICS.map((x) => (
            <label key={x} className="check" style={opt}>
              <input type="checkbox" name="topics" value={x} />
              <span>{x}</span>
            </label>
          ))}
        </div>
      </div>
      <div className="field">
        <label htmlFor="useCases">เรียนแล้วอยากเอาไปต่อยอดอะไรในงาน / ชีวิต</label>
        <textarea id="useCases" name="useCases" rows={4} maxLength={2000} placeholder="เช่น ลดเวลาทำรายงาน, ปิดการขายได้มากขึ้น, ทำคอนเทนต์ขายรถของตัวเอง" />
      </div>

      <h3 style={{ fontSize: 18, marginTop: 8 }}>4. สะดวกเรียนที่ไหน เมื่อไหร่</h3>
      <div className="field">
        <span style={groupTitle}>สาขาที่สะดวกไปเรียน (เลือกได้หลายสาขา) {req}</span>
        <div style={checks}>
          {branches.map((b) => (
            <label key={b.id} className="check" style={opt}>
              <input type="checkbox" name="prefBranches" value={b.name} />
              <span>สาขา {b.name}</span>
            </label>
          ))}
        </div>
      </div>
      <div className="field">
        <label htmlFor="prefTime">วันและเวลาที่สะดวก</label>
        <textarea id="prefTime" name="prefTime" rows={3} maxLength={500} placeholder="เช่น ทุกวันอังคารช่วงเช้า, วันหยุดของตัวเองคือพุธ, หลังเลิกงาน 18:00 ได้" />
      </div>
      <div className="field">
        <label htmlFor="note">อยากบอกอะไรเพิ่ม</label>
        <textarea id="note" name="note" rows={3} maxLength={1000} placeholder="ไม่บังคับ" />
      </div>

      <button className="btn btn-red btn-lg btn-block" type="submit" disabled={state === 'sending'}>
        {state === 'sending' ? 'กำลังส่ง…' : 'ส่งคำตอบ'}
        {state !== 'sending' ? <Icon name="arrow" size={20} color="#fff" /> : null}
      </button>

      {state === 'error' ? <div className="notice err">{message}</div> : null}
    </form>
  )
}
