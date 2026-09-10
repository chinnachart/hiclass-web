'use client'

import { useState } from 'react'
import Link from 'next/link'
import Icon from './Icons'
import type { Branch, CarModel, SiteSettings } from '@/lib/types'
import { CALLBACK_NOTE, CONFIRM_NOTE, SERVICE_TYPES, TIME_SLOTS } from '@/lib/serviceAppt'

type Props = {
  models: CarModel[]
  branches: Branch[] // เฉพาะสาขาที่มีศูนย์บริการ (กรองมาจากหน้า)
  settings: SiteSettings
  defaultBranch?: string // code
}

const OTHER_MODEL = 'รุ่นอื่น'

type Summary = {
  ref: string
  at: string
  customerName: string
  phone: string
  email: string
  model: string
  subModel: string
  plate: string
  vin: string
  mileage: string
  branchName: string
  serviceType: string
  timeSlot: string
  detail: string
}

/** ฟอร์มนัดหมายศูนย์บริการ (แทน WordPress form เดิม /services/#appointment) → Cinco service_appointments */
export default function ServiceApptForm({ models, branches, settings, defaultBranch }: Props) {
  const [state, setState] = useState<'idle' | 'sending' | 'done' | 'error'>('idle')
  const [message, setMessage] = useState('')
  const [summary, setSummary] = useState<Summary | null>(null)
  const [otherModel, setOtherModel] = useState(false)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setState('sending')
    const fd = new FormData(e.currentTarget)
    const v = (k: string) => String(fd.get(k) || '').trim()
    const modelSel = v('model')
    const model = modelSel === OTHER_MODEL ? v('modelOther') : modelSel
    const branchCode = v('branch')
    const branchName = branches.find((b) => b.code === branchCode)?.name || branchCode
    try {
      const res = await fetch('/api/service-appointment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: v('customerName'),
          phone: v('phone'),
          email: v('email'),
          model,
          subModel: v('subModel'),
          plate: v('plate'),
          vin: v('vin'),
          mileage: v('mileage'),
          branch: branchCode,
          serviceType: v('serviceType'),
          timeSlot: v('timeSlot'),
          detail: v('detail'),
          consent: fd.get('consent') === 'on',
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.message || 'ส่งไม่สำเร็จ')
      setSummary({
        ref: String(data.ref || ''),
        at: new Date().toLocaleString('th-TH', { dateStyle: 'medium', timeStyle: 'short' }),
        customerName: v('customerName'),
        phone: v('phone'),
        email: v('email'),
        model,
        subModel: v('subModel'),
        plate: v('plate'),
        vin: v('vin'),
        mileage: v('mileage'),
        branchName,
        serviceType: v('serviceType'),
        timeSlot: v('timeSlot'),
        detail: v('detail'),
      })
      setState('done')
      window.scrollTo({ top: (document.getElementById('appointment')?.offsetTop || 0) - 80, behavior: 'smooth' })
    } catch (err) {
      setState('error')
      setMessage(err instanceof Error ? err.message : 'ส่งไม่สำเร็จ')
    }
  }

  if (state === 'done' && summary) {
    const rows: [string, string][] = [
      ['ชื่อ', summary.customerName],
      ['เบอร์โทร', summary.phone],
      ['อีเมล', summary.email],
      ['รุ่นรถ', [summary.model, summary.subModel].filter(Boolean).join(' ')],
      ['ทะเบียน', summary.plate],
      ['VIN', summary.vin],
      ['เลขไมล์', summary.mileage ? `${Number(summary.mileage).toLocaleString('th-TH')} กม.` : ''],
      ['สาขา', summary.branchName],
      ['ประเภทงาน', summary.serviceType],
      ['ช่วงเวลาที่สะดวก', summary.timeSlot],
      ['รายละเอียดเพิ่มเติม', summary.detail],
    ]
    return (
      <div className="card" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 14 }}>
        <span className="branch-ico" style={{ width: 48, height: 48, borderRadius: 14, background: 'var(--green-soft)', color: 'var(--green-dark)' }}>
          <Icon name="check" size={26} sw={2.5} />
        </span>
        <div>
          <p className="kicker" style={{ marginBottom: 4 }}>ได้รับข้อมูลนัดหมายแล้ว</p>
          <h3 style={{ fontSize: 22 }}>เลขอ้างอิง {summary.ref}</h3>
          <p className="mute" style={{ fontSize: 13 }}>ส่งเมื่อ {summary.at}</p>
        </div>
        <div className="notice warn">
          <strong>กรุณาแคปหน้าจอนี้ไว้</strong> เพื่อใช้ยืนยันกับเจ้าหน้าที่ · {CALLBACK_NOTE}
          <br />
          {CONFIRM_NOTE}
        </div>
        <dl className="appt-summary">
          {rows.filter(([, val]) => val).map(([k, val]) => (
            <div key={k}>
              <dt>{k}</dt>
              <dd>{val}</dd>
            </div>
          ))}
        </dl>
        <div className="grid-2">
          {settings.lineUrl ? (
            <a className="btn btn-green" href={settings.lineUrl} target="_blank" rel="noopener noreferrer">
              <Icon name="chat" size={18} color="#fff" />ส่งภาพหน้าจอให้เราทาง LINE
            </a>
          ) : null}
          <button className="btn btn-outline" type="button" onClick={() => { setState('idle'); setSummary(null) }}>
            นัดหมายอีกรายการ
          </button>
        </div>
      </div>
    )
  }

  return (
    <form className="form" onSubmit={onSubmit}>
      <div className="row">
        <div className="field">
          <label htmlFor="sa-name">ชื่อ-นามสกุล <span style={{ color: 'var(--red)' }}>*</span></label>
          <input id="sa-name" name="customerName" type="text" required placeholder="ชื่อ-นามสกุล" autoComplete="name" />
        </div>
        <div className="field">
          <label htmlFor="sa-phone">เบอร์โทร <span style={{ color: 'var(--red)' }}>*</span></label>
          <input id="sa-phone" name="phone" type="tel" required inputMode="tel" pattern="[0-9\-\s+]{9,20}" placeholder="08x-xxx-xxxx" autoComplete="tel" />
        </div>
      </div>
      <div className="field">
        <label htmlFor="sa-email">อีเมล</label>
        <input id="sa-email" name="email" type="email" placeholder="name@example.com (ไม่บังคับ)" autoComplete="email" />
      </div>

      <div className="row">
        <div className="field">
          <label htmlFor="sa-model">รุ่นรถ <span style={{ color: 'var(--red)' }}>*</span></label>
          <select id="sa-model" name="model" required defaultValue="" onChange={(e) => setOtherModel(e.target.value === OTHER_MODEL)}>
            <option value="" disabled>เลือกรุ่น</option>
            {models.map((m) => <option key={m.id} value={m.name}>BYD {m.name}</option>)}
            <option value={OTHER_MODEL}>{OTHER_MODEL}</option>
          </select>
          {otherModel ? <input name="modelOther" type="text" required placeholder="พิมพ์รุ่นรถ" style={{ marginTop: 6 }} /> : null}
        </div>
        <div className="field">
          <label htmlFor="sa-sub">รุ่นย่อย</label>
          <input id="sa-sub" name="subModel" type="text" placeholder="เช่น Standard / Extended / Premium" />
        </div>
      </div>

      <div className="row">
        <div className="field">
          <label htmlFor="sa-plate">เลขทะเบียน <span style={{ color: 'var(--red)' }}>*</span></label>
          <input id="sa-plate" name="plate" type="text" required placeholder="เช่น 7ขฐ6427" />
        </div>
        <div className="field">
          <label htmlFor="sa-mileage">เลขไมล์ปัจจุบัน (กม.)</label>
          <input id="sa-mileage" name="mileage" type="text" inputMode="numeric" placeholder="เช่น 20000" />
        </div>
      </div>
      <div className="field">
        <label htmlFor="sa-vin">เลขตัวถัง (VIN)</label>
        <input id="sa-vin" name="vin" type="text" placeholder="17 หลัก ดูได้จากเล่มทะเบียน (ไม่บังคับ)" autoCapitalize="characters" />
      </div>

      <div className="field">
        <span style={{ fontSize: 13, fontWeight: 600 }}>สาขาที่จะเข้ารับบริการ <span style={{ color: 'var(--red)' }}>*</span></span>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {branches.map((b, i) => (
            <label key={b.id} className="check" style={{ fontSize: 14, color: 'var(--ink)', alignItems: 'center' }}>
              <input type="radio" name="branch" value={b.code} required defaultChecked={defaultBranch ? b.code === defaultBranch : i === 0} />
              <span>สาขา {b.name}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="field">
        <span style={{ fontSize: 13, fontWeight: 600 }}>ประเภทงาน <span style={{ color: 'var(--red)' }}>*</span></span>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {SERVICE_TYPES.map((t, i) => (
            <label key={t} className="check" style={{ fontSize: 14, color: 'var(--ink)', alignItems: 'center' }}>
              <input type="radio" name="serviceType" value={t} required defaultChecked={i === 0} />
              <span>{t}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="field">
        <span style={{ fontSize: 13, fontWeight: 600 }}>ช่วงเวลาที่สะดวกให้ติดต่อกลับ</span>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {TIME_SLOTS.map((t, i) => (
            <label key={t} className="check" style={{ fontSize: 14, color: 'var(--ink)', alignItems: 'center' }}>
              <input type="radio" name="timeSlot" value={t} defaultChecked={i === 0} />
              <span>{t}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="field">
        <label htmlFor="sa-detail">รายละเอียดเพิ่มเติม</label>
        <textarea id="sa-detail" name="detail" maxLength={1000} placeholder="เช่น อาการที่พบ วันที่สะดวกเข้ารับบริการ (ไม่บังคับ)" />
      </div>

      <label className="check" style={{ fontSize: 13, color: 'var(--ink)' }}>
        <input type="checkbox" name="consent" required />
        <span>
          ข้าพเจ้ายอมรับข้อตกลงและเงื่อนไขการใช้งาน และยินยอมให้ บริษัท ไฮคลาส อีวี คาร์ จำกัด ใช้ข้อมูลนี้เพื่อการนัดหมายและติดต่อกลับ ตาม{' '}
          <Link href="/privacy" target="_blank" style={{ textDecoration: 'underline' }}>นโยบายความเป็นส่วนตัว</Link>
          {' '}<span style={{ color: 'var(--red)' }}>*</span>
        </span>
      </label>

      <button className="btn btn-red btn-lg btn-block" type="submit" disabled={state === 'sending'}>
        {state === 'sending' ? 'กำลังส่ง…' : 'ส่งข้อมูลนัดหมาย'}
        {state !== 'sending' ? <Icon name="arrow" size={20} color="#fff" /> : null}
      </button>
      <p className="mute" style={{ fontSize: 12 }}>{CALLBACK_NOTE} {CONFIRM_NOTE}</p>

      {state === 'error' ? <div className="notice err">{message} — รบกวนลองใหม่อีกครั้ง</div> : null}
    </form>
  )
}
