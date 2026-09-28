/** ตรวจกับดักบอทฝั่งเซิร์ฟเวอร์ (คู่กับ components/BotTrap.tsx)
 *  ไม่มี _t (หน้าเก่าที่แคชไว้ก่อนอัปเดต) = ปล่อยผ่าน — ด่านชั้นถัดไปคือ trigger ใน DB (trg_aa_guard_web_lead_spam) */
export const MIN_FILL_MS = 3000

export function isBotSubmit(body: Record<string, unknown>): boolean {
  if (String(body.hp || '').trim()) return true
  const t = Number(body.t)
  if (Number.isFinite(t) && t > 0) {
    const elapsed = Date.now() - t
    if (elapsed >= 0 && elapsed < MIN_FILL_MS) return true
  }
  return false
}
