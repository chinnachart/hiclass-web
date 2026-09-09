'use client'

import { useRef, useState } from 'react'
import Icon from './Icons'
import type { Branch, CarModel, SiteSettings } from '@/lib/types'

type Props = { models: CarModel[]; branches: Branch[]; settings: SiteSettings }

const MAX_PHOTOS = 8
const MAX_SIDE = 1600
const JPEG_Q = 0.8

type Photo = { id: number; file: File; preview: string }

/** ย่อรูปในเบราว์เซอร์ให้ด้านยาวไม่เกิน 1600px แล้วเป็น jpeg — รูปจากมือถือ 4–8MB → ~300KB */
async function compress(file: File): Promise<Blob> {
  const bmp = await createImageBitmap(file).catch(() => null)
  if (!bmp) return file
  const scale = Math.min(1, MAX_SIDE / Math.max(bmp.width, bmp.height))
  const w = Math.round(bmp.width * scale)
  const h = Math.round(bmp.height * scale)
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  const ctx = c.getContext('2d')
  if (!ctx) return file
  ctx.drawImage(bmp, 0, 0, w, h)
  bmp.close?.()
  return await new Promise<Blob>((res) => c.toBlob((b) => res(b || file), 'image/jpeg', JPEG_Q))
}

const newDraftId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (ch) => {
        const r = (Math.random() * 16) | 0
        return (ch === 'x' ? r : (r & 0x3) | 0x8).toString(16)
      })

export default function TradeInForm({ models, branches, settings }: Props) {
  const [photos, setPhotos] = useState<Photo[]>([])
  const [interested, setInterested] = useState('')
  const [state, setState] = useState<'idle' | 'sending' | 'done' | 'error'>('idle')
  const [progress, setProgress] = useState('')
  const [message, setMessage] = useState('')
  const seq = useRef(0)
  const fileInput = useRef<HTMLInputElement>(null)

  function addFiles(list: FileList | null) {
    if (!list) return
    const room = MAX_PHOTOS - photos.length
    const add = Array.from(list)
      .filter((f) => f.type.startsWith('image/'))
      .slice(0, Math.max(0, room))
      .map((file) => ({ id: ++seq.current, file, preview: URL.createObjectURL(file) }))
    if (add.length) setPhotos((p) => [...p, ...add])
    if (fileInput.current) fileInput.current.value = ''
  }
  function removePhoto(id: number) {
    setPhotos((p) => {
      const x = p.find((q) => q.id === id)
      if (x) URL.revokeObjectURL(x.preview)
      return p.filter((q) => q.id !== id)
    })
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (state === 'sending') return
    setState('sending')
    setMessage('')
    const fd = new FormData(e.currentTarget)
    try {
      // 1) รูปทีละใบ (บีบก่อน) → ได้ path
      const draft = newDraftId()
      const paths: string[] = []
      for (let i = 0; i < photos.length; i++) {
        setProgress(`กำลังส่งรูป ${i + 1}/${photos.length}…`)
        const blob = await compress(photos[i].file)
        const body = new FormData()
        body.set('draft', draft)
        body.set('n', String(i + 1))
        body.set('file', blob, `${i + 1}.jpg`)
        const r = await fetch('/api/trade-in/photo', { method: 'POST', body })
        const j = await r.json().catch(() => ({}))
        if (!r.ok) throw new Error(j?.message || 'ส่งรูปไม่สำเร็จ')
        paths.push(j.path)
      }
      // 2) ข้อมูลรถ
      setProgress('กำลังบันทึกข้อมูล…')
      const r = await fetch('/api/trade-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: fd.get('customerName'),
          phone: fd.get('phone'),
          lineId: fd.get('lineId'),
          brand: fd.get('brand'),
          model: fd.get('model'),
          subModel: fd.get('subModel'),
          year: fd.get('year'),
          mileage: fd.get('mileage'),
          color: fd.get('color'),
          plate: fd.get('plate'),
          plateProvince: fd.get('plateProvince'),
          conditionNote: fd.get('conditionNote'),
          expectedPrice: fd.get('expectedPrice'),
          interestedModel: interested,
          branch: fd.get('branch'),
          photos: paths,
        }),
      })
      const j = await r.json().catch(() => ({}))
      if (!r.ok) throw new Error(j?.message || 'ส่งไม่สำเร็จ')
      setMessage(j?.message || 'ขอบคุณที่ตอบกลับมา ระบบจะประเมินราคาเบื้องต้นภายใน 24 ชั่วโมง')
      setState('done')
    } catch (err) {
      setState('error')
      setMessage(err instanceof Error ? err.message : 'ส่งไม่สำเร็จ')
    } finally {
      setProgress('')
    }
  }

  if (state === 'done') {
    return (
      <div className="card" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <span className="branch-ico" style={{ width: 48, height: 48, borderRadius: 14, background: 'var(--green-soft)', color: 'var(--green-dark)' }}>
          <Icon name="check" size={26} sw={2.5} />
        </span>
        <h3 style={{ fontSize: 22 }}>ได้รับข้อมูลรถของคุณแล้ว</h3>
        <p className="mute">{message}</p>
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
      <div className="row">
        <div className="field">
          <label htmlFor="brand">ยี่ห้อรถเดิม</label>
          <input id="brand" name="brand" type="text" required placeholder="เช่น Toyota, Honda" />
        </div>
        <div className="field">
          <label htmlFor="model">รุ่น</label>
          <input id="model" name="model" type="text" required placeholder="เช่น Camry, Civic" />
        </div>
      </div>
      <div className="row">
        <div className="field">
          <label htmlFor="subModel">รุ่นย่อย</label>
          <input id="subModel" name="subModel" type="text" placeholder="เช่น 2.5 HV Premium" />
        </div>
        <div className="field">
          <label htmlFor="year">ปีรถ (ค.ศ.)</label>
          <input id="year" name="year" type="number" inputMode="numeric" min={1990} max={new Date().getFullYear() + 1} placeholder="เช่น 2019" />
        </div>
      </div>
      <div className="row">
        <div className="field">
          <label htmlFor="mileage">เลขไมล์ (กม.)</label>
          <input id="mileage" name="mileage" type="number" inputMode="numeric" min={0} placeholder="เช่น 85000" />
        </div>
        <div className="field">
          <label htmlFor="color">สี</label>
          <input id="color" name="color" type="text" placeholder="เช่น ขาว" />
        </div>
      </div>
      <div className="row">
        <div className="field">
          <label htmlFor="plate">ทะเบียน</label>
          <input id="plate" name="plate" type="text" placeholder="เช่น 1กข 1234" />
        </div>
        <div className="field">
          <label htmlFor="plateProvince">จังหวัดทะเบียน</label>
          <input id="plateProvince" name="plateProvince" type="text" placeholder="เช่น กรุงเทพมหานคร" />
        </div>
      </div>
      <div className="field">
        <label htmlFor="conditionNote">สภาพรถ / ประวัติ (ถ้ามี)</label>
        <textarea id="conditionNote" name="conditionNote" rows={3} placeholder="เช่น เจ้าของเดียว เข้าศูนย์ตลอด ไม่เคยชน ยังผ่อนอยู่ 12 งวด" />
      </div>
      <div className="field">
        <label htmlFor="expectedPrice">ราคาที่คาดหวัง (บาท)</label>
        <input id="expectedPrice" name="expectedPrice" type="number" inputMode="numeric" min={0} step={1000} placeholder="ไม่ระบุก็ได้" />
      </div>

      <div className="field">
        <span style={{ fontSize: 13, fontWeight: 600 }}>รูปรถ (สูงสุด {MAX_PHOTOS} รูป)</span>
        <p className="mute" style={{ fontSize: 13, margin: '2px 0 8px' }}>แนะนำ: ด้านหน้า ด้านหลัง ด้านข้าง ภายใน หน้าปัดเลขไมล์ และจุดที่มีตำหนิ</p>
        <div className="chips" aria-live="polite" style={{ flexWrap: 'wrap', overflow: 'visible' }}>
          {photos.map((p) => (
            <span key={p.id} style={{ position: 'relative', display: 'inline-block' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.preview} alt="" style={{ width: 84, height: 84, objectFit: 'cover', borderRadius: 10, border: '1px solid var(--line)' }} />
              <button
                type="button"
                aria-label="ลบรูป"
                onClick={() => removePhoto(p.id)}
                style={{ position: 'absolute', top: -6, right: -6, width: 22, height: 22, borderRadius: 11, border: 0, background: 'var(--red)', color: '#fff', fontSize: 14, lineHeight: '22px', cursor: 'pointer' }}
              >
                ×
              </button>
            </span>
          ))}
          {photos.length < MAX_PHOTOS ? (
            <button type="button" className="chip" onClick={() => fileInput.current?.click()} style={{ width: 84, height: 84, borderRadius: 10 }}>
              + เพิ่มรูป
            </button>
          ) : null}
        </div>
        <input ref={fileInput} type="file" accept="image/*" multiple hidden onChange={(e) => addFiles(e.target.files)} />
      </div>

      <div className="field">
        <span style={{ fontSize: 13, fontWeight: 600 }}>รุ่น BYD ที่สนใจ (ถ้ามี)</span>
        <div className="chips" role="radiogroup" aria-label="รุ่น BYD ที่สนใจ">
          {models.map((m) => (
            <button
              key={m.id}
              type="button"
              className={`chip${interested === m.name ? ' on' : ''}`}
              onClick={() => setInterested(interested === m.name ? '' : m.name)}
              role="radio"
              aria-checked={interested === m.name}
            >
              {m.name}
            </button>
          ))}
        </div>
      </div>
      <div className="field">
        <label htmlFor="branch">สาขาที่สะดวก</label>
        <select id="branch" name="branch" defaultValue="">
          <option value="">ยังไม่ระบุ</option>
          {branches.map((b) => (
            <option key={b.id} value={b.name}>BYD Hi-Class {b.name}</option>
          ))}
        </select>
      </div>

      <div className="row">
        <div className="field">
          <label htmlFor="customerName">ชื่อ</label>
          <input id="customerName" name="customerName" type="text" required placeholder="ชื่อ-นามสกุล" autoComplete="name" />
        </div>
        <div className="field">
          <label htmlFor="phone">เบอร์โทร</label>
          <input id="phone" name="phone" type="tel" required inputMode="tel" pattern="[0-9\-\s+]{9,20}" placeholder="08x-xxx-xxxx" autoComplete="tel" />
        </div>
      </div>
      <div className="field">
        <label htmlFor="lineId">LINE ID (ถ้ามี)</label>
        <input id="lineId" name="lineId" type="text" placeholder="สะดวกให้ติดต่อทาง LINE" />
      </div>

      <label className="check">
        <input type="checkbox" required defaultChecked />
        <span>ยินยอมให้ติดต่อกลับเพื่อประเมินราคารถ ข้อมูลและรูปใช้เพื่อการนี้เท่านั้น</span>
      </label>

      <button className="btn btn-red btn-lg btn-block" type="submit" disabled={state === 'sending'}>
        {state === 'sending' ? progress || 'กำลังส่ง…' : 'ส่งข้อมูลให้ประเมินราคา'}
        {state !== 'sending' ? <Icon name="arrow" size={20} color="#fff" /> : null}
      </button>

      {state === 'error' ? <div className="notice err">{message} — รบกวนลองใหม่ หรือติดต่อทาง LINE</div> : null}
    </form>
  )
}
