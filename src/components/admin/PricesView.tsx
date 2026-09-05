import type { AdminViewServerProps } from 'payload'
import { DefaultTemplate } from '@payloadcms/next/templates'
import { Gutter } from '@payloadcms/ui'
import { PriceEditor } from './PriceEditor'

/** หน้า "แก้ราคาทุกรุ่นในหน้าเดียว" — /admin/prices */
export async function PricesView(props: AdminViewServerProps) {
  const { initPageResult, params, searchParams } = props
  const { req, permissions, visibleEntities } = initPageResult
  const payload = req.payload

  const [models, settings] = await Promise.all([
    payload.find({ collection: 'car-models', limit: 100, depth: 0, sort: 'sortOrder' }),
    payload.findGlobal({ slug: 'site-settings', depth: 0 }),
  ])

  const rows = models.docs.map((m) => ({
    id: m.id,
    name: m.name,
    tagline: m.tagline,
    priceFrom: m.priceFrom,
    rangeKm: m.rangeKm ?? null,
    published: !!m.published,
    hasImage: !!m.heroImage,
    rentalAvailable: !!m.rentalAvailable,
    rentalDaily: m.rentalDaily ?? null,
    rentalMonthly: m.rentalMonthly ?? null,
  }))

  return (
    <DefaultTemplate
      i18n={req.i18n}
      locale={initPageResult.locale}
      params={params}
      payload={payload}
      permissions={permissions}
      searchParams={searchParams}
      user={req.user ?? undefined}
      visibleEntities={visibleEntities}
    >
      <Gutter className="hc-dash">
        <PriceEditor
          rows={rows}
          rate={settings.financeRate ?? 0}
          downPercent={settings.defaultDownPercent ?? 20}
          term={settings.defaultTerm ?? 60}
        />
      </Gutter>
    </DefaultTemplate>
  )
}
