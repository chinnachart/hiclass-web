/**
 * รถเทิร์น — ลูกค้าฝากรูป+ข้อมูลรถเก่าที่เว็บ /trade-in → Cinco `public.trade_in_requests` (DB migration v226)
 *
 *  - ไม่เข้า crm_leads เซลส์ไม่เห็น · ผู้ประเมินคนเดียว (trade_in_settings.appraiser_id) + admin เท่านั้นที่อ่านได้
 *  - รูปอยู่ bucket private `trade-in` (path `drafts/<uuid>/<n>.jpg`) · Cinco เปิดด้วย signed URL
 *  - กระดิ่งใน Cinco สร้างโดย trigger `trade_in_notify` ที่ DB · เว็บ push LINE หาผู้ประเมินเพิ่มเอง
 *
 * ทำงานฝั่งเซิร์ฟเวอร์เท่านั้น — service key ห้ามหลุดไปฝั่งเบราว์เซอร์
 */

export const TRADE_IN_BUCKET = 'trade-in'
export const MAX_PHOTOS = 8
export const DEFAULT_REPLY = 'ขอบคุณสำหรับข้อมูล ทีมงานจะประเมินราคาเบื้องต้นและติดต่อกลับภายใน 24 ชั่วโมง'

const PHOTO_PATH_RE = /^drafts\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\/[1-8]\.jpg$/
export const isPhotoPath = (p: string) => PHOTO_PATH_RE.test(p)
export const isDraftId = (s: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(s)

export type TradeInInput = {
  customerName: string
  phone: string
  lineId?: string
  brand: string
  model: string
  subModel?: string
  year?: number | null
  mileage?: number | null
  color?: string
  plate?: string
  plateProvince?: string
  conditionNote?: string
  expectedPrice?: number | null
  interestedModel?: string
  branch?: string
  photos: string[]
  ip?: string
  userAgent?: string
}

function env() {
  const url = process.env.CRM_SUPABASE_URL
  const key = process.env.CRM_SUPABASE_SERVICE_KEY
  if (!url || !key) return null
  return { url: url.replace(/\/$/, ''), key }
}
type Env = NonNullable<ReturnType<typeof env>>

async function rest(e: Env, path: string, init: RequestInit & { prefer?: string } = {}) {
  return fetch(`${e.url}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: e.key,
      Authorization: `Bearer ${e.key}`,
      'Content-Type': 'application/json',
      ...(init.prefer ? { Prefer: init.prefer } : {}),
    },
    cache: 'no-store',
  })
}

/** ข้อความหลังส่งสำเร็จ — แก้ได้ที่ Cinco ตาราง trade_in_settings.reply_message */
export async function getReplyMessage(): Promise<string> {
  const e = env()
  if (!e) return DEFAULT_REPLY
  try {
    const r = await rest(e, 'trade_in_settings?select=reply_message&id=eq.1&limit=1')
    if (!r.ok) return DEFAULT_REPLY
    const rows = (await r.json()) as { reply_message?: string }[]
    return rows?.[0]?.reply_message || DEFAULT_REPLY
  } catch {
    return DEFAULT_REPLY
  }
}

/** อัปโหลดรูป 1 ใบ (jpeg ที่บีบมาแล้วจากเบราว์เซอร์) → path ใน bucket */
export async function uploadPhoto(draftId: string, n: number, bytes: ArrayBuffer): Promise<{ ok: boolean; path?: string; reason?: string }> {
  const e = env()
  const path = `drafts/${draftId}/${n}.jpg`
  if (!e) {
    console.warn('[trade-in] CRM ยังไม่ได้ตั้งค่า — ข้ามอัปโหลด', path)
    return { ok: true, path }
  }
  const r = await fetch(`${e.url}/storage/v1/object/${TRADE_IN_BUCKET}/${path}`, {
    method: 'POST',
    headers: { apikey: e.key, Authorization: `Bearer ${e.key}`, 'Content-Type': 'image/jpeg', 'x-upsert': 'true' },
    body: bytes,
    cache: 'no-store',
  })
  if (!r.ok) {
    console.error('[trade-in] อัปรูปไม่สำเร็จ', r.status, (await r.text().catch(() => '')).slice(0, 300))
    return { ok: false, reason: `storage-${r.status}` }
  }
  return { ok: true, path }
}

export async function createTradeIn(input: TradeInInput): Promise<{ ok: boolean; id?: number; reason?: string }> {
  const row = {
    customer_name: input.customerName,
    phone: input.phone.replace(/\D/g, '') || input.phone,
    line_id: input.lineId || null,
    brand: input.brand,
    model: input.model,
    sub_model: input.subModel || null,
    year: input.year ?? null,
    mileage: input.mileage ?? null,
    color: input.color || null,
    plate: input.plate || null,
    plate_province: input.plateProvince || null,
    condition_note: input.conditionNote || null,
    expected_price: input.expectedPrice ?? null,
    interested_model: input.interestedModel || null,
    branch: input.branch || null,
    photos: input.photos.filter(isPhotoPath).slice(0, MAX_PHOTOS),
    ip: input.ip || null,
    user_agent: (input.userAgent || '').slice(0, 300) || null,
  }

  const e = env()
  if (!e) {
    console.warn('[trade-in] CRM ยังไม่ได้ตั้งค่า — ข้อมูลที่ได้รับ:', JSON.stringify(row))
    return { ok: true, reason: 'logged-only' }
  }

  const res = await rest(e, 'trade_in_requests?select=id', { method: 'POST', body: JSON.stringify(row), prefer: 'return=representation' })
  if (!res.ok) {
    console.error('[trade-in] เขียน DB ไม่สำเร็จ', res.status, (await res.text().catch(() => '')).slice(0, 400))
    return { ok: false, reason: `db-${res.status}` }
  }
  const id = ((await res.json().catch(() => [])) as { id?: number }[])?.[0]?.id

  // LINE หาผู้ประเมิน — พังก็ไม่ให้ลูกค้าเห็น (กระดิ่งใน Cinco มีอยู่แล้วจาก trigger)
  try {
    await pushLine(e, { id, row })
  } catch (err) {
    console.error('[trade-in] LINE push ไม่สำเร็จ', err instanceof Error ? err.message : err)
  }
  return { ok: true, id }
}

async function pushLine(e: Env, p: { id?: number; row: Record<string, unknown> }) {
  const [s, l] = await Promise.all([
    rest(e, 'trade_in_settings?select=line_user_id&id=eq.1&limit=1'),
    rest(e, 'line_settings?select=channel_token,admin_line_id&limit=1'),
  ])
  if (!s.ok || !l.ok) throw new Error(`settings ${s.status}/${l.status}`)
  const set = ((await s.json()) as { line_user_id?: string | null }[])?.[0]
  const line = ((await l.json()) as { channel_token?: string | null; admin_line_id?: string | null }[])?.[0]
  const to = set?.line_user_id || line?.admin_line_id
  const token = line?.channel_token
  if (!to || !token) return

  const r = p.row
  const fmt = (n: unknown) => (typeof n === 'number' ? n.toLocaleString('th-TH') : '-')
  const text = [
    `🚗 รถเทิร์นใหม่ #${p.id ?? '-'}`,
    `${r.customer_name} · ${String(r.phone).replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3')}`,
    `${r.brand} ${r.model}${r.sub_model ? ' ' + r.sub_model : ''}${r.year ? ' ' + r.year : ''}`,
    `ไมล์ ${fmt(r.mileage)} กม. · ราคาที่คาดหวัง ${fmt(r.expected_price)} บ.`,
    r.interested_model ? `สนใจ BYD ${r.interested_model}` : null,
    `รูป ${(r.photos as string[]).length} ใบ — ดูใน Cinco แท็บ รถเทิร์น`,
  ]
    .filter(Boolean)
    .join('\n')

  const res = await fetch('https://api.line.me/v2/bot/message/push', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ to, messages: [{ type: 'text', text }] }),
  })
  if (!res.ok) throw new Error(`line ${res.status} ${(await res.text().catch(() => '')).slice(0, 200)}`)
}
