'use client'

import { useState } from 'react'
import Icon from './Icons'
import BotTrap from './BotTrap'
import {
  ABSENT, ACK_COST, ACK_OUTSIDER, ALCOHOL, ALCOHOL_TYPES, ATTEND_HELP, ATTEND_NO, ATTEND_YES,
  DEPARTMENTS, OTHER, OUTING_BRANCHES, RELIGIONS, TRANSPORTS,
} from '@/lib/outing'

const req = <span style={{ color: 'var(--red)' }}>*</span>
const groupTitle: React.CSSProperties = { fontSize: 13, fontWeight: 600 }
const checks: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: 8 }
const opt: React.CSSProperties = { fontSize: 14, color: 'var(--ink)', alignItems: 'center' }
const box: React.CSSProperties = { border: '1px solid var(--line)', borderRadius: 12, padding: 14, background: 'var(--soft)', display: 'grid', gap: 8 }

/** ตัวเลือกแบบวงกลม + "อื่นๆ" พิมพ์เอง (เหมือน Google Form เดิม) */
function RadioOther({ name, label, options, value, other, onValue, onOther }: {
  name: string; label: string; options: readonly string[]; value: string; other: string; onValue: (v: string) => void; onOther: (v: string) => void
}) {
  return (
    <div className="field">
      <span style={groupTitle}>{label} {req}</span>
      <div style={checks}>
        {options.map((x) => (
          <label key={x} className="check" style={opt}>
            <input type="radio" name={name} value={x} required checked={value === x} onChange={() => onValue(x)} />
            <span>{x}</span>
          </label>
        ))}
        <label className="check" style={opt}>
          <input type="radio" name={name} value={OTHER} required checked={value === OTHER} onChange={() => onValue(OTHER)} />
          <span>{OTHER}</span>
        </label>
      </div>
      {value === OTHER ? <input type="text" required maxLength={60} value={other} onChange={(e) => onOther(e.target.value)} placeholder="โปรดระบุ" aria-label={`${label} (อื่นๆ)`} /> : null}
    </div>
  )
}

/** แบบสำรวจเข้าร่วมกิจกรรม Outing ปีใหม่ 2570 → /api/outing */
export default function OutingForm() {
  const [state, setState] = useState<'idle' | 'sending' | 'done' | 'error'>('idle')
  const [message, setMessage] = useState('')
  const [dept, setDept] = useState('')
  const [deptOther, setDeptOther] = useState('')
  const [branch, setBranch] = useState('')
  const [branchOther, setBranchOther] = useState('')
  const [attend, setAttend] = useState<'' | 'yes' | 'no'>('')
  const [religion, setReligion] = useState('')
  const [religionOther, setReligionOther] = useState('')
  const [alcohol, setAlcohol] = useState('')
  const [sentAttend, setSentAttend] = useState(false)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (state === 'sending') return
    const fd = new FormData(e.currentTarget)
    const pick = (v: string, o: string) => (v === OTHER ? o.trim() : v)
    setState('sending')
    setMessage('')
    try {
      const res = await fetch('/api/outing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: fd.get('fullName'),
          department: pick(dept, deptOther),
          position: fd.get('position'),
          branch: pick(branch, branchOther),
          attend: attend === 'yes',
          religion: pick(religion, religionOther),
          foodLimit: fd.get('foodLimit'),
          transport: fd.get('transport'),
          alcohol,
          alcoholType: fd.get('alcoholType'),
          ackNoOutsider: fd.get('ackNoOutsider') === 'on',
          ackCost: fd.get('ackCost') === 'on',
          ackAbsent: fd.get('ackAbsent') === 'on',
          absentReason: fd.get('absentReason'),
          hp: fd.get('website') || '',
          t: fd.get('_t') || '',
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data?.message || 'ส่งไม่สำเร็จ')
      setSentAttend(attend === 'yes')
      setState('done')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (err) {
      setState('error')
      setMessage(err instanceof Error ? err.message : 'ส่งไม่สำเร็จ')
    }
  }

  if (state === 'done') {
    return (
      <div style={{ padding: 8, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <span className="branch-ico" style={{ width: 48, height: 48, borderRadius: 14, background: 'var(--green-soft)', color: 'var(--green-dark)', display: 'grid', placeItems: 'center' }}>
          <Icon name="check" size={26} sw={2.5} />
        </span>
        <h3 style={{ fontSize: 22, margin: 0 }}>ส่งคำตอบเรียบร้อย ขอบคุณครับ</h3>
        <p className="mute" style={{ margin: 0 }}>
          {sentAttend ? 'บันทึกการลงทะเบียนเข้าร่วมกิจกรรมแล้ว แล้วพบกันที่หัวหิน' : 'บันทึกว่าไม่สะดวกเข้าร่วมกิจกรรม และรับทราบเงื่อนไขของบริษัทแล้ว'}
        </p>
        <p className="mute" style={{ margin: 0, fontSize: 13 }}>ถ้าต้องการแก้คำตอบ ให้กรอกใหม่อีกครั้งด้วยชื่อเดิม ระบบจะใช้คำตอบล่าสุด</p>
      </div>
    )
  }

  return (
    <form className="form" onSubmit={onSubmit} style={{ position: 'relative' }}>
      <BotTrap />

      <h3 style={{ fontSize: 18 }}>1. ข้อมูลผู้กรอก</h3>
      <div className="field">
        <label htmlFor="fullName">คุณชื่ออะไร (ระบุคำนำหน้า ชื่อจริง-นามสกุล) {req}</label>
        <input id="fullName" name="fullName" type="text" required minLength={2} maxLength={120} autoComplete="name" placeholder="เช่น นางสาวสมหญิง ใจดี" />
      </div>
      <RadioOther name="department" label="แผนก" options={DEPARTMENTS} value={dept} other={deptOther} onValue={setDept} onOther={setDeptOther} />
      <div className="field">
        <label htmlFor="position">ตำแหน่ง {req}</label>
        <input id="position" name="position" type="text" required maxLength={80} />
      </div>
      <RadioOther name="branch" label="สาขา" options={OUTING_BRANCHES} value={branch} other={branchOther} onValue={setBranch} onOther={setBranchOther} />

      <h3 style={{ fontSize: 18, marginTop: 8 }}>2. ลงทะเบียนเข้าร่วมกิจกรรม Outing ปีใหม่ 2570</h3>
      <div className="field">
        <span style={groupTitle}>คุณจะเข้าร่วมกิจกรรมหรือไม่ {req}</span>
        <p className="mute" style={{ margin: 0, fontSize: 13 }}>{ATTEND_HELP}</p>
        <div style={checks}>
          <label className="check" style={opt}>
            <input type="radio" name="attend" value="yes" required checked={attend === 'yes'} onChange={() => setAttend('yes')} />
            <span>{ATTEND_YES}</span>
          </label>
          <label className="check" style={opt}>
            <input type="radio" name="attend" value="no" required checked={attend === 'no'} onChange={() => setAttend('no')} />
            <span>{ATTEND_NO}</span>
          </label>
        </div>
      </div>

      {attend === 'yes' ? (
        <>
          <h3 style={{ fontSize: 18, marginTop: 8 }}>3. ข้อมูลสำหรับจัดเตรียมงาน</h3>
          <RadioOther name="religion" label="ศาสนา" options={RELIGIONS} value={religion} other={religionOther} onValue={setReligion} onOther={setReligionOther} />
          <div className="field">
            <label htmlFor="foodLimit">คุณแพ้หรือมีข้อจำกัดด้านอาหารไหม {req}</label>
            <input id="foodLimit" name="foodLimit" type="text" required maxLength={500} placeholder="ไม่มีให้พิมพ์ว่า ไม่มี" />
          </div>
          <div className="field">
            <span style={groupTitle}>คุณอยากเดินทางโดยรถอะไร {req}</span>
            <div style={checks}>
              {TRANSPORTS.map((x) => (
                <label key={x} className="check" style={opt}>
                  <input type="radio" name="transport" value={x} required />
                  <span>{x}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="field">
            <span style={groupTitle}>คุณดื่มเครื่องดื่มแอลกอฮอล์ไหม {req}</span>
            <div style={checks}>
              {ALCOHOL.map((x) => (
                <label key={x} className="check" style={opt}>
                  <input type="radio" name="alcohol" value={x} required checked={alcohol === x} onChange={() => setAlcohol(x)} />
                  <span>{x}</span>
                </label>
              ))}
            </div>
          </div>
          {alcohol === 'ดื่ม' ? (
            <div className="field">
              <span style={groupTitle}>ประเภทของแอลกอฮอล์ {req}</span>
              <div style={checks}>
                {ALCOHOL_TYPES.map((x) => (
                  <label key={x} className="check" style={opt}>
                    <input type="radio" name="alcoholType" value={x} required />
                    <span>{x}</span>
                  </label>
                ))}
              </div>
            </div>
          ) : null}

          <h3 style={{ fontSize: 18, marginTop: 8 }}>4. รับทราบข้อตกลง</h3>
          <div style={box}>
            <b style={{ fontSize: 14 }}>{ACK_OUTSIDER.title}</b>
            <span style={{ fontSize: 14 }}>{ACK_OUTSIDER.text}</span>
            <label className="check" style={opt}>
              <input type="checkbox" name="ackNoOutsider" required />
              <span>{ACK_OUTSIDER.label} {req}</span>
            </label>
          </div>
          <div style={box}>
            <b style={{ fontSize: 14 }}>{ACK_COST.title}</b>
            <span style={{ fontSize: 14 }}>{ACK_COST.text}</span>
            <label className="check" style={opt}>
              <input type="checkbox" name="ackCost" required />
              <span>{ACK_COST.label} {req}</span>
            </label>
          </div>
        </>
      ) : null}

      {attend === 'no' ? (
        <>
          <h3 style={{ fontSize: 18, marginTop: 8 }}>3. {ABSENT.title}</h3>
          <div style={box}>
            <span style={{ fontSize: 14 }}>{ABSENT.intro}</span>
            <ol style={{ margin: 0, paddingLeft: 20, fontSize: 14, display: 'grid', gap: 4 }}>
              {ABSENT.terms.map((t) => <li key={t}>{t}</li>)}
            </ol>
            <b style={{ fontSize: 14 }}>{ABSENT.ackTitle}</b>
            <label className="check" style={opt}>
              <input type="checkbox" name="ackAbsent" required />
              <span>{ABSENT.ackLabel} {req}</span>
            </label>
          </div>
          <div className="field">
            <label htmlFor="absentReason">โปรดระบุเหตุผล ที่ไม่สามารถร่วมกิจกรรมได้ {req}</label>
            <textarea id="absentReason" name="absentReason" rows={3} required maxLength={1000} />
          </div>
        </>
      ) : null}

      <button className="btn btn-red btn-lg btn-block" type="submit" disabled={state === 'sending' || !attend}>
        {state === 'sending' ? 'กำลังส่ง…' : 'ส่งคำตอบ'}
        {state !== 'sending' ? <Icon name="arrow" size={20} color="#fff" /> : null}
      </button>
      {!attend ? <p className="mute" style={{ fontSize: 13, textAlign: 'center' }}>เลือกว่าจะเข้าร่วมหรือไม่ก่อน แล้วจะมีคำถามส่วนถัดไป</p> : null}

      {state === 'error' ? <div className="notice err">{message}</div> : null}
    </form>
  )
}
