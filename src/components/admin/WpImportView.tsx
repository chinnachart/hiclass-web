import type { AdminViewServerProps } from 'payload'
import { DefaultTemplate } from '@payloadcms/next/templates'
import { Gutter } from '@payloadcms/ui'
import { WpImport } from './WpImport'

/** หน้า "ย้ายรูปจากเว็บเก่า" — /admin/wp-import */
export function WpImportView(props: AdminViewServerProps) {
  const { initPageResult, params, searchParams } = props
  const { req, permissions, visibleEntities } = initPageResult

  return (
    <DefaultTemplate
      i18n={req.i18n}
      locale={initPageResult.locale}
      params={params}
      payload={req.payload}
      permissions={permissions}
      searchParams={searchParams}
      user={req.user ?? undefined}
      visibleEntities={visibleEntities}
    >
      <Gutter className="hc-dash">
        <WpImport defaultDomain={process.env.WP_OLD_DOMAIN || 'hiclassevcar.com'} />
      </Gutter>
    </DefaultTemplate>
  )
}
