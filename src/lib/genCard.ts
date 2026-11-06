/**
 * นามบัตรออนไลน์ (/gen-card) — ล็อกอินด้วยบัญชี Cinco แล้วดึงชื่อ/ชื่อเล่น/สาขาจาก Cinco
 *  - ไม่เก็บรูปหรือนามบัตรไว้ที่ไหน: เบราว์เซอร์วาดเอง (canvas) แล้วดาวน์โหลด
 *  - ฝั่งเซิร์ฟเวอร์ใช้แค่ยืนยันตัวตน (Supabase Auth โปรเจกต์เดียวกับ Cinco) + อ่าน profiles/sellers ของคนนั้น
 * ทำงานฝั่งเซิร์ฟเวอร์เท่านั้น — service key ห้ามหลุดไปฝั่งเบราว์เซอร์
 */

export type CardProfile = {
  name: string
  nickname: string
  branch: string
  position: string
  role: string
}

function env() {
  const url = process.env.CRM_SUPABASE_URL
  const key = process.env.CRM_SUPABASE_SERVICE_KEY
  if (!url || !key) return null
  return { url: url.replace(/\/$/, ''), key }
}

/** อีเมล + รหัสผ่าน Cinco → access token */
export async function loginWithPassword(email: string, password: string): Promise<{ ok: boolean; token?: string; reason?: string }> {
  const e = env()
  if (!e) return { ok: false, reason: 'not-configured' }
  const r = await fetch(`${e.url}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: { apikey: e.key, 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
    cache: 'no-store',
  })
  if (!r.ok) return { ok: false, reason: r.status === 400 ? 'bad-credentials' : `auth-${r.status}` }
  const j = (await r.json().catch(() => ({}))) as { access_token?: string }
  return j.access_token ? { ok: true, token: j.access_token } : { ok: false, reason: 'no-token' }
}

/** access token (จากการล็อกอิน หรือส่งมาจาก Cinco) → ข้อมูลพนักงาน */
export async function profileFromToken(token: string): Promise<{ ok: boolean; profile?: CardProfile; reason?: string }> {
  const e = env()
  if (!e) return { ok: false, reason: 'not-configured' }
  const u = await fetch(`${e.url}/auth/v1/user`, {
    headers: { apikey: e.key, Authorization: `Bearer ${token}` },
    cache: 'no-store',
  })
  if (!u.ok) return { ok: false, reason: 'bad-token' }
  const user = (await u.json().catch(() => ({}))) as { id?: string }
  if (!user.id || !/^[0-9a-f-]{36}$/.test(user.id)) return { ok: false, reason: 'bad-token' }

  const h = { apikey: e.key, Authorization: `Bearer ${e.key}` }
  const [pr, sr] = await Promise.all([
    fetch(`${e.url}/rest/v1/profiles?id=eq.${user.id}&select=display_name,role,branch,is_active&limit=1`, { headers: h, cache: 'no-store' }),
    fetch(`${e.url}/rest/v1/sellers?profile_id=eq.${user.id}&select=full_name,nickname,branch,position,is_active&order=is_active.desc&limit=1`, { headers: h, cache: 'no-store' }),
  ])
  if (!pr.ok) return { ok: false, reason: `profile-${pr.status}` }
  const p = ((await pr.json().catch(() => [])) as { display_name?: string; role?: string; branch?: string; is_active?: boolean }[])[0]
  if (!p || p.is_active === false) return { ok: false, reason: 'inactive' }
  const s = sr.ok ? ((await sr.json().catch(() => [])) as { full_name?: string; nickname?: string; branch?: string; position?: string }[])[0] : undefined
  return {
    ok: true,
    profile: {
      name: (s?.full_name || p.display_name || '').replace(/\s+/g, ' ').trim(),
      nickname: (s?.nickname || '').trim(),
      branch: (s?.branch || p.branch || '').replace(/\s+/g, ''),
      position: s?.position || '',
      role: p.role || '',
    },
  }
}
