// zip #40 — ลิงก์ภายในระหว่างหน้ารุ่นรถ ↔ บทความ และกติกา "โปรหมดอายุ"
// บทความ 20 ชิ้นไม่ติด index เพราะไม่มีหน้าไหนลิงก์ไปหา (Discovered – currently not indexed)
// ที่นี่จับคู่ด้วยชื่อรุ่นใน slug/หัวข้อ ไม่ต้องให้ mkt ผูกเองในหลังบ้าน

import type { CarModel, NewsItem } from './types'

/** โปรสิ้นสุดแล้วหรือยัง — ดูจากช่อง "โปรสิ้นสุดวันที่" ในหลังบ้าน (เว้นว่าง = ไม่มีวันหมด) */
export function isPromoExpired(n: Pick<NewsItem, 'promoEndsAt'>, now = new Date()): boolean {
  if (!n.promoEndsAt) return false
  const end = new Date(n.promoEndsAt)
  if (Number.isNaN(end.getTime())) return false
  // นับว่าหมดเมื่อพ้นวันนั้นทั้งวัน (เวลาไทย)
  const endOfDay = new Date(end.getTime() + 24 * 60 * 60 * 1000)
  return now.getTime() >= endOfDay.getTime()
}

/** ชุดคำที่ถือว่าหมายถึงรุ่นนั้น: "atto-3" → atto-3 / atto3 / atto 3 */
export function modelKeys(m: Pick<CarModel, 'slug' | 'name'>): string[] {
  const base = [m.slug, m.name].filter(Boolean).map((s) => String(s).toLowerCase().trim())
  const out = new Set<string>()
  for (const b of base) {
    const dashed = b.replace(/\s+/g, '-')
    out.add(dashed)
    out.add(dashed.replace(/-/g, ''))
    out.add(dashed.replace(/-/g, ' '))
  }
  return Array.from(out).filter((k) => k.length >= 2)
}

/** ข่าวชิ้นนี้พูดถึงรุ่นนี้ไหม (ดู slug + หัวข้อ) — รุ่นที่ชื่อซ้อนกัน (seal-5 vs sealion-5) ใช้ขอบคำกัน */
export function newsMentionsModel(n: Pick<NewsItem, 'slug' | 'title'>, m: Pick<CarModel, 'slug' | 'name'>): boolean {
  const hay = `${n.slug} ${n.title}`.toLowerCase()
  return modelKeys(m).some((k) => {
    const esc = k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    // ขอบคำ: ข้างหน้าต้องไม่ใช่ตัวอักษร ข้างหลังต้องไม่ใช่ตัวอักษร/ตัวเลข (กัน "seal 5" ไปจับ "sealion 5")
    return new RegExp(`(^|[^a-z])${esc}(?![a-z0-9])`).test(hay)
  })
}

/** บทความสำหรับหน้ารุ่น: ที่พูดถึงรุ่นนี้ก่อน → เติมด้วยบทความ "ความรู้" ล่าสุด · ตัดโปรหมดอายุทิ้ง */
export function newsForModel(all: NewsItem[], m: Pick<CarModel, 'slug' | 'name'>, limit = 3): NewsItem[] {
  const live = all.filter((n) => !isPromoExpired(n))
  const direct = live.filter((n) => newsMentionsModel(n, m))
  const guides = live.filter((n) => n.category === 'guide' && !direct.includes(n))
  return [...direct, ...guides].slice(0, limit)
}

/** บทความอื่นที่เกี่ยวข้องท้ายบทความ: หมวดเดียวกันก่อน แล้วค่อยล่าสุด · ไม่เอาตัวเอง/โปรหมดอายุ */
export function relatedNews(all: NewsItem[], current: Pick<NewsItem, 'id' | 'category'>, limit = 3): NewsItem[] {
  const live = all.filter((n) => n.id !== current.id && !isPromoExpired(n))
  const same = live.filter((n) => n.category === current.category)
  const rest = live.filter((n) => !same.includes(n))
  return [...same, ...rest].slice(0, limit)
}

/** รุ่นรถที่บทความนี้พูดถึง — ใช้ทำปุ่มลิงก์ไปหน้ารุ่น */
export function modelsInNews(models: CarModel[], n: Pick<NewsItem, 'slug' | 'title'>, limit = 4): CarModel[] {
  return models.filter((m) => newsMentionsModel(n, m)).slice(0, limit)
}
