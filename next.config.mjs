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

  // 301 จาก URL ของ WordPress เดิม (hiclassevcar.com ก่อน 10 ก.ย. 2569) → หน้าใหม่
  // เรียงจากเจาะจง → กว้าง (Next ใช้กฎแรกที่แมตช์) · แหล่งที่มา: sitemap ของ Rank Math บนเว็บเก่า
  async redirects() {
    const R = (source, destination) => ({ source, destination, permanent: true })
    return [
      // --- หน้า (page-sitemap) ---
      R('/byd-seailon-5-dm-i', '/car-model/sealion-5'), // สะกดผิดในเว็บเก่า
      R('/byd-sealion-7', '/car-model/sealion-7'),
      R('/byd-sealion-6-dm-i', '/car-model/sealion-6'),
      R('/byd-seal-6', '/car-model/seal-6'),
      R('/byd-m6', '/car-model/m6'),
      R('/byd-dolphin', '/car-model/dolphin'),
      R('/byd-atto-1', '/car-model/atto-1'),
      R('/byd-atto-2', '/car-model/atto-2'),
      R('/elementor-2812', '/car-model/atto-3'), // หน้า ATTO 3 เดิม
      R('/3771-2', '/car-model/atto-2'), // หน้า ATTO 2 เดิม
      R('/byd', '/car-model/seal-5'), // หน้า SEAL 5 DM-i เดิม
      R('/ladprao', '/branches/ladprao'),
      R('/bonmarche', '/branches/bonmarche'),
      R('/rama5', '/branches/rama5'),
      R('/kanchanaphisek', '/branches/kanchana'),
      R('/ratchada', '/branches/ratchada'),
      R('/https-hiclassevcar-com-branches-byd-ev', '/branches'),
      R('/services', '/service'),
      R('/%E0%B8%9A%E0%B8%A3%E0%B8%B4%E0%B8%81%E0%B8%B2%E0%B8%A3%E0%B8%A3%E0%B8%96%E0%B9%83%E0%B8%AB%E0%B9%89%E0%B9%80%E0%B8%8A%E0%B9%88%E0%B8%B2', '/rental'), // /บริการรถให้เช่า,
      R('/%E0%B8%95%E0%B8%B4%E0%B8%94%E0%B8%95%E0%B9%88%E0%B8%AD%E0%B9%80%E0%B8%A3%E0%B8%B2', '/contact'), // /ติดต่อเรา,
      R('/blog', '/news'),
      R('/category/promotion', '/promotion'),
      R('/category/:path*', '/news'),
      // --- บทความ (post-sitemap) ที่ระบุรุ่นได้จาก slug ---
      R('/%E0%B8%95%E0%B8%B2%E0%B8%A3%E0%B8%B2%E0%B8%87%E0%B8%9C%E0%B9%88%E0%B8%AD%E0%B8%99%E0%B8%9B%E0%B8%B5-2026', '/news/byd-installment-plan-2026'), // /ตารางผ่อนปี-2026,
      R('/byd-atto-3-:rest(.*)', '/car-model/atto-3'),
      R('/byd-sealion-7-:rest(.*)', '/car-model/sealion-7'),
      R('/byd-sealion-6-:rest(.*)', '/car-model/sealion-6'),
      R('/byd-sealion-5-:rest(.*)', '/car-model/sealion-5'),
      R('/byd-seal-6-:rest(.*)', '/car-model/seal-6'),
      R('/byd-seal-5-:rest(.*)', '/car-model/seal-5'),
      R('/byd-dolphin:rest(.*)', '/car-model/dolphin'),
      // --- บทความอื่นทั้งหมด (byd-1234, byd-dm-i-*, dm-i-*, ev-123 …) → ข่าว ---
      R('/byd-:rest(.*)', '/news'),
      R('/byd:rest(\\d.*)', '/news'),
      R('/dm-i:rest(.*)', '/news'),
      R('/ev-123', '/news'),
      R('/feed', '/news'),
    ]
  },
}

export default withPayload(nextConfig)
