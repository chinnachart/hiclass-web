/**
 * แจ้งปัญหาระบบ SMART (/smart-report) — พนักงานไฮคลาสแจ้งปัญหา ไม่ต้องล็อกอิน · ไม่เกี่ยวกับ CNC
 *  - ข้อมูลอยู่ cms.smart_issues (collection "smart-issues" ในหลังบ้าน)
 *  - รูปอยู่ bucket private `smart-report` (path `<uuid>/<n>.jpg`) เปิดด้วย signed URL
 *  - หน้ารายการ /smart-report/list?key=… สำหรับผู้ดูแลระบบ SMART (คนนอก) ดู กรองฝ่าย และตอบกลับ
 *    รหัส key ตั้งในหลังบ้าน ตั้งค่าเว็บไซต์ แท็บ "แจ้งปัญหา SMART"
 * ทำงานฝั่งเซิร์ฟเวอร์เท่านั้น
 */
import { timingSafeEqual } from 'crypto'
import { getPayload } from 'payload'
import config from '@payload-config'

export const SMART_BUCKET = 'smart-report'
export const MAX_PHOTOS = 6

export const DEPTS = [
  { value: 'sales', label: 'ฝ่ายขาย' },
  { value: 'service', label: 'ฝ่ายบริการ' },
] as const
export type Dept = (typeof DEPTS)[number]['value']
export const isDept = (s: string): s is Dept => DEPTS.some((d) => d.value === s)
export const deptLabel = (s: string) => DEPTS.find((d) => d.value === s)?.label || s

export const STATUSES = [
  { value: 'new', label: 'ใหม่' },
  { value: 'in_progress', label: 'กำลังแก้' },
  { value: 'need_info', label: 'ขอข้อมูลเพิ่ม' },
  { value: 'done', label: 'แก้แล้ว' },
] as const
export type Status = (typeof STATUSES)[number]['value']
export const isStatus = (s: string): s is Status => STATUSES.some((d) => d.value === s)
export const statusLabel = (s: string) => STATUSES.find((d) => d.value === s)?.label || s

const UUID = '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}'
const PHOTO_PATH_RE = new RegExp(`^${UUID}/[1-${MAX_PHOTOS}]\\.jpg$`)
export const isPhotoPath = (p: string) => PHOTO_PATH_RE.test(p)
export const isDraftId = (s: string) => new RegExp(`^${UUID}$`).test(s)

function env() {
  const url = process.env.CRM_SUPABASE_URL
  const key = process.env.CRM_SUPABASE_SERVICE_KEY
  if (!url || !key) return null
  return { url: url.replace(/\/$/, ''), key }
}

export async function uploadPhoto(draftId: string, n: number, bytes: ArrayBuffer): Promise<{ ok: boolean; path?: string }> {
  const e = env()
  const path = `${draftId}/${n}.jpg`
  if (!e) {
    console.warn('[smart-report] ยังไม่ได้ตั้งค่า storage ข้ามอัปโหลด', path)
    return { ok: true, path }
  }
  const r = await fetch(`${e.url}/storage/v1/object/${SMART_BUCKET}/${path}`, {
    method: 'POST',
    headers: { apikey: e.key, Authorization: `Bearer ${e.key}`, 'Content-Type': 'image/jpeg', 'x-upsert': 'true' },
    body: bytes,
    cache: 'no-store',
  })
  if (!r.ok) {
    console.error('[smart-report] อัปรูปไม่สำเร็จ', r.status, (await r.text().catch(() => '')).slice(0, 300))
    return { ok: false }
  }
  return { ok: true, path }
}

/** path ในบัคเก็ต → signed URL (อายุ 6 ชม.) */
export async function signPhotos(paths: string[]): Promise<Record<string, string>> {
  const e = env()
  const list = paths.filter(isPhotoPath)
  if (!e || !list.length) return {}
  const r = await fetch(`${e.url}/storage/v1/object/sign/${SMART_BUCKET}`, {
    method: 'POST',
    headers: { apikey: e.key, Authorization: `Bearer ${e.key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ expiresIn: 6 * 3600, paths: list }),
    cache: 'no-store',
  })
  if (!r.ok) {
    console.error('[smart-report] sign ไม่สำเร็จ', r.status)
    return {}
  }
  const rows = (await r.json().catch(() => [])) as { path?: string; signedURL?: string }[]
  const out: Record<string, string> = {}
  for (const x of rows) if (x.path && x.signedURL) out[x.path] = `${e.url}/storage/v1${x.signedURL}`
  return out
}

/** ตรวจรหัสหน้ารายการ กับค่าที่ตั้งในหลังบ้าน */
export async function checkViewKey(key: string): Promise<boolean> {
  const k = String(key || '').trim()
  if (k.length < 8) return false
  try {
    const payload = await getPayload({ config })
    const s = (await payload.findGlobal({ slug: 'site-settings', depth: 0 })) as { smartReportKey?: string | null }
    const want = String(s.smartReportKey || '').trim()
    if (want.length < 8) return false
    const a = Buffer.from(k)
    const b = Buffer.from(want)
    return a.length === b.length && timingSafeEqual(a, b)
  } catch (err) {
    console.error('[smart-report] อ่านรหัสไม่สำเร็จ', err)
    return false
  }
}

export const ticketNo = (id: number | string) => `S-${String(id).padStart(4, '0')}`
