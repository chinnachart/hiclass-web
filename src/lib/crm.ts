/**
 * เขียนลีดจากเว็บลง Cinco (public.crm_leads) + สร้างกระดิ่งให้เซลส์สาขา (public.notifications)
 *
 * สัญญากับ Cinco (INTEGRATION_DECISIONS_2026-09-06):
 *  - seller_id / seller_ref ไม่ส่ง (NULL = ลีดกองกลาง รอเซลส์กดรับ)  · ห้ามส่ง phone_digits (generated column)
 *  - lead_source = 'Website' ตายตัว (Cinco นับเป็นกองกลางเฉพาะค่านี้)
 *  - kind='test_drive' (ฟอร์ม /test-drive) → interest_level 'Hot', test_drive=true
 *    kind='register'   (ฟอร์ม /register ลงทะเบียนความสนใจ) → interest_level 'Warm', test_drive=false · อีเมล/LINE ID/หมายเหตุ รวมอยู่ใน notes (crm_leads ไม่มีคอลัมน์)
 *  - branch / model ไม่มีเว้นวรรค ให้ตรง public.branches และ dropdown_options
 *  - appointment_date (YYYY-MM-DD) + appointment_slot (3 ค่าตายตัว) · notes ยังเขียนเหมือนเดิมเป็น fallback
 *  - กระดิ่ง kind='web_lead' tab='mktleads' ref=<lead id> · body ไม่มีเบอร์โทร (ต้องกดรับก่อนถึงเห็น)
 *
 * ทำงานฝั่งเซิร์ฟเวอร์เท่านั้น — service key ห้ามหลุดไปฝั่งเบราว์เซอร์เด็ดขาด
 */

import { isAppointmentSlot } from './appointment'
export { APPOINTMENT_SLOTS, isAppointmentSlot } from './appointment'

export const LEAD_SOURCE = 'Website'
const NOTIFY_ROLES = ['sales', 'sales_lead', 'sales_manager']

export type LeadKind = 'test_drive' | 'register'

export type LeadInput = {
  kind?: LeadKind // default 'test_drive'
  customerName: string
  phone: string
  email?: string
  lineId?: string
  comment?: string
  model?: string
  branch: string
  appointmentDate?: string // YYYY-MM-DD
  appointmentSlot?: string
  offerNote?: string
  holderName: string
}

const onlyDigits = (s: string) => s.replace(/\D/g, '')
/** "พระราม 5" → "พระราม5", "Sealion 7" → "Sealion7" */
export const canon = (s: string) => s.replace(/\s+/g, '').trim()

const isIsoDate = (s: string) => /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(Date.parse(s))

const thaiDate = (iso: string) =>
  new Date(`${iso}T00:00:00+07:00`).toLocaleDateString('th-TH', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'Asia/Bangkok',
  })

function crmEnv() {
  const url = process.env.CRM_SUPABASE_URL
  const key = process.env.CRM_SUPABASE_SERVICE_KEY
  if (!url || !key) return null
  return { url: url.replace(/\/$/, ''), key }
}

async function rest(env: { url: string; key: string }, path: string, init: RequestInit & { prefer?: string }) {
  return fetch(`${env.url}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: env.key,
      Authorization: `Bearer ${env.key}`,
      'Content-Type': 'application/json',
      ...(init.prefer ? { Prefer: init.prefer } : {}),
    },
    cache: 'no-store',
  })
}

export async function createLead(input: LeadInput): Promise<{ ok: boolean; reason?: string; leadId?: number }> {
  const branch = canon(input.branch)
  const model = input.model ? canon(input.model) : null
  const appointmentDate = input.appointmentDate && isIsoDate(input.appointmentDate) ? input.appointmentDate : null
  const appointmentSlot = input.appointmentSlot && isAppointmentSlot(input.appointmentSlot) ? input.appointmentSlot : null

  const kind: LeadKind = input.kind || 'test_drive'
  const isRegister = kind === 'register'

  const apptText = [appointmentDate ? thaiDate(appointmentDate) : '', appointmentSlot || ''].filter(Boolean).join(' ')
  const notes = [
    apptText ? `สะดวก: ${apptText}` : null,
    input.email ? `อีเมล: ${input.email}` : null,
    input.lineId ? `LINE ID: ${input.lineId}` : null,
    input.comment ? `หมายเหตุ: ${input.comment}` : null,
    input.offerNote || null,
    isRegister ? 'ลงทะเบียนความสนใจจากฟอร์มบนเว็บไซต์' : 'บันทึกอัตโนมัติจากฟอร์มบนเว็บไซต์',
  ]
    .filter(Boolean)
    .join(' · ')

  const row = {
    seller_name: input.holderName,
    branch,
    customer_name: input.customerName,
    contact_info: onlyDigits(input.phone) || input.phone,
    model,
    interest_level: isRegister ? 'Warm' : 'Hot',
    lead_source: LEAD_SOURCE,
    test_drive: !isRegister,
    booking: false,
    lead_lost: false,
    appointment_date: appointmentDate,
    appointment_slot: appointmentSlot,
    notes,
  }

  const env = crmEnv()
  // ยังไม่ได้ตั้งค่า CRM (เช่นตอน dev) — บันทึกลง log แทน ไม่ให้ลูกค้าเห็น error
  if (!env) {
    console.warn('[lead] CRM ยังไม่ได้ตั้งค่า — ลีดที่ได้รับ:', JSON.stringify(row))
    return { ok: true, reason: 'logged-only' }
  }

  const res = await rest(env, 'crm_leads?select=id', { method: 'POST', body: JSON.stringify(row), prefer: 'return=representation' })
  if (!res.ok) {
    const detail = await res.text().catch(() => '')
    console.error('[lead] เขียน CRM ไม่สำเร็จ', res.status, detail.slice(0, 400))
    return { ok: false, reason: `crm-${res.status}` }
  }
  const created = (await res.json().catch(() => [])) as { id?: number }[]
  const leadId = created?.[0]?.id

  // กระดิ่งให้เซลส์สาขา — ล้มเหลวก็ไม่ทำให้ลูกค้าเห็น error (ลีดเข้าแล้ว, Cinco มี escalation ทุก 5 นาทีสำรอง)
  if (leadId) {
    try {
      await notifyBranch(env, { leadId, customerName: input.customerName, model, branch, apptText, kind })
    } catch (e) {
      console.error('[lead] สร้างกระดิ่งไม่สำเร็จ', e instanceof Error ? e.message : e)
    }
  }

  return { ok: true, leadId }
}

async function notifyBranch(
  env: { url: string; key: string },
  p: { leadId: number; customerName: string; model: string | null; branch: string; apptText: string; kind: LeadKind },
) {
  const q =
    `profiles?select=id&is_active=eq.true` +
    `&role=in.(${NOTIFY_ROLES.join(',')})` +
    `&or=(branch.eq.${encodeURIComponent(p.branch)},branch2.eq.${encodeURIComponent(p.branch)})&limit=500`
  const r = await rest(env, q, { method: 'GET' })
  if (!r.ok) throw new Error(`profiles ${r.status}`)
  const users = (await r.json()) as { id: string }[]
  if (!users.length) return

  const rows = users.map((u) => ({
    user_id: u.id,
    kind: 'web_lead',
    tab: 'mktleads',
    ref: String(p.leadId),
    title: `🌐 ลีดใหม่จากเว็บ — ${p.customerName} · กดรับก่อนได้โทรก่อน`,
    body: [
      `BYD ${p.model || 'ไม่ระบุรุ่น'}`,
      `สาขา${p.branch}`,
      p.kind === 'register' ? 'ลงทะเบียนความสนใจ' : p.apptText ? `นัด ${p.apptText}` : null,
    ]
      .filter(Boolean)
      .join(' · '),
  }))
  const ins = await rest(env, 'notifications', { method: 'POST', body: JSON.stringify(rows), prefer: 'return=minimal' })
  if (!ins.ok) throw new Error(`notifications ${ins.status} ${(await ins.text().catch(() => '')).slice(0, 200)}`)
}
