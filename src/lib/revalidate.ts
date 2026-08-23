import { revalidateTag } from 'next/cache'
import { SITE_CACHE_TAG } from './data'

/** ล้างแคชหน้าเว็บทันทีที่มีการแก้เนื้อหาในหลังบ้าน */
export const revalidateSite = () => {
  try {
    revalidateTag(SITE_CACHE_TAG, { expire: 0 })
  } catch {
    // ระหว่างรันสคริปต์ seed จะไม่มี context ของ Next — ข้ามไปได้
  }
}
