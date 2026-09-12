import { revalidateTag } from 'next/cache'
import { SITE_CACHE_TAG } from './data'
import { pingIndexNow } from './indexnow'

/** ล้างแคชหน้าเว็บทันทีที่มีการแก้เนื้อหาในหลังบ้าน */
export const revalidateSite = () => {
  try {
    revalidateTag(SITE_CACHE_TAG, { expire: 0 })
  } catch {
    // ระหว่างรันสคริปต์ seed จะไม่มี context ของ Next — ข้ามไปได้
  }
}

/**
 * ล้างแคช แล้วบอก Bing/Yandex ด้วยว่าหน้าไหนเพิ่งเปลี่ยน (zip #25)
 * ใช้แทน revalidateSite ใน collection ที่รู้ว่าหน้าไหนได้รับผลกระทบ
 */
export const revalidateAndPing =
  (pathsOf: (doc: Record<string, unknown>) => string[]) =>
  (args: { doc?: Record<string, unknown> }) => {
    revalidateSite()
    try {
      if (args?.doc) pingIndexNow(pathsOf(args.doc))
    } catch {
      // ไม่ให้พลาดตรงนี้ไปกระทบการบันทึกในหลังบ้าน
    }
  }
