'use client'

import { useEffect, useId, useState } from 'react'
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
  /** โหมดสั้นสำหรับฝังในหน้ารุ่นรถ — ล็อกรุ่นตาม defaultModel, ซ่อนชิปรุ่นและปุ่มโทร/LINE ท้ายฟอร์ม */
  compact?: boolean
}

type DayOpt = { key: string; label: string; date: string }

const TH_DOW = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัส', 'ศุกร์', 'เสาร์']
const TH_MON = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.']

/** ตัวเลือกวันแบบกดทีเดียว (ยึดเวลาไทย) — วันนี้ (ถ้ายังไม่ 17:00) · พรุ่งนี้ · เสาร์/อาทิตย์ที่จะถึง */
function buildDayOptions(now = new Date()): DayOpt[] {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Bangkok', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', hourCycle: 'h23' })
    .formatToParts(now)
    .reduce<Record<string, string>>((a, x) => ((a[x.type] = x.value), a), {})
  const base = Date.UTC(Number(parts.year), Number(parts.month) - 1, Number(parts.day))
  const hour = Number(parts.hour)
  const at = (n: number) => new Date(base + n * 86400000)
  const iso = (d: Date) => d.toISOString().slice(0, 10)
  const short = (d: Date) => `${TH_DOW[d.getUTCDay()]} ${d.getUTCDate()} ${TH_MON[d.getUTCMonth()]}`

  const out: DayOpt[] = []
  if (hour < 17) out.push({ key: 'd0', label: 'วันนี้', date: iso(at(0)) })
  out.push({ key: 'd1', label: 'พรุ่งนี้', date: iso(at(1)) })
  for (let n = 2; n <= 7 && out.length < 4; n++) {
    const d = at(n)
    const dow = d.getUTCDay()
    if (dow === 6 || dow === 0) out.push({ key: `d${n}`, label: short(d), date: iso(d) })
  }
  return out
}

const SLOTS = APPOINTMENT_SLOTS

/** ฟอร์มนัดทดลองขับ — บังคับแค่ชื่อ+เบอร์ · สาขาเลือกไว้ให้ · วันเป็นปุ่มกด (ค่าเริ่มต้น 'ให้เซลส์โทรนัด') · ส่งเข้า CRM */
export default function TestDriveForm({ models, branches, settings, defaultModel, defaultBranch, offerNote, compact }: Props) {
  const uid = useId()
  const initialModel = models.find((m) => m.name === defaultModel)?.name || models[0]?.name || ''
  const [model, setModel] = useState(initialModel)
  // วันนัด: 'call' = ให้เซลส์โทรนัด (ค่าเริ่มต้น ไม่ต้องเลือกอะไร) · 'other' = เปิดช่องเลือกวันเอง · อื่นๆ = key ของ dayOpts
  const [dayOpts, setDayOpts] = useState<DayOpt[]>([])
  const [day, setDay] = useState('call')
  const [otherDate, setOtherDate] = useState('')
  useEffect(() => setDayOpts(buildDayOptions()), []) // คำนวณฝั่ง client กัน hydration mismatch (server เป็น UTC)
  const pickedDate = day === 'other' ? otherDate : dayOpts.find((o) => o.key === day)?.date || ''
  const [state, setState] = useState<'idle' | 'sending' | 'done' | 'error'>('idle')
  const [message, setMessage] = useState('')

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setState('sending')
    const fd = new FormData(e.currentTarget)
    const appointmentDate = pickedDate // YYYY-MM-DD หรือ '' = ให้เซลส์โทรนัด
    const appointmentSlot = appointmentDate ? String(fd.get('slot') || '') : ''
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

  const id = (k: string) => `${uid}-${k}`
  return (
    <form className="form" onSubmit={onSubmit}>
      {compact ? null : (
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
      )}

      <div className="row">
        <div className="field">
          <label htmlFor={id('name')}>ชื่อ</label>
          <input id={id('name')} name="customerName" type="text" required placeholder="ชื่อ" autoComplete="name" />
        </div>
        <div className="field">
          <label htmlFor={id('phone')}>เบอร์โทร</label>
          <input id={id('phone')} name="phone" type="tel" required inputMode="tel" pattern="[0-9\-\s+]{9,20}" placeholder="08x-xxx-xxxx" autoComplete="tel" />
        </div>
      </div>

      <div className="field">
        <label htmlFor={id('branch')}>สาขาที่สะดวก</label>
        <select id={id('branch')} name="branch" defaultValue={defaultBranch || branches[0]?.name}>
          {branches.map((b) => (
            <option key={b.id} value={b.name}>BYD Hi-Class {b.name}</option>
          ))}
        </select>
      </div>

      <div className="field">
        <span style={{ fontSize: 13, fontWeight: 600 }}>สะดวกวันไหน</span>
        <div className="chips" role="radiogroup" aria-label="วันที่สะดวก" style={{ flexWrap: 'wrap', overflow: 'visible' }}>
          {[{ key: 'call', label: 'ให้เซลส์โทรนัด' }, ...dayOpts, { key: 'other', label: 'วันอื่น' }].map((o) => (
            <button
              key={o.key}
              type="button"
              className={`chip${day === o.key ? ' on' : ''}`}
              onClick={() => setDay(o.key)}
              role="radio"
              aria-checked={day === o.key}
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>

      {day !== 'call' ? (
        <div className="row">
          {day === 'other' ? (
            <div className="field">
              <label htmlFor={id('date')}>เลือกวัน</label>
              <input id={id('date')} type="date" required value={otherDate} onChange={(e) => setOtherDate(e.target.value)} min={dayOpts[0]?.date} />
            </div>
          ) : null}
          <div className="field">
            <label htmlFor={id('slot')}>ช่วงเวลา</label>
            <select id={id('slot')} name="slot" defaultValue={SLOTS[1]}>
              {SLOTS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>
      ) : null}

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

      {compact ? null : (
        <>
          <div className="divider">หรือคุยกับเราตอนนี้</div>
          <div className="row" style={{ gridTemplateColumns: settings.lineUrl ? '1fr 1fr' : '1fr' }}>
            {settings.lineUrl ? (
              <a className="btn btn-green" href={settings.lineUrl} target="_blank" rel="noopener noreferrer">
                <Icon name="chat" size={18} color="#fff" />แอด LINE
              </a>
            ) : null}
            <CallPicker branches={branches} title="โทรคุยกับทีมขาย — เลือกสาขา" />
          </div>
        </>
      )}
    </form>
  )
}
