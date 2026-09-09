export const AdminLogo = () => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '4px 0' }}>
    {/* eslint-disable-next-line @next/next/no-img-element -- หลังบ้าน ไม่ต้องผ่าน next/image */}
    <img src="/brand/hiclass-logo.png" alt="BYD Hi-Class EV Car" style={{ height: 30, width: 'auto', display: 'block' }} />
  </div>
)

// ป้ายแรกของ breadcrumb (มุมบนซ้าย) — คลิกแล้วกลับหน้าแรกหลังบ้าน
// เดิมใส่ 'BYD' แต่ Payload บีบช่องนี้เหลือ 18px เลยโดนตัดเหลือ "B." อ่านไม่รู้เรื่อง
// จึงเปลี่ยนเป็นคำว่า "หน้าแรก" + คลาสไปคลายความกว้างใน custom.css
export const AdminIcon = () => (
  <span className="hc-stepnav-home">หน้าแรก</span>
)
