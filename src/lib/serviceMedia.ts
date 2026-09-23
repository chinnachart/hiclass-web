/**
 * รูปถ่ายจริงของศูนย์บริการ / อู่สี (zip #33 · 23 ก.ย. 2569)
 *
 * ไฟล์อยู่ใน `public/service/` — ย่อแล้ว (1200–1920 px · ไฟล์ละ ~100–280 KB) · เบลอทะเบียนรถแล้ว · ลบ EXIF แล้ว
 * next/image แปลงเป็น WebP + ย่อตามจอให้เองอีกชั้น
 * เปลี่ยนรูป = วางไฟล์ชื่อเดิมทับใน `public/service/` (สัดส่วนเดิม) แล้ว deploy
 * ไม่ระบุสาขาในรูป — อู่สีมี 3 สาขา (ลาดพร้าว / พระราม 5 / กาญจนาภิเษก) ใช้ชุดเดียวกัน
 */

export type ServicePhoto = { src: string; alt: string }

export const SVC_PHOTO = {
  /** 16:9 · หัวหน้า /service + การ์ดเช็กระยะ + รูปตอนแชร์ลิงก์ */
  lift: { src: '/service/service-lift.jpg', alt: 'ช่างศูนย์บริการ BYD Hi-Class ตรวจเช็กใต้ท้องรถ BYD บนลิฟต์ยก' },
  /** 16:9 · การ์ดเช็กระยะในหน้า /service (ไม่ซ้ำกับรูปหัวหน้า) */
  receptionWide: { src: '/service/service-reception-wide.jpg', alt: 'เจ้าหน้าที่ศูนย์บริการตรวจสภาพรถลูกค้าก่อนเข้ารับบริการ' },
  /** 4:3 · ข้างฟอร์มนัดหมาย — ครอปจากรูปลิฟต์ เน้นช่าง */
  tech: { src: '/service/service-tech.jpg', alt: 'ช่างศูนย์บริการทำงานใต้ท้องรถ BYD บนลิฟต์ยก' },
  /** 16:9 · การ์ดอู่สี */
  booth: { src: '/service/bp-booth.jpg', alt: 'รถ BYD ATTO 3 หลังทำสีเสร็จ ในพื้นที่ตรวจสอบคุณภาพของอู่สี' },
  /** 16:9 · สไลด์หน้าสาขา */
  qcWide: { src: '/service/bp-qc-wide.jpg', alt: 'รถ BYD DOLPHIN ในพื้นที่ตรวจสอบคุณภาพงานสีก่อนส่งมอบ' },
  bodyWide: { src: '/service/bp-body-wide.jpg', alt: 'พื้นที่ซ่อมตัวถังในอู่สี BYD Hi-Class' },
} satisfies Record<string, ServicePhoto>

/** 6 ขั้นตอนงานอู่สี — รูป 4:3 */
export const BP_STEPS: (ServicePhoto & { title: string; body: string })[] = [
  { src: '/service/bp-step1-body.jpg', alt: 'ช่างซ่อมตัวถังรถ BYD ที่ถอดกันชนหน้า', title: 'ประเมินและซ่อมตัวถัง', body: 'ตรวจความเสียหาย ถอดชิ้นส่วนและซ่อมตัวถังด้วยอะไหล่แท้' },
  { src: '/service/bp-step2-prep.jpg', alt: 'ช่างเตรียมชิ้นงานกันชนบนขาตั้งก่อนทำสี', title: 'เตรียมชิ้นงาน', body: 'แยกชิ้นงานขึ้นขาตั้ง ทำความสะอาดและเตรียมผิวก่อนทำสี' },
  { src: '/service/bp-step3-sanding.jpg', alt: 'ช่างขัดผิวประตูรถด้วยเครื่องขัด', title: 'ขัดเตรียมผิว', body: 'ขัดผิวให้เรียบเสมอกัน เพื่อให้สีเกาะแน่นและผิวงานเนียน' },
  { src: '/service/bp-step4-color.jpg', alt: 'ชั้นแม่สีสำหรับผสมสีรถยนต์ในอู่สี', title: 'เทียบและผสมสี', body: 'ผสมสีตามสูตรและเทียบเฉดให้ตรงกับสีเดิมของรถ' },
  { src: '/service/bp-step5-booth.jpg', alt: 'รถที่คลุมพลาสติกกันละอองสีในห้องพ่นสี', title: 'พ่นสีในห้องพ่นสี', body: 'คลุมส่วนที่ไม่ทำสี แล้วพ่นในห้องพ่นสีเพื่อลดฝุ่นและละออง' },
  { src: '/service/bp-step6-qc.jpg', alt: 'รถ BYD DOLPHIN ในพื้นที่ตรวจสอบคุณภาพ', title: 'ตรวจคุณภาพก่อนส่งมอบ', body: 'ตรวจสีและรอยต่อใต้แสงไฟในพื้นที่ตรวจสอบคุณภาพ ก่อนส่งรถคืน' },
]

/** สไลด์ "ศูนย์บริการและอู่สี" บนหน้าสาขาที่มีศูนย์บริการ — 16:9 */
export const BRANCH_SERVICE_SLIDES: (ServicePhoto & { caption: string; href: string })[] = [
  { ...SVC_PHOTO.lift, caption: 'ศูนย์บริการ · เช็กระยะ', href: '/service' },
  { ...SVC_PHOTO.bodyWide, caption: 'อู่สีและซ่อมตัวถัง', href: '/service#body-paint' },
  { ...SVC_PHOTO.booth, caption: 'งานสีเสร็จพร้อมส่งมอบ', href: '/service#body-paint' },
  { ...SVC_PHOTO.qcWide, caption: 'ตรวจคุณภาพงานสี', href: '/service#body-paint' },
]
