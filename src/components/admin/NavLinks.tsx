import Link from 'next/link'
import { AdminIcon as Ic } from './AdminIcons'

/** ทางลัดในเมนูซ้ายของหลังบ้าน */
export function AfterNavLinks() {
  // ลิงก์แบบสัมพัทธ์: เปิดเว็บ "โดเมนเดียวกับที่กำลังใช้อยู่"
  // อยู่บน hiclass-web.vercel.app ก็เปิด vercel.app / ย้ายไป hiclassevcar.com ก็เปิดโดเมนจริงเอง
  const siteUrl = '/'
  return (
    <div className="hc-navx">
      <div className="hc-navx__label">ทางลัด</div>
      <Link href="/admin/prices" className="hc-navx__link"><Ic name="car" size={16} /> แก้ราคาทุกรุ่น</Link>
      <Link href="/admin/collections/promotions/create" className="hc-navx__link"><Ic name="tag" size={16} /> เพิ่มโปรโมชั่น</Link>
      <Link href="/admin/collections/media/create" className="hc-navx__link"><Ic name="image" size={16} /> อัปโหลดรูป</Link>
      <Link href="/admin/wp-import" className="hc-navx__link"><Ic name="arrow" size={16} /> ย้ายรูปจากเว็บเก่า</Link>
      <a href={siteUrl} target="_blank" rel="noopener noreferrer" className="hc-navx__link"><Ic name="eye" size={16} /> เปิดดูเว็บจริง</a>
    </div>
  )
}
