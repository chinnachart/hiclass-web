/**
 * การวัดผลฝั่งเบราว์เซอร์ — GA4 + Google Ads conversion + จำที่มาของผู้เข้าชม (gclid / utm)
 *
 * - gtag โหลดใน <Tracking> (layout) แบบ Consent Mode v2: ก่อนผู้ใช้กด "ยอมรับ" คุกกี้ทุกอย่างถูกปฏิเสธ
 *   Google ยังรับสัญญาณแบบไม่ระบุตัวตนไปประมาณการ conversion ได้ (modeling) · กดยอมรับแล้วค่อยเปิดคุกกี้
 * - track(name, settings, params) ส่ง event เข้า GA4 เสมอ และถ้าตั้ง googleAdsId + label ของ event นั้นไว้ในหลังบ้าน
 *   จะยิง conversion เข้า Google Ads ด้วย (send_to = AW-xxx/label)
 * - รหัสที่มา (gclid ฯลฯ) เก็บใน localStorage 90 วัน แล้วแนบไปกับฟอร์ม → เขียนต่อท้าย notes ของลีดใน Cinco
 */

import type { SiteSettings } from './types'

export type TrackEvent = 'test_drive' | 'register' | 'phone_click' | 'line_click'

const ATTR_KEY = 'hc-attr'
const ATTR_TTL_MS = 90 * 24 * 60 * 60 * 1000

/** ชื่อ event ใน GA4 (generate_lead เป็นชื่อมาตรฐานที่ GA4 รู้จักเป็น key event ได้ทันที) */
const GA_EVENT: Record<TrackEvent, string> = {
  test_drive: 'generate_lead',
  register: 'generate_lead',
  phone_click: 'phone_click',
  line_click: 'line_click',
}

type Gtag = (...args: unknown[]) => void
declare global {
  interface Window {
    gtag?: Gtag
    dataLayer?: unknown[]
  }
}

export function adsLabel(ev: TrackEvent, s: Pick<SiteSettings, 'adsLabelTestDrive' | 'adsLabelRegister' | 'adsLabelPhone' | 'adsLabelLine'>) {
  const v = ev === 'test_drive' ? s.adsLabelTestDrive : ev === 'register' ? s.adsLabelRegister : ev === 'phone_click' ? s.adsLabelPhone : s.adsLabelLine
  return (v || '').trim()
}

/** ส่ง event — เรียกได้ทุกที่ฝั่ง client · ถ้า gtag ยังไม่โหลด (เช่น ad blocker) จะเงียบๆ ไม่ error */
export function track(
  ev: TrackEvent,
  settings: Pick<SiteSettings, 'googleAdsId' | 'adsLabelTestDrive' | 'adsLabelRegister' | 'adsLabelPhone' | 'adsLabelLine'>,
  params: Record<string, string | number | undefined> = {},
) {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') return
  const clean = Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined && v !== ''))
  try {
    window.gtag('event', GA_EVENT[ev], { form: ev, ...clean })
    const id = (settings.googleAdsId || '').trim()
    const label = adsLabel(ev, settings)
    if (id && label) window.gtag('event', 'conversion', { send_to: `${id}/${label}`, ...clean })
  } catch {}
}

type Attribution = {
  at: number
  landing: string
  referrer?: string
  gclid?: string
  gbraid?: string
  wbraid?: string
  fbclid?: string
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
  utm_term?: string
  utm_content?: string
}

const CLICK_KEYS = ['gclid', 'gbraid', 'wbraid', 'fbclid', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'] as const

/** เรียกตอนโหลดหน้า — ถ้า URL มีรหัสแคมเปญ ให้จำไว้ (ครั้งล่าสุดชนะ) · ถ้าไม่มีและยังไม่เคยจำ ให้จำ referrer แรก */
export function rememberAttribution() {
  if (typeof window === 'undefined') return
  try {
    const q = new URLSearchParams(window.location.search)
    const found: Partial<Attribution> = {}
    for (const k of CLICK_KEYS) {
      const v = q.get(k)
      if (v) found[k] = v.slice(0, 200)
    }
    const has = Object.keys(found).length > 0
    const prev = readAttribution()
    if (!has && prev) return
    const ref = document.referrer && !document.referrer.includes(window.location.host) ? document.referrer.slice(0, 200) : undefined
    if (!has && !ref) return
    const row: Attribution = { at: Date.now(), landing: window.location.pathname.slice(0, 120), referrer: ref, ...found }
    localStorage.setItem(ATTR_KEY, JSON.stringify(row))
  } catch {}
}

function readAttribution(): Attribution | null {
  try {
    const raw = localStorage.getItem(ATTR_KEY)
    if (!raw) return null
    const row = JSON.parse(raw) as Attribution
    if (!row?.at || Date.now() - row.at > ATTR_TTL_MS) return null
    return row
  } catch {
    return null
  }
}

/** ข้อความสั้นสำหรับแนบไปกับฟอร์ม → ต่อท้าย notes ในลีด เช่น "google/cpc/BYD Model/byd seal · gclid:…" */
export function attributionText(): string {
  const a = readAttribution()
  if (!a) return ''
  const src = a.utm_source || (a.gclid || a.gbraid || a.wbraid ? 'google' : a.fbclid ? 'facebook' : a.referrer ? hostOf(a.referrer) : '')
  const med = a.utm_medium || (a.gclid || a.gbraid || a.wbraid ? 'cpc' : a.fbclid ? 'paid-social' : a.referrer ? 'referral' : '')
  const parts = [
    [src, med, a.utm_campaign, a.utm_term, a.utm_content].filter(Boolean).join('/'),
    a.gclid ? `gclid:${a.gclid}` : a.gbraid ? `gbraid:${a.gbraid}` : a.wbraid ? `wbraid:${a.wbraid}` : a.fbclid ? `fbclid:${a.fbclid}` : '',
    a.landing && a.landing !== '/' ? `หน้าแรกที่เข้า:${a.landing}` : '',
  ].filter(Boolean)
  return parts.join(' · ').slice(0, 400)
}

function hostOf(u: string) {
  try {
    return new URL(u).hostname.replace(/^www\./, '')
  } catch {
    return ''
  }
}
