export const AdminLogo = () => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '4px 0' }}>
    {/* eslint-disable-next-line @next/next/no-img-element -- หลังบ้าน ไม่ต้องผ่าน next/image */}
    <img src="/brand/byd-logo.png" alt="BYD" style={{ height: 24, width: 'auto', display: 'block' }} />
    <span style={{ width: 1, height: 30, background: 'currentColor', opacity: 0.3 }} />
    <span style={{ fontWeight: 600, fontSize: 14, letterSpacing: '.14em', lineHeight: 1.2 }}>
      HI-CLASS
      <br />
      EV CAR
    </span>
  </div>
)

// ป้ายแรกของ breadcrumb (มุมบนซ้าย) — คลิกแล้วกลับหน้าแรกหลังบ้าน
// เดิมใส่ 'BYD' แต่ Payload บีบช่องนี้เหลือ 18px เลยโดนตัดเหลือ "B." อ่านไม่รู้เรื่อง
// จึงเปลี่ยนเป็นคำว่า "หน้าแรก" + คลาสไปคลายความกว้างใน custom.css
export const AdminIcon = () => (
  <span className="hc-stepnav-home">หน้าแรก</span>
)
