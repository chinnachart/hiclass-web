/**
 * สมัครงาน — ฟอร์มที่ /careers → Cinco `public.job_applications` (DB migration v319 ใน repo hiclass-portal)
 *
 *  - เรซูเม่อยู่ bucket private `job-resumes` (path `<uuid>/resume.<pdf|jpg|png|webp>`) · Cinco เปิดด้วย signed URL
 *  - กระดิ่งใน Cinco สร้างโดย trigger `job_app_notify` (owner/admin/hr + ผจก.สาขาที่ผู้สมัครเลือก) · ไม่มี LINE push
 *
 * ทำงานฝั่งเซิร์ฟเวอร์เท่านั้น — service key ห้ามหลุดไปฝั่งเบราว์เซอร์
 */

export const RESUME_BUCKET = 'job-resumes'
export const RESUME_MAX_BYTES = 5 * 1024 * 1024
export const RESUME_TYPES: Record<string, string> = {
  'application/pdf': 'pdf',
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
}

const RESUME_PATH_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\/resume\.(pdf|jpg|png|webp)$/
export const isResumePath = (p: string) => RESUME_PATH_RE.test(p)
export const isDraftId = (s: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(s)

export type JobApplicationInput = {
  position: string
  fullName: string
  nickname?: string
  phone: string
  lineId?: string
  email?: string
  age?: number | null
  branch?: string | null
  expYears?: number | null
  expBrands?: string
  hasLicense?: boolean | null
  canLive?: boolean | null
  intro?: string
  source?: string
  resumePath?: string | null
  ip?: string
  userAgent?: string
}

function env() {
  const url = process.env.CRM_SUPABASE_URL
  const key = process.env.CRM_SUPABASE_SERVICE_KEY
  if (!url || !key) return null
  return { url: url.replace(/\/$/, ''), key }
}

export async function uploadResume(draftId: string, type: string, bytes: ArrayBuffer): Promise<{ ok: boolean; path?: string; reason?: string }> {
  const ext = RESUME_TYPES[type]
  if (!ext) return { ok: false, reason: 'type' }
  const path = `${draftId}/resume.${ext}`
  const e = env()
  if (!e) {
    console.warn('[careers] CRM ยังไม่ได้ตั้งค่า — ข้ามอัปโหลด', path)
    return { ok: true, path }
  }
  const r = await fetch(`${e.url}/storage/v1/object/${RESUME_BUCKET}/${path}`, {
    method: 'POST',
    headers: { apikey: e.key, Authorization: `Bearer ${e.key}`, 'Content-Type': type, 'x-upsert': 'true' },
    body: bytes,
    cache: 'no-store',
  })
  if (!r.ok) {
    console.error('[careers] อัปเรซูเม่ไม่สำเร็จ', r.status, (await r.text().catch(() => '')).slice(0, 300))
    return { ok: false, reason: `storage-${r.status}` }
  }
  return { ok: true, path }
}

export async function createApplication(input: JobApplicationInput): Promise<{ ok: boolean; id?: number; reason?: string }> {
  const row = {
    position: input.position,
    full_name: input.fullName,
    nickname: input.nickname || null,
    phone: input.phone.replace(/\D/g, '') || input.phone,
    line_id: input.lineId || null,
    email: input.email || null,
    age: input.age ?? null,
    branch: input.branch || null,
    exp_years: input.expYears ?? null,
    exp_brands: input.expBrands || null,
    has_license: input.hasLicense ?? null,
    can_live: input.canLive ?? null,
    intro: input.intro || null,
    source: input.source || null,
    resume_path: input.resumePath && isResumePath(input.resumePath) ? input.resumePath : null,
    ip: input.ip || null,
    user_agent: (input.userAgent || '').slice(0, 300) || null,
  }
  const e = env()
  if (!e) {
    console.warn('[careers] CRM ยังไม่ได้ตั้งค่า — ข้อมูลที่ได้รับ:', JSON.stringify({ ...row, phone: '***' }))
    return { ok: true, reason: 'logged-only' }
  }
  const res = await fetch(`${e.url}/rest/v1/job_applications?select=id`, {
    method: 'POST',
    headers: {
      apikey: e.key,
      Authorization: `Bearer ${e.key}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
    },
    body: JSON.stringify(row),
    cache: 'no-store',
  })
  if (!res.ok) {
    console.error('[careers] เขียน DB ไม่สำเร็จ', res.status, (await res.text().catch(() => '')).slice(0, 400))
    return { ok: false, reason: `db-${res.status}` }
  }
  const id = ((await res.json().catch(() => [])) as { id?: number }[])?.[0]?.id
  return { ok: true, id }
}
