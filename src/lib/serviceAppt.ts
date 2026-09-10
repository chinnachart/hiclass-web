/**
 * นัดหมายศูนย์บริการ — ลูกค้ากรอกที่ /service#appointment → Cinco `public.service_appointments` (DB migration v227)
 *
 *  - ไม่เข้า crm_leads เซลส์ไม่เห็น · ทีม service เห็นเฉพาะสาขาตัวเอง (RLS ที่ DB) · service_gm/owner/admin เห็นทุกสาขา
 *  - กระดิ่งใน Cinco สร้างโดย trigger `service_appt_notify` ที่ DB (แท็บ 🔧 งานอู่สี → นัดหมายศูนย์บริการ)
 *  - ไม่ส่งอีเมล — หน้าเว็บโชว์เลขอ้างอิง (ref เช่น SV260910-0128) ให้ลูกค้าแคปหน้าจอไว้แทน
 *
 * ทำงานฝั่งเซิร์ฟเวอร์เท่านั้น — service key ห้ามหลุดไปฝั่งเบราว์เซอร์ (ค่าคงที่ด้านบนใช้ในฟอร์มได้)
 */

/** สาขาที่มีศูนย์บริการ (code ใน cms.branches) → ค่า branch ที่ Cinco ใช้ (ไม่มีเว้นวรรค) */
export const SERVICE_BRANCHES: { code: string; cinco: string }[] = [
  { code: 'ladprao', cinco: 'ลาดพร้าว' },
  { code: 'rama5', cinco: 'พระราม5' },
  { code: 'kanchana', cinco: 'กาญจนาภิเษก' },
]
export const SERVICE_BRANCH_CODES = SERVICE_BRANCHES.map((b) => b.code)
export const cincoBranch = (code: string) => SERVICE_BRANCHES.find((b) => b.code === code)?.cinco || null

/** ประเภทงาน — เก็บข้อความเต็มเหมือนชีตเดิม เพื่อให้ข้อมูลเก่า/ใหม่ใน Cinco เป็นชุดเดียวกัน */
export const SERVICE_TYPES = [
  'นัดหมายเช็คระยะ (Routine Service)',
  'นัดหมายซ่อมสีและตัวถัง (Body Repair Appointment)',
  'นัดหมายซ่อมทั่วไปและอื่นๆ (General Repair & Others)',
] as const

export const TIME_SLOTS = ['ช่วงเช้า 08:00-12:00', 'ช่วงบ่าย 13:00-16:00'] as const

/** ข้อความหลังส่ง (โชว์บนหน้ายืนยัน) */
export const CALLBACK_NOTE = 'เจ้าหน้าที่จะติดต่อกลับภายใน 1 ชั่วโมง ในเวลาทำการ จันทร์–เสาร์ 08:00–17:00 น.'
export const CONFIRM_NOTE = 'เมื่อเจ้าหน้าที่ติดต่อกลับและยืนยันข้อมูลแล้ว การนัดหมายจึงจะเสร็จสมบูรณ์'

export type ServiceApptInput = {
  customerName: string
  email?: string
  phone: string
  model?: string
  subModel?: string
  plate?: string
  vin?: string
  mileage?: number | null
  branch: string // ค่า Cinco เช่น 'ลาดพร้าว'
  serviceType: string
  timeSlot?: string
  detail?: string
  ip?: string
  userAgent?: string
}

export type ServiceApptResult = { ok: true; ref: string } | { ok: false; reason: string }

function env() {
  const url = process.env.CRM_SUPABASE_URL
  const key = process.env.CRM_SUPABASE_SERVICE_KEY
  if (!url || !key) return null
  return { url: url.replace(/\/$/, ''), key }
}

/** บันทึกนัดหมาย 1 รายการ → คืนเลขอ้างอิงที่ DB สร้างให้ */
export async function createServiceAppointment(input: ServiceApptInput): Promise<ServiceApptResult> {
  const e = env()
  if (!e) {
    console.warn('[service-appt] CRM_SUPABASE_URL / CRM_SUPABASE_SERVICE_KEY ยังไม่ได้ตั้งค่า')
    return { ok: false, reason: 'not_configured' }
  }
  const row = {
    customer_name: input.customerName,
    email: input.email || null,
    phone: input.phone,
    model: input.model || null,
    sub_model: input.subModel || null,
    plate: input.plate || null,
    vin: input.vin || null,
    mileage: input.mileage ?? null,
    branch: input.branch,
    service_type: input.serviceType,
    time_slot: input.timeSlot || null,
    detail: input.detail || null,
    source: 'web',
    ip: input.ip || null,
    user_agent: input.userAgent?.slice(0, 300) || null,
  }
  try {
    const r = await fetch(`${e.url}/rest/v1/service_appointments?select=ref`, {
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
    if (!r.ok) {
      console.error('[service-appt] insert failed', r.status, (await r.text().catch(() => '')).slice(0, 300))
      return { ok: false, reason: `insert_${r.status}` }
    }
    const rows = (await r.json()) as { ref?: string }[]
    const ref = rows?.[0]?.ref
    if (!ref) return { ok: false, reason: 'no_ref' }
    return { ok: true, ref }
  } catch (err) {
    console.error('[service-appt] error', err)
    return { ok: false, reason: 'network' }
  }
}
