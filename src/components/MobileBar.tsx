import Link from 'next/link'
import Icon from './Icons'
import { telHref } from '@/lib/format'
import type { SiteSettings } from '@/lib/types'

/** แถบล่างติดจอบนมือถือ — โทร / แอด LINE / ทดลองขับ อยู่ทุกหน้า */
export default function MobileBar({ settings, model }: { settings: SiteSettings; model?: string }) {
  const td = model ? `/test-drive?model=${encodeURIComponent(model)}` : '/test-drive'
  return (
    <div className="mbar">
      <a className="btn btn-outline" href={telHref(settings.mainPhone)}>
        <Icon name="phone" size={18} />
        โทร
      </a>
      {settings.lineUrl ? (
        <a className="btn btn-green" href={settings.lineUrl} target="_blank" rel="noopener noreferrer">
          <Icon name="chat" size={18} color="#fff" />
          แอด LINE
        </a>
      ) : (
        <Link className="btn btn-green" href="/contact">
          <Icon name="chat" size={18} color="#fff" />
          ติดต่อเรา
        </Link>
      )}
      <Link className="btn btn-red" href={td}>
        <Icon name="wheel" size={18} color="#fff" />
        ทดลองขับ
      </Link>
    </div>
  )
}
