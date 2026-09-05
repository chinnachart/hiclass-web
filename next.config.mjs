import { withPayload } from '@payloadcms/next/withPayload'

/** @type {import('next').NextConfig} */
const nextConfig = {
  // รวมทุกอย่างที่ต้องใช้ตอนรันไว้ในโฟลเดอร์เดียว
  // ทำให้เอาขึ้น Plesk ได้โดยไม่ต้อง npm install บนเซิร์ฟเวอร์
  // Vercel จัดการ bundle เอง — standalone ใช้เฉพาะตอน build ไปวางบนเซิร์ฟเวอร์ของตัวเอง
  ...(process.env.VERCEL ? {} : { output: 'standalone', outputFileTracingRoot: process.cwd() }),
  images: {
    formats: ['image/avif', 'image/webp'],
    // Plesk ไม่มี CDN แปลงภาพให้ — ให้ Next แปลงเองแล้วแคชไว้
    minimumCacheTTL: 2678400,
  },
  serverExternalPackages: ['sharp'],
}

export default withPayload(nextConfig)
