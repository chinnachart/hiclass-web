/**
 * IndexNow — บอก Bing และ Yandex ทันทีที่เนื้อหาในหลังบ้านเปลี่ยน (zip #25)
 * ปกติ search engine ต้องรอมาไล่เก็บเอง อาจใช้เวลาเป็นสัปดาห์ ตัวนี้ทำให้เหลือไม่กี่นาที
 * Google ไม่รองรับ IndexNow — ฝั่ง Google ใช้ sitemap กับ Request Indexing แทน
 *
 * กุญแจต้องเปิดได้ที่ https://hiclassevcar.com/<key>.txt (ไฟล์อยู่ใน public/)
 * ถ้าเปลี่ยนกุญแจ ต้องเปลี่ยนชื่อไฟล์ใน public/ ให้ตรงกันด้วย
 */
export const INDEXNOW_KEY = '874543480eb17ba38dcfc18a2630ec45'

const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://hiclassevcar.com'

/** ส่ง URL ที่เพิ่งเปลี่ยนไปให้ IndexNow — ยิงแล้วไม่รอผล ถ้าพังก็ไม่กระทบการบันทึกในหลังบ้าน */
export function pingIndexNow(paths: string[]) {
  const host = new URL(SITE).host
  // เว็บทดสอบ (vercel.app / localhost) ไม่ต้องส่ง — กุญแจอยู่บนโดเมนจริงเท่านั้น
  if (!host.endsWith('hiclassevcar.com')) return

  const urlList = [...new Set(paths)].map((p) => `${SITE}${p}`)
  if (urlList.length === 0) return

  void fetch('https://api.indexnow.org/indexnow', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({
      host,
      key: INDEXNOW_KEY,
      keyLocation: `${SITE}/${INDEXNOW_KEY}.txt`,
      urlList,
    }),
  }).catch(() => {
    // เงียบไว้ — เป็นงานเสริม ไม่ควรทำให้การกด Save ในหลังบ้านล้มเหลว
  })
}
