/**
 * Hi-Class EV Care (ประกันภัยรถยนต์ไฟฟ้า · พาร์ทเนอร์: บริษัท โคโรเนท โบรกเกอร์ จำกัด)
 * ลูกค้ากรอกฟอร์มที่เว็บ /ev-care → Cinco `public.insurance_leads` (DB migration v362)
 *
 *  - ไม่เข้า crm_leads เซลส์ไม่เห็น · อ่านได้เฉพาะ admin (RLS) ในแท็บ "ลีดประกันภัย" ของ Cinco
 *  - กระดิ่งใน Cinco สร้างโดย trigger `insurance_lead_notify` ที่ DB (ถึง admin เท่านั้น · ไม่มีเบอร์ใน body)
 *
 * ทำงานฝั่งเซิร์ฟเวอร์เท่านั้น — service key ห้ามหลุดไปฝั่งเบราว์เซอร์
 */

/** ข้อมูลพาร์ทเนอร์ที่แสดงบนหน้าเว็บ — แก้ที่นี่ที่เดียว */
export const EV_CARE = {
  partnerName: 'บริษัท โคโรเนท โบรกเกอร์ จำกัด',
  partnerNameEn: 'Coronet Brokers',
  partnerUrl: 'https://coronetbrokers.com/',
  lineUrl: 'https://lin.ee/PtTrO0w', // ถอดจาก QR บนแบนเนอร์โครงการ (LINE Official ของทีม Hi-Class EV Care)
  banner: '/partners/hiclass-ev-care.jpg',
} as const

export const EV_CARE_REPLY = 'ได้รับข้อมูลแล้ว เจ้าหน้าที่โครงการ Hi-Class EV Care จะติดต่อกลับพร้อมใบเสนอราคาเบี้ยประกันโดยเร็วที่สุด'

export type InsuranceLeadInput = {
  customerName: string
  phone: string
  lineId?: string
  carModel?: string
  carYear?: number | null
  plate?: string
  insuranceExpiry?: string | null
  currentInsurer?: string
  note?: string
  consentPartner: boolean
  source?: string
  ip?: string
  userAgent?: string
}

function env() {
  const url = process.env.CRM_SUPABASE_URL
  const key = process.env.CRM_SUPABASE_SERVICE_KEY
  if (!url || !key) return null
  return { url: url.replace(/\/$/, ''), key }
}

export async function createInsuranceLead(input: InsuranceLeadInput): Promise<{ ok: boolean; id?: number; reason?: string }> {
  const row = {
    customer_name: input.customerName,
    phone: input.phone.replace(/\D/g, '') || input.phone,
    line_id: input.lineId || null,
    car_model: input.carModel || null,
    car_year: input.carYear ?? null,
    plate: input.plate || null,
    insurance_expiry: input.insuranceExpiry || null,
    current_insurer: input.currentInsurer || null,
    note: input.note || null,
    consent_partner: !!input.consentPartner,
    source: (input.source || '').slice(0, 300) || null,
    ip: input.ip || null,
    user_agent: (input.userAgent || '').slice(0, 300) || null,
  }

  const e = env()
  if (!e) {
    console.warn('[ev-care] CRM ยังไม่ได้ตั้งค่า — ข้อมูลที่ได้รับ:', JSON.stringify({ ...row, phone: '***' }))
    return { ok: true, reason: 'logged-only' }
  }
  const res = await fetch(`${e.url}/rest/v1/insurance_leads?select=id`, {
    method: 'POST',
    headers: { apikey: e.key, Authorization: `Bearer ${e.key}`, 'Content-Type': 'application/json', Prefer: 'return=representation' },
    body: JSON.stringify(row),
    cache: 'no-store',
  })
  if (!res.ok) {
    console.error('[ev-care] เขียน DB ไม่สำเร็จ', res.status, (await res.text().catch(() => '')).slice(0, 400))
    return { ok: false, reason: `db-${res.status}` }
  }
  const id = ((await res.json().catch(() => [])) as { id?: number }[])?.[0]?.id
  return { ok: true, id }
}
