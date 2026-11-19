'use client'

import { useEffect, useRef, useState } from 'react'
import BotTrap from './BotTrap'
import Icon from './Icons'

const MAX_PHOTOS = 6
const MAX_SIDE = 1800
const JPEG_Q = 0.82
const DEPTS = [
  { value: 'sales', label: 'ฝ่ายขาย' },
  { value: 'service', label: 'ฝ่ายบริการ' },
]
const REMEMBER = 'smart-report-me'

type Photo = { id: number; file: File; preview: string }

/** ย่อรูปในเบราว์เซอร์ ด้านยาวไม่เกิน 1800px (ภาพหน้าจอยังอ่านตัวหนังสือได้) แล้วเป็น jpeg */
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
  ctx.fillStyle = '#fff'
  ctx.fillRect(0, 0, w, h)
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

type Me = { reporterName?: string; position?: string; contact?: string; branch?: string; dept?: string }

export default function SmartReportForm({ branches }: { branches: string[] }) {
  const [dept, setDept] = useState('')
  const [me, setMe] = useState<Me>({})
  const [photos, setPhotos] = useState<Photo[]>([])
  const [state, setState] = useState<'idle' | 'sending' | 'done' | 'error'>('idle')
  const [progress, setProgress] = useState('')
  const [message, setMessage] = useState('')
  const [ticket, setTicket] = useState('')
  const [formKey, setFormKey] = useState(0)
  const seq = useRef(0)
  const fileInput = useRef<HTMLInputElement>(null)

  // จำชื่อ/สาขา/ฝ่ายไว้ในเครื่อง แจ้งครั้งต่อไปไม่ต้องพิมพ์ใหม่
  useEffect(() => {
    try {
      const m = JSON.parse(localStorage.getItem(REMEMBER) || '{}') as Me
      setMe(m)
      if (m.dept) setDept(m.dept)
    } catch {}
  }, [])

  // วางภาพหน้าจอ (Ctrl+V) ได้เลยบนคอม
  useEffect(() => {
    function onPaste(e: ClipboardEvent) {
      const files = Array.from(e.clipboardData?.files || []).filter((f) => f.type.startsWith('image/'))
      if (files.length) addFiles(files)
    }
    window.addEventListener('paste', onPaste)
    return () => window.removeEventListener('paste', onPaste)
  })

  function addFiles(list: File[] | FileList | null) {
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
    if (!dept) {
      setState('error')
      setMessage('กรุณาเลือกฝ่าย')
      return
    }
    setState('sending')
    setMessage('')
    const fd = new FormData(e.currentTarget)
    try {
      const draft = newDraftId()
      const paths: string[] = []
      for (let i = 0; i < photos.length; i++) {
        setProgress(`กำลังส่งรูป ${i + 1}/${photos.length}…`)
        const blob = await compress(photos[i].file)
        const body = new FormData()
        body.set('draft', draft)
        body.set('n', String(i + 1))
        body.set('file', blob, `${i + 1}.jpg`)
        const r = await fetch('/api/smart-report/photo', { method: 'POST', body })
        const j = await r.json().catch(() => ({}))
        if (!r.ok) throw new Error(j?.message || 'ส่งรูปไม่สำเร็จ')
        paths.push(j.path)
      }
      setProgress('กำลังบันทึก…')
      const data = {
        dept,
        reporterName: String(fd.get('reporterName') || ''),
        position: String(fd.get('position') || ''),
        contact: String(fd.get('contact') || ''),
        branch: String(fd.get('branch') || ''),
        title: fd.get('title'),
        menu: fd.get('menu'),
        detail: fd.get('detail'),
        photos: paths,
        website: fd.get('website'),
        _t: fd.get('_t'),
      }
      const r = await fetch('/api/smart-report', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
      const j = await r.json().catch(() => ({}))
      if (!r.ok) throw new Error(j?.message || 'ส่งไม่สำเร็จ')
      const keep: Me = { reporterName: data.reporterName, position: data.position, contact: data.contact, branch: data.branch, dept }
      try {
        localStorage.setItem(REMEMBER, JSON.stringify(keep))
      } catch {}
      setMe(keep)
      photos.forEach((p) => URL.revokeObjectURL(p.preview))
      setPhotos([])
      setTicket(j?.ticket || '')
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
        <h3 style={{ fontSize: 22 }}>ส่งเรื่องแล้ว{ticket && ticket !== '-' ? ` เลขที่ ${ticket}` : ''}</h3>
        <p className="mute">ผู้ดูแลระบบ SMART ได้รับเรื่องแล้ว จะตรวจสอบและแจ้งกลับในกลุ่ม LINE</p>
        <button
          type="button"
          className="btn btn-dark"
          onClick={() => {
            setState('idle')
            setTicket('')
            setFormKey((k) => k + 1)
          }}
        >
          แจ้งปัญหาเรื่องอื่นต่อ
        </button>
      </div>
    )
  }

  return (
    <form key={formKey} className="form" onSubmit={onSubmit} style={{ position: 'relative' }}>
      <BotTrap />
      <div className="field">
        <label>ฝ่าย</label>
        <div className="chips" role="radiogroup" aria-label="ฝ่าย">
          {DEPTS.map((d) => (
            <button key={d.value} type="button" role="radio" aria-checked={dept === d.value} className={`chip${dept === d.value ? ' on' : ''}`} onClick={() => setDept(d.value)} style={{ height: 44, padding: '0 22px', fontSize: 15 }}>
              {d.label}
            </button>
          ))}
        </div>
      </div>
      <div className="row">
        <div className="field">
          <label htmlFor="reporterName">ชื่อผู้แจ้ง</label>
          <input id="reporterName" name="reporterName" type="text" required minLength={2} maxLength={80} defaultValue={me.reporterName || ''} key={`n${me.reporterName || ''}`} placeholder="ชื่อ หรือ ชื่อเล่น" />
        </div>
        <div className="field">
          <label htmlFor="position">ตำแหน่ง</label>
          <input id="position" name="position" type="text" required minLength={2} maxLength={80} defaultValue={me.position || ''} key={`p${me.position || ''}`} placeholder="เช่น ที่ปรึกษาการขาย, SA, ธุรการ" />
        </div>
      </div>
      <div className="row">
        <div className="field">
          <label htmlFor="branch">สาขา</label>
          <select id="branch" name="branch" defaultValue={me.branch || ''} key={`b${me.branch || ''}`}>
            <option value="">ไม่ระบุ</option>
            {branches.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="contact">เบอร์โทร หรือ LINE (ไม่บังคับ)</label>
          <input id="contact" name="contact" type="text" maxLength={60} defaultValue={me.contact || ''} key={`c${me.contact || ''}`} placeholder="ไว้ให้ผู้ดูแลระบบติดต่อกลับ" />
        </div>
      </div>
      <div className="field">
        <label htmlFor="title">ปัญหาที่พบ</label>
        <input id="title" name="title" type="text" required minLength={3} maxLength={150} placeholder="เช่น บันทึกใบจองไม่ได้ ขึ้น error" />
      </div>
      <div className="field">
        <label htmlFor="menu">เมนู หรือ หน้าจอที่เจอปัญหา (ไม่บังคับ)</label>
        <input id="menu" name="menu" type="text" maxLength={150} placeholder="เช่น ใบจอง > สร้างใบจองใหม่" />
      </div>
      <div className="field">
        <label htmlFor="detail">คำอธิบาย</label>
        <textarea id="detail" name="detail" required minLength={5} maxLength={4000} rows={5} placeholder="ทำอะไรอยู่ กดปุ่มไหน แล้วเกิดอะไรขึ้น เจอทุกครั้งหรือบางครั้ง" />
      </div>
      <div className="field">
        <label>รูปภาพ หรือ ภาพหน้าจอ (ไม่เกิน {MAX_PHOTOS} รูป)</label>
        <p className="mute" style={{ fontSize: 13, margin: '2px 0 8px' }}>บนคอมกด Ctrl+V วางภาพหน้าจอได้เลย</p>
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
      {state === 'error' && message ? <p style={{ color: 'var(--red)', margin: 0 }}>{message}</p> : null}
      <button type="submit" className="btn btn-red btn-lg btn-block" disabled={state === 'sending'}>
        {state === 'sending' ? progress || 'กำลังส่ง…' : 'ส่งเรื่อง'}
      </button>
    </form>
  )
}
