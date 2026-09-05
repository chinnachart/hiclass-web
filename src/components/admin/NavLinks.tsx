import Link from 'next/link'
import { AdminIcon as Ic } from './AdminIcons'

/** ทางลัดในเมนูซ้ายของหลังบ้าน */
export function AfterNavLinks() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || '/'
  return (
    <div className="hc-navx">
      <div className="hc-navx__label">ทางลัด</div>
      <Link href="/admin/prices" className="hc-navx__link"><Ic name="car" size={16} /> แก้ราคาทุกรุ่น</Link>
      <Link href="/admin/collections/promotions/create" className="hc-navx__link"><Ic name="tag" size={16} /> เพิ่มโปรโมชั่น</Link>
      <Link href="/admin/collections/media/create" className="hc-navx__link"><Ic name="image" size={16} /> อัปโหลดรูป</Link>
      <a href={siteUrl} target="_blank" rel="noopener noreferrer" className="hc-navx__link"><Ic name="eye" size={16} /> เปิดดูเว็บจริง</a>
    </div>
  )
}
