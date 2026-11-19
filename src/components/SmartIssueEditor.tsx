'use client'

import { useState } from 'react'

const STATUSES = [
  { value: 'new', label: 'ใหม่' },
  { value: 'in_progress', label: 'กำลังแก้' },
  { value: 'need_info', label: 'ขอข้อมูลเพิ่ม' },
  { value: 'done', label: 'แก้แล้ว' },
]

/** ช่องเปลี่ยนสถานะ + ตอบกลับ บนหน้า /smart-report/list */
export default function SmartIssueEditor(p: { id: number; viewKey: string; status: string; reply: string; repliedAt: string }) {
  const [status, setStatus] = useState(p.status)
  const [reply, setReply] = useState(p.reply)
  const [saved, setSaved] = useState({ status: p.status, reply: p.reply })
  const [state, setState] = useState<'idle' | 'saving' | 'ok' | 'error'>('idle')
  const [msg, setMsg] = useState('')
  const dirty = status !== saved.status || reply.trim() !== saved.reply

  async function save() {
    setState('saving')
    setMsg('')
    try {
      const r = await fetch('/api/smart-report/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: p.viewKey, id: p.id, status, reply }),
      })
      const j = await r.json().catch(() => ({}))
      if (!r.ok) throw new Error(j?.message || 'บันทึกไม่สำเร็จ')
      setSaved({ status: j.status, reply: j.reply || '' })
      setReply(j.reply || '')
      setState('ok')
    } catch (e) {
      setState('error')
      setMsg(e instanceof Error ? e.message : 'บันทึกไม่สำเร็จ')
    }
  }

  return (
    <div style={{ borderTop: '1px solid var(--line)', paddingTop: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
        <label htmlFor={`st${p.id}`} style={{ fontSize: 13, fontWeight: 600 }}>สถานะ</label>
        <select id={`st${p.id}`} value={status} onChange={(e) => setStatus(e.target.value)} style={{ height: 38, borderRadius: 8, border: '1px solid var(--line)', padding: '0 10px', fontSize: 15 }}>
          {STATUSES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
        {p.repliedAt ? <span className="mute" style={{ fontSize: 12 }}>ตอบล่าสุด {p.repliedAt}</span> : null}
      </div>
      <textarea
        value={reply}
        onChange={(e) => setReply(e.target.value)}
        rows={2}
        maxLength={4000}
        placeholder="คำตอบ หรือ วิธีแก้ (ไม่บังคับ)"
        style={{ width: '100%', borderRadius: 8, border: '1px solid var(--line)', padding: 10, fontSize: 15, fontFamily: 'inherit', resize: 'vertical' }}
      />
      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
        <button type="button" className="btn btn-dark" onClick={save} disabled={!dirty || state === 'saving'} style={{ height: 38 }}>
          {state === 'saving' ? 'กำลังบันทึก…' : 'บันทึก'}
        </button>
        {state === 'ok' && !dirty ? <span style={{ color: 'var(--green-dark)', fontSize: 13 }}>บันทึกแล้ว</span> : null}
        {state === 'error' ? <span style={{ color: 'var(--red)', fontSize: 13 }}>{msg}</span> : null}
      </div>
    </div>
  )
}
