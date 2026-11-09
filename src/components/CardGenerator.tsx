'use client'

/**
 * นามบัตรออนไลน์ (/gen-card) — ภายในสำหรับพนักงาน ล็อกอินด้วยบัญชี Cinco
 * วาดด้วย canvas ในเบราว์เซอร์ทั้งหมด (ไม่อัปโหลดรูปขึ้นเซิร์ฟเวอร์) · ขนาด 1600×900 สำหรับแนะนำตัวใน Facebook
 * โทนสีตาม Cinco (แดงเข้ม #7f1d1d → #b91c1c) · ลายน้ำ "Powered by CnC" มุมขวาล่าง
 */

import { useCallback, useEffect, useRef, useState } from 'react'
import QRCode from 'qrcode'

type Profile = { name: string; nickname: string; branch: string; position: string; role: string }

const W = 1600
const H = 900
const RED = '#b91c1c'
const RED_DARK = '#7f1d1d'
const INK = '#1c1917'
const MUTE = '#57534e'

const BRANCHES = [
  { th: 'รัชดา', en: 'RATCHADA', label: 'สาขารัชดา' },
  { th: 'ลาดพร้าว', en: 'LADPRAO', label: 'สาขาลาดพร้าว' },
  { th: 'พระราม5', en: 'RAMA 5', label: 'สาขาพระราม 5' },
  { th: 'บองมาร์เช่', en: 'BON MARCHE', label: 'สาขาบองมาร์เช่' },
  { th: 'กาญจนาภิเษก', en: 'KANCHANAPHISEK', label: 'สาขากาญจนาภิเษก' },
  { th: 'เหม่งจ๋าย', en: 'MENG JAI', label: 'สาขาเหม่งจ๋าย' },
]
const POSITIONS = ['Sales Consultant', 'Sales Specialist', 'Senior Sales Specialist', 'Sales Supervisor', 'Sales Manager', 'Fleet Sales', 'Service Advisor']
const TAGLINES = [
  'รับประเมินราคารถคันเก่า',
  'นัดทดลองขับฟรี',
  'ดูแลตั้งแต่จองจนส่งมอบ',
  'ปรึกษาไฟแนนซ์ อนุมัติไว',
  'โปรแรงประจำเดือน ทักได้เลย',
  'ดูแลหลังการขายตลอดการใช้งาน',
]
const TAG_ICON: Record<string, string> = {
  car: 'M3 13l2-5a2 2 0 0 1 2-1h10a2 2 0 0 1 2 1l2 5v5h-2a2 2 0 0 1-4 0H9a2 2 0 0 1-4 0H3v-5z M3 13h18',
}
const ICON = {
  phone: 'M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2',
  chat: 'M21 12a8 8 0 0 1-8 8H8l-4 3v-4.5A8 8 0 0 1 3 12a8 8 0 0 1 9-8 8 8 0 0 1 9 8z',
  pin: 'M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z M14.5 9.5a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0z',
  car: TAG_ICON.car,
  fb: 'M15.5 3H13a4 4 0 0 0-4 4v14 M5.5 10.5h9',
  trophy: 'M8 3h8v6a4 4 0 0 1-8 0V3z M8 5H4.5v1.5A3.5 3.5 0 0 0 8 10 M16 5h3.5v1.5A3.5 3.5 0 0 1 16 10 M12 13v4 M8 21h8 M9.5 17h5l.5 4h-6z',
}
const GOLD = '#f5c542'
const STORE = 'hc_gencard_v1'
const TOKEN = 'hc_gencard_token'

type Form = { name: string; nickname: string; position: string; phone: string; lineId: string; fb: string; branch: string; tagline: string; customTag: string; award: boolean }
const EMPTY: Form = { name: '', nickname: '', position: 'Sales Consultant', phone: '', lineId: '', fb: '', branch: 'รัชดา', tagline: TAGLINES[0], customTag: '', award: true }

const fmtPhone = (s: string) => {
  const d = s.replace(/\D/g, '')
  return d.length === 10 ? `${d.slice(0, 3)}-${d.slice(3, 6)}-${d.slice(6)}` : d.length === 9 ? `${d.slice(0, 2)}-${d.slice(2, 5)}-${d.slice(5)}` : s.trim()
}

function loadImg(src: string): Promise<HTMLImageElement> {
  return new Promise((res, rej) => {
    const i = new Image()
    i.onload = () => res(i)
    i.onerror = rej
    i.src = src
  })
}

/**
 * ความกว้างตัวอักษร — Safari (iPad/iPhone) วัดภาษาไทยฟอนต์ Kanit ใน canvas ผิด (ได้ค่าเล็กเกิน)
 * → ชื่อที่จัดกึ่งกลางเลยเยื้องไปขวาและล้นกรอบ · วัดซ้ำด้วย <span> ใน DOM และนับพิกเซลจริง แล้วเอาค่าที่มากที่สุด
 */
let measureEl: HTMLSpanElement | null = null
let pixCanvas: HTMLCanvasElement | null = null
const pixCache = new Map<string, number>()
/** วัดจากพิกเซลจริง: วาดข้อความลง canvas ลับ แล้วหาคอลัมน์ขวาสุดที่มีสี — ถูกต้องทุกเบราว์เซอร์ */
function pixelWidth(font: string, text: string) {
  const key = font + '|' + text
  const hit = pixCache.get(key)
  if (hit !== undefined) return hit
  if (!pixCanvas) pixCanvas = document.createElement('canvas')
  const size = Number(/(\d+(?:\.\d+)?)px/.exec(font)?.[1] || 40)
  const w = Math.min(4000, Math.ceil(size * (text.length + 2) * 1.3))
  const h = Math.ceil(size * 2.2)
  pixCanvas.width = w
  pixCanvas.height = h
  const c = pixCanvas.getContext('2d', { willReadFrequently: true } as CanvasRenderingContext2DSettings)
  if (!c) return 0
  c.font = font
  c.textAlign = 'left'
  c.textBaseline = 'alphabetic'
  c.fillStyle = '#000'
  const x0 = Math.ceil(size * 0.6)
  c.fillText(text, x0, Math.ceil(size * 1.5))
  const d = c.getImageData(0, 0, w, h).data
  let right = -1
  for (let x = w - 1; x >= 0 && right < 0; x--) for (let y = 0; y < h; y++) if (d[(y * w + x) * 4 + 3] > 8) { right = x; break }
  const out = right < 0 ? 0 : right + 1 - x0
  pixCache.set(key, out)
  return out
}
function tw(ctx: CanvasRenderingContext2D, text: string) {
  const a = ctx.measureText(text).width
  if (typeof document === 'undefined') return a
  if (!measureEl) {
    measureEl = document.createElement('span')
    Object.assign(measureEl.style, { position: 'absolute', left: '-99999px', top: '0', visibility: 'hidden', whiteSpace: 'pre', pointerEvents: 'none' })
    document.body.appendChild(measureEl)
  }
  measureEl.style.font = ctx.font
  measureEl.textContent = text
  let p = 0
  try { p = pixelWidth(ctx.font, text) } catch {}
  return Math.max(a, measureEl.getBoundingClientRect().width, p)
}

/** เขียนข้อความกึ่งกลางที่ cx โดยคำนวณตำแหน่งเอง (ไม่พึ่ง textAlign=center ของ Safari) */
function fillCenter(ctx: CanvasRenderingContext2D, text: string, cx: number, y: number) {
  const w = tw(ctx, text)
  const al = ctx.textAlign
  ctx.textAlign = 'left'
  ctx.fillText(text, cx - w / 2, y)
  ctx.textAlign = al
  return w
}

/** ตัดตัวอักษรให้พอดีความกว้าง โดยลดขนาดฟอนต์ลงจนพอ */
function fitFont(ctx: CanvasRenderingContext2D, text: string, weight: string, family: string, max: number, min: number, width: number) {
  let size = max
  while (size > min) {
    ctx.font = `${weight} ${size}px ${family}`
    if (tw(ctx, text) <= width) break
    size -= 2
  }
  ctx.font = `${weight} ${size}px ${family}`
  return size
}

/** ชื่อเพจ Facebook จากลิงก์หรือข้อความที่พิมพ์ */
const fbLabel = (s: string) => {
  const t = s.trim()
  const m = /facebook\.com\/(?:profile\.php\?id=\d+|([^/?#\s]+))/i.exec(t) || /fb\.com\/([^/?#\s]+)/i.exec(t)
  if (m) return m[1] ? decodeURIComponent(m[1]) : 'Facebook'
  return t.replace(/^@/, '')
}

/** วาดข้อความแบบเว้นระยะตัวอักษร จัดกึ่งกลางที่ cx · ขยายระยะให้กว้างเท่า width (ไม่เกิน maxGap) */
function spacedCenter(ctx: CanvasRenderingContext2D, text: string, cx: number, y: number, width: number, maxGap: number) {
  const chars = [...text]
  const ws = chars.map((c) => tw(ctx, c))
  const base = ws.reduce((a, b) => a + b, 0)
  const gap = chars.length > 1 ? Math.max(2, Math.min(maxGap, (width - base) / (chars.length - 1))) : 0
  let x = cx - (base + gap * (chars.length - 1)) / 2
  ctx.textAlign = 'left'
  chars.forEach((c, i) => { ctx.fillText(c, x, y); x += ws[i] + gap })
}

/** ช่อมะกอก (laurel) สีทอง สองข้าง รอบจุด cx,cy */
function laurel(ctx: CanvasRenderingContext2D, cx: number, cy: number, rx: number, ry: number) {
  ctx.save()
  ctx.fillStyle = GOLD
  ctx.strokeStyle = GOLD
  ctx.lineWidth = 2.5
  for (const side of [-1, 1]) {
    ctx.beginPath()
    for (let i = 0; i <= 20; i++) {
      const t = (-58 + (i / 20) * 118) * (Math.PI / 180)
      const x = cx + side * rx * Math.cos(t)
      const y = cy + ry * Math.sin(t)
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y)
    }
    ctx.stroke()
    for (let i = 0; i < 6; i++) {
      const deg = -52 + i * 20
      const t = deg * (Math.PI / 180)
      const x = cx + side * rx * Math.cos(t)
      const y = cy + ry * Math.sin(t)
      // ทิศขึ้นตามกิ่ง แล้วแตกใบเรียวสองข้าง
      const up = Math.atan2(-ry * Math.cos(t), side * rx * Math.sin(t))
      for (const k of [-1, 1]) {
        ctx.save()
        ctx.translate(x, y)
        ctx.rotate(up + k * 0.6)
        ctx.beginPath()
        ctx.moveTo(0, 0)
        ctx.quadraticCurveTo(10, -6, 22, 0)
        ctx.quadraticCurveTo(10, 6, 0, 0)
        ctx.fill()
        ctx.restore()
      }
    }
  }
  ctx.restore()
}

function drawIcon(ctx: CanvasRenderingContext2D, d: string, cx: number, cy: number, r = 32, fill?: string, stroke = '#fff') {
  ctx.save()
  ctx.beginPath()
  ctx.arc(cx, cy, r, 0, Math.PI * 2)
  const g = ctx.createLinearGradient(cx - r, cy - r, cx + r, cy + r)
  g.addColorStop(0, fill || RED)
  g.addColorStop(1, fill || RED_DARK)
  ctx.fillStyle = g
  ctx.fill()
  const k = r * 1.06
  ctx.translate(cx - k / 2 - 0.0, cy - k / 2)
  ctx.scale(k / 24, k / 24)
  ctx.strokeStyle = stroke
  ctx.lineWidth = 2
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  ctx.stroke(new Path2D(d))
  ctx.restore()
}

export default function CardGenerator() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [checking, setChecking] = useState(true)
  const [loginErr, setLoginErr] = useState('')
  const [busy, setBusy] = useState(false)
  const [f, setF] = useState<Form>(EMPTY)
  const [photo, setPhoto] = useState<HTMLImageElement | null>(null)
  const [zoom, setZoom] = useState(1)
  const [off, setOff] = useState({ x: 0, y: 0 })
  const [assets, setAssets] = useState<{ hc: HTMLImageElement } | null>(null)
  const [fontsReady, setFontsReady] = useState(false)
  const canvas = useRef<HTMLCanvasElement>(null)
  const fileInput = useRef<HTMLInputElement>(null)
  const drag = useRef<{ x: number; y: number; ox: number; oy: number } | null>(null)

  // ---- เข้าสู่ระบบ: token จาก Cinco (#t=…) หรือที่จำไว้ในแท็บนี้ ----
  const accept = useCallback(async (body: Record<string, string>) => {
    const r = await fetch('/api/gen-card', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    const j = await r.json().catch(() => ({}))
    if (!r.ok || !j.profile) throw new Error(j?.message || 'เข้าสู่ระบบไม่สำเร็จ')
    try { sessionStorage.setItem(TOKEN, j.token) } catch {}
    const p = j.profile as Profile
    setProfile(p)
    setF((x) => {
      let saved: Partial<Form> = {}
      try { saved = JSON.parse(localStorage.getItem(STORE) || '{}') } catch {}
      const br = BRANCHES.find((b) => b.th === p.branch)?.th
      return { ...x, ...saved, name: saved.name || p.name, nickname: saved.nickname || p.nickname, branch: saved.branch || br || x.branch }
    })
  }, [])

  useEffect(() => {
    let t = ''
    const m = /[#&]t=([^&]+)/.exec(window.location.hash)
    if (m) {
      t = decodeURIComponent(m[1])
      history.replaceState(null, '', window.location.pathname)
    } else {
      try { t = sessionStorage.getItem(TOKEN) || '' } catch {}
    }
    if (!t) { setChecking(false); return }
    accept({ token: t }).catch(() => { try { sessionStorage.removeItem(TOKEN) } catch {} }).finally(() => setChecking(false))
  }, [accept])

  async function onLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    setBusy(true)
    setLoginErr('')
    try {
      await accept({ email: String(fd.get('email') || ''), password: String(fd.get('password') || '') })
    } catch (err) {
      setLoginErr(err instanceof Error ? err.message : 'เข้าสู่ระบบไม่สำเร็จ')
    }
    setBusy(false)
  }

  // ---- โหลดโลโก้ + ฟอนต์ ครั้งเดียว ----
  useEffect(() => {
    if (!profile) return
    loadImg('/brand/hiclass-logo.png').then((hc) => setAssets({ hc })).catch(() => {})
    const fonts = ['600 80px Kanit', '500 40px Kanit', '400 40px "Noto Sans Thai"', '700 40px "Noto Sans Thai"']
    Promise.all(fonts.map((x) => document.fonts.load(x, 'กขค ABC 123'))).finally(() => setFontsReady(true))
  }, [profile])

  useEffect(() => {
    if (!profile) return
    try { localStorage.setItem(STORE, JSON.stringify(f)) } catch {}
  }, [f, profile])

  // ---- วาดนามบัตร ----
  const draw = useCallback(async () => {
    const c = canvas.current
    if (!c || !assets || !fontsReady) return
    const ctx = c.getContext('2d')
    if (!ctx) return
    const br = BRANCHES.find((b) => b.th === f.branch) || BRANCHES[0]
    const tag = (f.tagline === '__custom' ? f.customTag : f.tagline).trim()

    // พื้น
    const bg = ctx.createLinearGradient(0, 0, W, H)
    bg.addColorStop(0, '#ffffff')
    bg.addColorStop(1, '#f1efed')
    ctx.fillStyle = bg
    ctx.fillRect(0, 0, W, H)
    ctx.save()
    ctx.globalAlpha = 0.05
    ctx.fillStyle = RED
    ctx.beginPath(); ctx.moveTo(1220, 0); ctx.lineTo(W, 0); ctx.lineTo(W, 380); ctx.closePath(); ctx.fill()
    ctx.restore()

    // รูป (ซ้าย) — ตัดขอบเฉียง
    ctx.save()
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(700, 0); ctx.lineTo(560, H); ctx.lineTo(0, H); ctx.closePath(); ctx.clip()
    if (photo) {
      const s = Math.max(700 / photo.width, H / photo.height) * zoom
      const dw = photo.width * s
      const dh = photo.height * s
      const dx = (700 - dw) / 2 - off.x * Math.max(0, dw - 700) / 2
      const dy = (H - dh) / 2 - off.y * Math.max(0, dh - H) / 2
      ctx.drawImage(photo, dx, dy, dw, dh)
    } else {
      const pg = ctx.createLinearGradient(0, 0, 700, H)
      pg.addColorStop(0, '#e7e5e4')
      pg.addColorStop(1, '#d6d3d1')
      ctx.fillStyle = pg
      ctx.fillRect(0, 0, 700, H)
      ctx.fillStyle = '#a8a29e'
      ctx.font = '500 40px Kanit'
      ctx.textAlign = 'center'
      fillCenter(ctx, 'อัปโหลดรูปของคุณ', 320, H / 2)
    }
    ctx.restore()

    // รางวัล (บนรูป เหนือแถบล่าง) — ไล่เงาเข้มให้อ่านออก + ช่อมะกอกทอง ไม่มีกล่อง
    if (f.award !== false) {
      ctx.save()
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(700, 0); ctx.lineTo(560, H); ctx.lineTo(0, H); ctx.closePath(); ctx.clip()
      const sh = ctx.createLinearGradient(0, 520, 0, 770)
      sh.addColorStop(0, 'rgba(12,10,9,0)')
      sh.addColorStop(1, 'rgba(12,10,9,0.72)')
      ctx.fillStyle = sh
      ctx.fillRect(0, 520, 700, 250)
      ctx.restore()

      const ax = 158
      const ay = 686
      laurel(ctx, ax, ay, 134, 66)
      ctx.save()
      ctx.shadowColor = 'rgba(0,0,0,0.45)'
      ctx.shadowBlur = 6
      ctx.textAlign = 'center'
      ctx.fillStyle = GOLD
      ctx.font = '600 15px Kanit'
      spacedCenter(ctx, 'KUNLUN AWARD', ax, ay - 30, 120, 4)
      ctx.textAlign = 'center'
      ctx.fillStyle = '#fff'
      fitFont(ctx, 'ดีลเลอร์ยอดเยี่ยม', '600', 'Kanit', 25, 16, 196)   // ให้อยู่ในช่อมะกอกเสมอ ไม่ทับ 10,000+
      fillCenter(ctx, 'ดีลเลอร์ยอดเยี่ยม', ax, ay + 6)
      ctx.fillStyle = GOLD
      ctx.font = '600 24px Kanit'
      spacedCenter(ctx, '2025', ax, ay + 40, 70, 8)

      ctx.fillStyle = 'rgba(245,197,66,0.6)'
      ctx.shadowBlur = 0
      ctx.fillRect(318, 636, 2, 100)
      ctx.textAlign = 'left'
      ctx.shadowBlur = 6
      ctx.fillStyle = GOLD
      ctx.font = '500 20px Kanit'
      ;(ctx as CanvasRenderingContext2D & { letterSpacing?: string }).letterSpacing = '2px'
      ctx.fillText('ยอดขาย', 344, 664)
      ;(ctx as CanvasRenderingContext2D & { letterSpacing?: string }).letterSpacing = '0px'
      ctx.fillStyle = '#fff'
      ctx.font = '600 56px Kanit'
      ctx.fillText('10,000+', 340, 726)
      ctx.restore()
    }

    // แถบแดงเฉียง
    const sg = ctx.createLinearGradient(560, 0, 760, H)
    sg.addColorStop(0, RED)
    sg.addColorStop(1, RED_DARK)
    ctx.fillStyle = sg
    ctx.beginPath(); ctx.moveTo(700, 0); ctx.lineTo(748, 0); ctx.lineTo(608, H); ctx.lineTo(560, H); ctx.closePath(); ctx.fill()
    ctx.fillStyle = RED_DARK
    ctx.globalAlpha = 0.35
    ctx.beginPath(); ctx.moveTo(762, 0); ctx.lineTo(772, 0); ctx.lineTo(632, H); ctx.lineTo(622, H); ctx.closePath(); ctx.fill()
    ctx.globalAlpha = 1
    // มุมซ้ายบน
    ctx.fillStyle = RED_DARK
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(150, 0); ctx.lineTo(0, 150); ctx.closePath(); ctx.fill()

    // แถบล่างซ้าย
    const bb = ctx.createLinearGradient(0, 770, 640, H)
    bb.addColorStop(0, RED_DARK)
    bb.addColorStop(1, RED)
    ctx.fillStyle = bb
    ctx.beginPath(); ctx.moveTo(0, 770); ctx.lineTo(620, 770); ctx.lineTo(585, H); ctx.lineTo(0, H); ctx.closePath(); ctx.fill()
    ctx.fillStyle = '#fff'
    ctx.textAlign = 'left'
    fitFont(ctx, `BYD HI-CLASS ${br.en}`, '600', 'Kanit', 36, 22, 520)
    ctx.fillText(`BYD HI-CLASS ${br.en}`, 48, 830)
    ctx.font = '500 20px Kanit'
    ctx.save(); ctx.globalAlpha = 0.85
    ;(ctx as CanvasRenderingContext2D & { letterSpacing?: string }).letterSpacing = '6px'
    ctx.fillText((f.position.trim() || 'Sales Consultant').toUpperCase(), 48, 866)
    ctx.restore()

    // โลโก้ (ไฟล์ hiclass-logo มี BYD | HI-CLASS EV CAR อยู่ในรูปเดียวแล้ว)
    const cx = 1150
    const hh = 62
    const hw = (assets.hc.width / assets.hc.height) * hh
    const lx = cx - hw / 2
    ctx.drawImage(assets.hc, lx, 58, hw, hh)
    ctx.fillStyle = RED_DARK
    ctx.textAlign = 'center'
    const hx0 = lx + hw * (631 / 1200)
    const hx1 = lx + hw
    fitFont(ctx, br.en, '600', 'Kanit', 24, 16, hx1 - hx0)
    spacedCenter(ctx, br.en, (hx0 + hx1) / 2, 150, hx1 - hx0, 14)
    // ชื่อสาขาภาษาไทย ใต้ชื่ออังกฤษ
    ctx.fillStyle = MUTE
    fitFont(ctx, br.label, '500', 'Kanit', 24, 16, hx1 - hx0)
    fillCenter(ctx, br.label, (hx0 + hx1) / 2, 182)
    ctx.textAlign = 'center'

    // ชื่อ ชื่อเล่น ตำแหน่ง
    ctx.fillStyle = INK
    ctx.textAlign = 'center'
    const name = f.name.trim() || 'ชื่อ นามสกุล'
    fitFont(ctx, name, '600', 'Kanit', 84, 44, 800)
    fillCenter(ctx, name, cx, 280)
    if (f.nickname.trim()) {
      ctx.font = '500 44px Kanit'
      ctx.fillStyle = MUTE
      const nw = fillCenter(ctx, f.nickname.trim(), cx, 346)
      ctx.fillStyle = '#a8a29e'
      ctx.fillRect(cx - nw / 2 - 110, 330, 86, 2)
      ctx.fillRect(cx + nw / 2 + 24, 330, 86, 2)
    }
    if (f.position.trim()) {
      ctx.save()
      ctx.fillStyle = RED
      ctx.font = '700 28px "Noto Sans Thai"'
      ;(ctx as CanvasRenderingContext2D & { letterSpacing?: string }).letterSpacing = '6px'
      ctx.fillText(f.position.trim().toUpperCase(), cx, 404)
      ctx.restore()
    }
    ctx.fillStyle = '#d6d3d1'
    ctx.fillRect(770, 444, 780, 2)

    // แถวข้อมูล
    const rows: { icon: string; text: string }[] = []
    if (f.phone.trim()) rows.push({ icon: ICON.phone, text: fmtPhone(f.phone) })
    if (f.lineId.trim()) rows.push({ icon: ICON.chat, text: `LINE : ${f.lineId.trim()}` })
    if (fbLabel(f.fb || '')) rows.push({ icon: ICON.fb, text: `Facebook : ${fbLabel(f.fb || '')}` })
    rows.push({ icon: ICON.pin, text: `BYD HI-CLASS ${br.en}` })
    if (tag) rows.push({ icon: ICON.car, text: tag })
    const showQr = !!f.lineId.trim()
    const textW = showQr ? 440 : 660
    let y = 520
    const step = rows.length > 4 ? 72 : 84
    ctx.textAlign = 'left'
    for (const r of rows) {
      drawIcon(ctx, r.icon, 806, y)
      ctx.fillStyle = INK
      fitFont(ctx, r.text, '400', '"Noto Sans Thai"', 38, 24, textW)
      ctx.textBaseline = 'middle'
      ctx.fillText(r.text, 856, y + 2)
      ctx.textBaseline = 'alphabetic'
      y += step
    }

    // QR แอด LINE
    if (showQr) {
      const id = f.lineId.trim().replace(/^@/, '')
      const url = f.lineId.trim().startsWith('@') ? `https://line.me/R/ti/p/@${encodeURIComponent(id)}` : `https://line.me/ti/p/~${encodeURIComponent(id)}`
      const qx = 1320
      const qy = 486
      const qs = 230
      ctx.fillStyle = '#fff'
      ctx.strokeStyle = '#e7e5e4'
      ctx.lineWidth = 3
      ctx.beginPath(); ctx.roundRect(qx - 14, qy - 14, qs + 28, qs + 28, 22); ctx.fill(); ctx.stroke()
      try {
        const q = document.createElement('canvas')
        await QRCode.toCanvas(q, url, { errorCorrectionLevel: 'H', margin: 0, width: qs, color: { dark: '#1c1917', light: '#ffffff' } })
        ctx.drawImage(q, qx, qy, qs, qs)
        ctx.fillStyle = '#fff'
        ctx.beginPath(); ctx.roundRect(qx + qs / 2 - 30, qy + qs / 2 - 30, 60, 60, 12); ctx.fill()
        ctx.fillStyle = '#06c755'
        ctx.beginPath(); ctx.roundRect(qx + qs / 2 - 24, qy + qs / 2 - 24, 48, 48, 10); ctx.fill()
        ctx.fillStyle = '#fff'
        ctx.textAlign = 'center'
        ctx.font = '700 14px "Noto Sans Thai"'
        ctx.fillText('LINE', qx + qs / 2, qy + qs / 2 + 5)
      } catch {}
      ctx.fillStyle = MUTE
      ctx.textAlign = 'center'
      ctx.font = '400 20px "Noto Sans Thai"'
      fillCenter(ctx, 'สแกนเพื่อแอด LINE', qx + qs / 2, qy + qs + 46)
    }

    // ลายน้ำ
    ctx.fillStyle = 'rgba(28,25,23,0.32)'
    ctx.textAlign = 'right'
    ctx.font = '400 15px "Noto Sans Thai"'
    ctx.fillText('Powered by CnC', W - 18, H - 14)
  }, [assets, fontsReady, f, photo, zoom, off])

  useEffect(() => { draw() }, [draw])

  function pickPhoto(list: FileList | null) {
    const file = list?.[0]
    if (!file || !file.type.startsWith('image/')) return
    const url = URL.createObjectURL(file)
    loadImg(url).then((img) => { setPhoto(img); setZoom(1); setOff({ x: 0, y: 0 }) }).catch(() => {})
    if (fileInput.current) fileInput.current.value = ''
  }

  // ลากรูปเพื่อจัดตำแหน่ง
  function canvasPoint(e: React.PointerEvent<HTMLCanvasElement>) {
    const r = e.currentTarget.getBoundingClientRect()
    return { x: ((e.clientX - r.left) / r.width) * W, y: ((e.clientY - r.top) / r.height) * H }
  }
  function onDown(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!photo) return
    const p = canvasPoint(e)
    if (p.x > 700) return
    e.currentTarget.setPointerCapture(e.pointerId)
    drag.current = { x: p.x, y: p.y, ox: off.x, oy: off.y }
  }
  function onMove(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!drag.current || !photo) return
    const p = canvasPoint(e)
    const s = Math.max(700 / photo.width, H / photo.height) * zoom
    const ex = Math.max(1, (photo.width * s - 700) / 2)
    const ey = Math.max(1, (photo.height * s - H) / 2)
    const clamp = (v: number) => Math.max(-1, Math.min(1, v))
    setOff({ x: clamp(drag.current.ox - (p.x - drag.current.x) / ex), y: clamp(drag.current.oy - (p.y - drag.current.y) / ey) })
  }
  function onUp() { drag.current = null }

  function fileName() {
    return `นามบัตร-${(f.nickname || f.name || 'hiclass').replace(/[^\p{L}\p{N}]+/gu, '')}.png`
  }
  // บันทึกว่าสร้างนามบัตรแล้ว (ใคร/เมื่อไร เท่านั้น ไม่ส่งรูป) — พลาดก็ไม่กระทบการดาวน์โหลด
  function track(action: 'download' | 'share') {
    let token = ''
    try { token = sessionStorage.getItem(TOKEN) || '' } catch {}
    if (!token) return
    fetch('/api/gen-card/log', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token, action }), keepalive: true }).catch(() => {})
  }
  function download() {
    track('download')
    canvas.current?.toBlob((b) => {
      if (!b) return
      const a = document.createElement('a')
      a.href = URL.createObjectURL(b)
      a.download = fileName()
      document.body.appendChild(a)
      a.click()
      a.remove()
    }, 'image/png')
  }
  async function share() {
    const b: Blob | null = await new Promise((res) => canvas.current?.toBlob(res, 'image/png'))
    if (!b) return
    const file = new File([b], fileName(), { type: 'image/png' })
    const nav = navigator as Navigator & { canShare?: (d: { files: File[] }) => boolean }
    if (nav.canShare?.({ files: [file] })) {
      track('share')
      try { await navigator.share({ files: [file], title: 'นามบัตร BYD Hi-Class' }) } catch {}
    } else download()
  }
  function logout() {
    try { sessionStorage.removeItem(TOKEN) } catch {}
    setProfile(null)
  }

  const set = (k: Exclude<keyof Form, 'award'>, v: string) => setF((x) => ({ ...x, [k]: v }))

  if (checking) return <p className="mute" style={{ textAlign: 'center', padding: 40 }}>กำลังตรวจสอบบัญชี…</p>

  if (!profile) {
    return (
      <div className="card" style={{ padding: 24, maxWidth: 420, margin: '20px auto' }}>
        <h1 style={{ fontSize: 24, marginBottom: 4 }}>สร้างนามบัตรออนไลน์</h1>
        <p className="mute" style={{ marginTop: 0, fontSize: 14 }}>สำหรับพนักงาน BYD Hi-Class · เข้าสู่ระบบด้วยบัญชี Cinco</p>
        <form className="form" onSubmit={onLogin}>
          <div className="field">
            <label htmlFor="email">อีเมล Cinco</label>
            <input id="email" name="email" type="email" required autoComplete="username" />
          </div>
          <div className="field">
            <label htmlFor="password">รหัสผ่าน</label>
            <input id="password" name="password" type="password" required autoComplete="current-password" style={{ height: 48, borderRadius: 12, border: '1px solid var(--line)', padding: '0 14px', fontSize: 16 }} />
          </div>
          {loginErr ? <p style={{ color: 'var(--red)', margin: 0 }}>{loginErr}</p> : null}
          <button className="btn btn-red" type="submit" disabled={busy} style={{ width: '100%' }}>{busy ? 'กำลังเข้าสู่ระบบ…' : 'เข้าสู่ระบบ'}</button>
        </form>
        <p className="mute" style={{ fontSize: 12, marginBottom: 0 }}>หรือเปิดจากเมนูใน Cinco ได้เลยโดยไม่ต้องกรอกรหัส</p>
      </div>
    )
  }

  const inp = { height: 44 }
  return (
    <div style={{ display: 'grid', gap: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: 26, margin: 0 }}>สร้างนามบัตรออนไลน์</h1>
          <p className="mute" style={{ margin: '4px 0 0', fontSize: 14 }}>สวัสดี {profile.nickname || profile.name} · ใช้แนะนำตัวใน Facebook / LINE · รูปไม่ถูกเก็บไว้ที่ไหน</p>
        </div>
        <button type="button" className="chip" onClick={logout}>ออกจากระบบ</button>
      </div>

      <div className="card" style={{ padding: 12, background: '#1c1917' }}>
        <canvas
          ref={canvas}
          width={W}
          height={H}
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerCancel={onUp}
          style={{ width: '100%', height: 'auto', display: 'block', borderRadius: 8, touchAction: photo ? 'none' : 'auto', cursor: photo ? 'grab' : 'default' }}
          aria-label="ตัวอย่างนามบัตร"
        />
        {!assets || !fontsReady ? <p style={{ color: '#fff', textAlign: 'center' }}>กำลังโหลด…</p> : null}
      </div>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <button type="button" className="btn btn-red" onClick={download}>ดาวน์โหลดรูปนามบัตร</button>
        <button type="button" className="btn" onClick={share} style={{ border: '1px solid var(--line)' }}>แชร์ / บันทึกลงมือถือ</button>
      </div>

      <div className="card" style={{ padding: 20 }}>
        <div className="form">
          <div className="field">
            <span style={{ fontSize: 13, fontWeight: 600 }}>รูปของคุณ</span>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
              <button type="button" className="chip" onClick={() => fileInput.current?.click()} style={{ height: 44 }}>{photo ? 'เปลี่ยนรูป' : '+ อัปโหลดรูป'}</button>
              <span className="mute" style={{ fontSize: 13 }}>แนะนำรูปครึ่งตัว ยืนหน้าโชว์รูม · ลากที่รูปเพื่อเลื่อนตำแหน่ง</span>
            </div>
            <input ref={fileInput} type="file" accept="image/*" hidden onChange={(e) => pickPhoto(e.target.files)} />
            {photo ? (
              <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13 }}>
                ขยาย
                <input type="range" min={1} max={3} step={0.02} value={zoom} onChange={(e) => setZoom(Number(e.target.value))} style={{ flex: 1 }} />
              </label>
            ) : null}
          </div>
          <div className="row">
            <div className="field">
              <label htmlFor="gc-name">ชื่อ-นามสกุล</label>
              <input id="gc-name" type="text" value={f.name} onChange={(e) => set('name', e.target.value)} style={inp} />
            </div>
            <div className="field">
              <label htmlFor="gc-nick">ชื่อเล่น</label>
              <input id="gc-nick" type="text" value={f.nickname} onChange={(e) => set('nickname', e.target.value)} style={inp} />
            </div>
          </div>
          <div className="row">
            <div className="field">
              <label htmlFor="gc-pos">ตำแหน่ง</label>
              <input id="gc-pos" type="text" list="gc-pos-list" value={f.position} onChange={(e) => set('position', e.target.value)} style={inp} />
              <datalist id="gc-pos-list">{POSITIONS.map((p) => <option key={p} value={p} />)}</datalist>
            </div>
            <div className="field">
              <label htmlFor="gc-br">สาขา</label>
              <select id="gc-br" value={f.branch} onChange={(e) => set('branch', e.target.value)}>
                {BRANCHES.map((b) => <option key={b.th} value={b.th}>{b.th}</option>)}
              </select>
            </div>
          </div>
          <div className="row">
            <div className="field">
              <label htmlFor="gc-phone">เบอร์โทร</label>
              <input id="gc-phone" type="tel" inputMode="tel" value={f.phone} onChange={(e) => set('phone', e.target.value)} placeholder="08x-xxx-xxxx" style={inp} />
            </div>
            <div className="field">
              <label htmlFor="gc-line">LINE ID</label>
              <input id="gc-line" type="text" value={f.lineId} onChange={(e) => set('lineId', e.target.value)} placeholder="ใส่แล้วจะมี QR แอด LINE" style={inp} />
            </div>
          </div>
          <div className="row">
            <div className="field">
              <label htmlFor="gc-fb">Facebook (ชื่อเพจ หรือ ลิงก์)</label>
              <input id="gc-fb" type="text" value={f.fb || ''} onChange={(e) => set('fb', e.target.value)} placeholder="เช่น facebook.com/ชื่อเพจ" style={inp} />
            </div>
            <div className="field">
              <span style={{ fontSize: 13, fontWeight: 600 }}>ป้ายรางวัลบนรูป</span>
              <label style={{ display: 'flex', alignItems: 'center', gap: 10, height: 44, fontSize: 15 }}>
                <input type="checkbox" checked={f.award !== false} onChange={(e) => setF((x) => ({ ...x, award: e.target.checked }))} style={{ width: 20, height: 20 }} />
                ดีลเลอร์ยอดเยี่ยม Kunlun Award 2025 · ยอดขาย 10,000+
              </label>
            </div>
          </div>
          <div className="field">
            <label htmlFor="gc-tag">ข้อความเด่น</label>
            <select id="gc-tag" value={f.tagline} onChange={(e) => set('tagline', e.target.value)}>
              {TAGLINES.map((t) => <option key={t} value={t}>{t}</option>)}
              <option value="__custom">พิมพ์เอง…</option>
              <option value="">ไม่ใส่</option>
            </select>
            {f.tagline === '__custom' ? (
              <input type="text" maxLength={40} value={f.customTag} onChange={(e) => set('customTag', e.target.value)} placeholder="ไม่เกิน 40 ตัวอักษร" style={{ ...inp, marginTop: 6 }} />
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}
