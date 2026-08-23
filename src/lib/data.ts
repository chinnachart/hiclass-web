import { unstable_cache } from 'next/cache'
import { getPayload } from 'payload'
import config from '@payload-config'
import type { Branch, CarModel, NewsItem, Promotion, SiteSettings } from './types'

export const SITE_CACHE_TAG = 'site-content'

async function loadSiteData() {
  const payload = await getPayload({ config })
  const now = new Date().toISOString()

  const [models, branches, promotions, news, settings] = await Promise.all([
    payload.find({
      collection: 'car-models',
      where: { published: { equals: true } },
      sort: 'sortOrder',
      limit: 50,
      depth: 1,
    }),
    payload.find({
      collection: 'branches',
      where: { published: { equals: true } },
      sort: 'sortOrder',
      limit: 50,
      depth: 0,
    }),
    payload.find({
      collection: 'promotions',
      where: {
        and: [
          { or: [{ startDate: { less_than_equal: now } }, { startDate: { exists: false } }] },
          { or: [{ endDate: { greater_than_equal: now } }, { endDate: { exists: false } }] },
        ],
      },
      sort: 'sortOrder',
      limit: 12,
      depth: 1,
    }),
    payload.find({ collection: 'news', sort: '-publishedAt', limit: 3, depth: 1 }),
    payload.findGlobal({ slug: 'site-settings', depth: 0 }),
  ])

  return {
    models: models.docs as unknown as CarModel[],
    branches: branches.docs as unknown as Branch[],
    promotions: promotions.docs as unknown as Promotion[],
    news: news.docs as unknown as NewsItem[],
    settings: settings as unknown as SiteSettings,
  }
}

/**
 * แคชผลลัพธ์ไว้ 5 นาที และล้างแคชทันทีเมื่อทีมการตลาดกด Save ในหลังบ้าน
 *
 * ที่ทำแบบนี้เพราะไม่อยากให้ตอน build ต้องต่อฐานข้อมูล —
 * ทำให้ deploy บนโฮสต์ทั่วไป (เช่น Plesk) ง่ายและพังยากกว่ามาก
 */
export const getSiteData = unstable_cache(loadSiteData, ['site-data'], {
  revalidate: 300,
  tags: [SITE_CACHE_TAG],
})
