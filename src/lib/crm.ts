/**
 * เขียนลีดลงตาราง crm_leads ในระบบ CRM (Supabase project hiclass-ev-car)
 *
 * ทำงานฝั่งเซิร์ฟเวอร์เท่านั้น — service key ห้ามหลุดไปฝั่งเบราว์เซอร์เด็ดขาด
 * เพราะตารางเดียวกันนี้ถือข้อมูลลูกค้าทั้งหมดของบริษัท
 */

export type LeadInput = {
  customerName: string
  phone: string
  model?: string
  branch: string
  preferredTime?: string
  offerNote?: string
  leadSource: string
  holderName: string
}

const onlyDigits = (s: string) => s.replace(/\D/g, '')

export async function createLead(input: LeadInput): Promise<{ ok: boolean; reason?: string }> {
  const url = process.env.CRM_SUPABASE_URL
  const key = process.env.CRM_SUPABASE_SERVICE_KEY

  const notes = [
    input.preferredTime ? `สะดวก: ${input.preferredTime}` : null,
    input.offerNote || null,
    'บันทึกอัตโนมัติจากฟอร์มบนเว็บไซต์',
  ]
    .filter(Boolean)
    .join(' · ')

  const row = {
    seller_name: input.holderName,
    branch: input.branch,
    customer_name: input.customerName,
    contact_info: input.phone,
    phone_digits: onlyDigits(input.phone),
    model: input.model || null,
    interest_level: 'C',
    lead_source: input.leadSource,
    test_drive: true,
    booking: false,
    lead_lost: false,
    notes,
  }

  // ยังไม่ได้ตั้งค่า CRM (เช่นตอน dev) — บันทึกลง log แทน ไม่ให้ลูกค้าเห็น error
  if (!url || !key) {
    console.warn('[lead] CRM ยังไม่ได้ตั้งค่า — ลีดที่ได้รับ:', JSON.stringify(row))
    return { ok: true, reason: 'logged-only' }
  }

  const res = await fetch(`${url}/rest/v1/crm_leads`, {
    method: 'POST',
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    },
    body: JSON.stringify(row),
    cache: 'no-store',
  })

  if (!res.ok) {
    const detail = await res.text().catch(() => '')
    console.error('[lead] เขียน CRM ไม่สำเร็จ', res.status, detail.slice(0, 400))
    return { ok: false, reason: `crm-${res.status}` }
  }

  return { ok: true }
}
