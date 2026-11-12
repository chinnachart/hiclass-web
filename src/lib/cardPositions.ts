/**
 * ตำแหน่งบนนามบัตรออนไลน์ (/gen-card) — เลือกได้เฉพาะตำแหน่งที่ตรงกับสิทธิ์ (role) ใน Cinco
 * ใช้ทั้งฝั่งเบราว์เซอร์ (ปุ่มเลือก) และฝั่งเซิร์ฟเวอร์ (ตรวจก่อนบันทึก log) — แก้รายการที่ไฟล์นี้ที่เดียว
 *  - role = profiles.role ของ Cinco · sellerPos = sellers.position (SC / Sup / DB)
 *  - owner / admin พิมพ์เองได้ (free = true)
 */
export const CARD_POSITIONS_BY_ROLE: Record<string, string[]> = {
  sales: ['Sales Consultant', 'Sales Specialist', 'Senior Sales Specialist', 'Fleet Sales'],
  sales_lead: ['Sales Supervisor', 'Senior Sales Specialist', 'Sales Consultant'],
  sales_manager: ['Sales Manager'],
  service: ['Service Advisor', 'Service Technician', 'Parts Advisor', 'Customer Relations'],
  service_manager: ['Service Manager'],
  service_gm: ['After Sales General Manager'],
  marketing: ['Marketing'],
  accounting: ['Accounting'],
  hr: ['Human Resources'],
  back_office: ['Sales Admin'],
  sa_plate_full: ['Sales Admin'],
  sa_plate_return: ['Sales Admin'],
  sa_regwork: ['Sales Admin'],
  stock: ['Stock Admin'],
  stock_admin: ['Stock Admin'],
  owner: ['Managing Director', 'Executive Director', 'Sales Director', 'General Manager'],
  admin: ['Sales Director', 'General Manager'],
}
const FREE_ROLES = new Set(['owner', 'admin'])

export function cardPositionsFor(role: string, sellerPos?: string): { list: string[]; free: boolean } {
  let list = [...(CARD_POSITIONS_BY_ROLE[role] || ['Hi-Class EV Car'])]
  // เซลส์ที่ทะเบียนเซลส์ระบุเป็น Sup → ใช้ Sales Supervisor ได้ และขึ้นเป็นตัวเลือกแรก
  if (role === 'sales' && String(sellerPos || '').trim().toLowerCase() === 'sup') list = ['Sales Supervisor', ...list]
  return { list, free: FREE_ROLES.has(role) }
}

/** ตำแหน่งที่จะใช้จริง: ถ้าไม่อยู่ในรายการ (และไม่ใช่ role ที่พิมพ์เองได้) → ตัวเลือกแรกของ role นั้น */
export function resolveCardPosition(role: string, sellerPos: string | undefined, wanted: string): string {
  const { list, free } = cardPositionsFor(role, sellerPos)
  const w = String(wanted || '').replace(/\s+/g, ' ').trim().slice(0, 40)
  if (list.includes(w)) return w
  if (free && w) return w
  return list[0]
}
