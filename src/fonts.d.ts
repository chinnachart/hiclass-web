// ให้ TypeScript รู้จักการ import ไฟล์ฟอนต์ (ใช้ใน layout เพื่อ preload) — คืนค่าเป็น URL ของไฟล์
declare module '*.woff2' {
  const src: string
  export default src
}
