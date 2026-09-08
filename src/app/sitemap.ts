import type { MetadataRoute } from 'next'
import { getSiteData, getAllModelSlugs } from '@/lib/data'

export const dynamic = 'force-dynamic'

const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://hiclassevcar.com'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [{ branches }, models] = await Promise.all([getSiteData(), getAllModelSlugs()])

  return [
    { url: SITE, changeFrequency: 'weekly', priority: 1 },
    { url: `${SITE}/car-model`, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${SITE}/price`, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${SITE}/rental`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${SITE}/test-drive`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE}/promotion`, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${SITE}/branches`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${SITE}/compare`, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${SITE}/privacy`, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${SITE}/service`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${SITE}/contact`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${SITE}/news`, changeFrequency: 'weekly', priority: 0.5 },
    { url: `${SITE}/awards`, changeFrequency: 'yearly', priority: 0.6 },
    ...models.map((m) => ({
      url: `${SITE}/car-model/${m.slug}`,
      lastModified: m.updatedAt ? new Date(m.updatedAt) : undefined,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),
    ...models.map((m) => ({
      url: `${SITE}/price/${m.slug}`,
      lastModified: m.updatedAt ? new Date(m.updatedAt) : undefined,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),
    ...branches.map((b) => ({
      url: `${SITE}/branches/${b.code}`,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
  ]
}
