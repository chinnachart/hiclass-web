'use client'

import { useCallback, useState } from 'react'
import Link from 'next/link'
import { AdminIcon as Ic } from './AdminIcons'

type Item = {
  wpId: number
  url: string
  thumb: string
  filename: string
  title: string
  alt: string
  width: number | null
  height: number | null
  bytes: number | null
  date: string | null
  exists: boolean
}

const kb = (n: number | null) => (n ? `${Math.round(n / 1024).toLocaleString('th-TH')} KB` : '')

/**
 * ย้ายรูปจากเว็บ WordPress เก่ามาเข้าคลังรูปของเว็บใหม่
 * เลือกรูปเป็นกลุ่ม แล้วระบบโหลดให้ทีละรูปฝั่งเซิร์ฟเวอร์ (ไม่ต้องดาวน์โหลดลงเครื่องเอง)
 */
export function WpImport({ defaultDomain }: { defaultDomain: string }) {
  const [domain, setDomain] = useState(defaultDomain)
  const [search, setSearch] = useState('')
  const [items, setItems] = useState<Item[]>([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [picked, setPicked] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(0)
  const [result, setResult] = useState<{ created: number; skipped: number; failed: string[] } | null>(null)

  const load = useCallback(
    async (p: number) => {
      setLoading(true)
      setError('')
      setResult(null)
      try {
        const qs = new URLSearchParams({ domain, page: String(p) })
        if (search.trim()) qs.set('search', search.trim())
        const res = await fetch(`/api/wp-import?${qs}`, { credentials: 'include' })
        const json = await res.json()
        if (!res.ok) throw new Error(json?.message || 'ดึงรายการรูปไม่สำเร็จ')
        setItems(json.items || [])
        setPage(json.page || p)
        setTotalPages(json.totalPages || 1)
        setTotal(json.total || 0)
        setPicked(new Set())
      } catch (err) {
        setItems([])
        setError(err instanceof Error ? err.message : 'ดึงรายการรูปไม่สำเร็จ')
      } finally {
        setLoading(false)
      }
    },
    [domain, search],
  )

  const toggle = (url: string) =>
    setPicked((prev) => {
      const next = new Set(prev)
      if (next.has(url)) next.delete(url)
      else next.add(url)
      return next
    })

  const selectable = items.filter((i) => !i.exists)
  const allPicked = selectable.length > 0 && selectable.every((i) => picked.has(i.url))

  const run = async () => {
    const queue = items.filter((i) => picked.has(i.url))
    if (!queue.length) return
    setBusy(true)
    setDone(0)
    setResult(null)
    let created = 0
    let skipped = 0
    const failed: string[] = []

    for (const it of queue) {
      try {
        const res = await fetch('/api/wp-import', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: it.url, alt: it.alt || it.title }),
        })
        const json = await res.json()
        if (!res.ok) failed.push(`${it.filename} — ${json?.message || res.status}`)
        else if (json.status === 'skipped') skipped++
        else created++
      } catch {
        failed.push(`${it.filename} — เชื่อมต่อไม่สำเร็จ`)
      }
      setDone((n) => n + 1)
    }

    setBusy(false)
    setResult({ created, skipped, failed })
    setPicked(new Set())
    setItems((prev) => prev.map((i) => (queue.includes(i) && !failed.some((f) => f.startsWith(i.filename)) ? { ...i, exists: true } : i)))
  }

  return (
    <div className="hc-wp">
      <header className="hc-wp__head">
        <h1>ย้ายรูปจากเว็บเก่า</h1>
        <p>
          ดึงรูปจากคลังรูปของเว็บ WordPress เดิมเข้ามาที่เว็บใหม่โดยตรง ไม่ต้องดาวน์โหลดลงเครื่อง
          — เลือกรูปที่ต้องการ แล้วกดปุ่มนำเข้า ระบบจะย่อขนาดและแปลงเป็น WebP ให้อัตโนมัติ
        </p>
      </header>

      <div className="hc-panel hc-wp__bar">
        <label className="hc-wp__f">
          <span>เว็บเก่า (โดเมน)</span>
          <input className="hc-input" value={domain} onChange={(e) => setDomain(e.target.value)} placeholder="hiclassevcar.com" />
        </label>
        <label className="hc-wp__f">
          <span>ค้นหาชื่อรูป (เว้นว่าง = ทั้งหมด)</span>
          <input
            className="hc-input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && load(1)}
            placeholder="เช่น sealion, atto, โปรโมชั่น"
          />
        </label>
        <button type="button" className="hc-btn hc-btn--red" onClick={() => load(1)} disabled={loading || busy}>
          {loading ? 'กำลังดึง…' : 'ดึงรายการรูป'}
        </button>
      </div>

      {error ? (
        <div className="hc-panel hc-wp__err">
          <b>{error}</b>
          <p>
            ถ้าเว็บเก่าปิด REST API อยู่ ให้ใช้วิธีสำรอง: ดาวน์โหลดรูปจากหน้า คลังสื่อ ของ WordPress ลงเครื่อง
            แล้วลากมาอัปโหลดที่ <Link href="/admin/collections/media">คลังรูปภาพ</Link> ได้เลย
          </p>
        </div>
      ) : null}

      {items.length > 0 ? (
        <>
          <div className="hc-wp__tools">
            <span className="hc-wp__count">
              พบ {total.toLocaleString('th-TH')} รูป · หน้า {page}/{totalPages} · เลือกแล้ว {picked.size}
            </span>
            <button
              type="button"
              className="hc-btn"
              onClick={() => setPicked(allPicked ? new Set() : new Set(selectable.map((i) => i.url)))}
              disabled={busy || !selectable.length}
            >
              {allPicked ? 'ล้างที่เลือก' : 'เลือกทั้งหน้านี้'}
            </button>
            <button type="button" className="hc-btn" onClick={() => load(page - 1)} disabled={page <= 1 || loading || busy}>
              ← ก่อนหน้า
            </button>
            <button type="button" className="hc-btn" onClick={() => load(page + 1)} disabled={page >= totalPages || loading || busy}>
              ถัดไป →
            </button>
            <button type="button" className="hc-btn hc-btn--red hc-wp__go" onClick={run} disabled={busy || picked.size === 0}>
              {busy ? `กำลังนำเข้า ${done}/${picked.size}…` : `นำเข้ารูปที่เลือก (${picked.size})`}
            </button>
          </div>

          {busy ? (
            <div className="hc-wp__prog">
              <span style={{ width: `${Math.round((done / Math.max(1, picked.size)) * 100)}%` }} />
            </div>
          ) : null}

          {result ? (
            <div className="hc-panel hc-wp__done">
              <b>
                <Ic name="check" size={16} /> นำเข้าสำเร็จ {result.created} รูป
                {result.skipped ? ` · มีอยู่แล้ว ${result.skipped} รูป` : ''}
                {result.failed.length ? ` · ไม่สำเร็จ ${result.failed.length} รูป` : ''}
              </b>
              {result.failed.length ? (
                <ul>
                  {result.failed.map((f) => (
                    <li key={f}>{f}</li>
                  ))}
                </ul>
              ) : null}
              <Link href="/admin/collections/media" className="hc-btn">
                <Ic name="image" size={16} /> ไปที่คลังรูปภาพ
              </Link>
            </div>
          ) : null}

          <div className="hc-wp__grid">
            {items.map((it) => {
              const on = picked.has(it.url)
              return (
                <button
                  key={it.url}
                  type="button"
                  className={`hc-wp__item${on ? ' is-on' : ''}${it.exists ? ' is-have' : ''}`}
                  onClick={() => !it.exists && !busy && toggle(it.url)}
                  aria-pressed={on}
                  title={it.filename}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={it.thumb} alt={it.alt || it.filename} loading="lazy" />
                  <span className="hc-wp__name">{it.filename}</span>
                  <span className="hc-wp__meta">
                    {it.width && it.height ? `${it.width}×${it.height}` : ''} {kb(it.bytes)}
                  </span>
                  {it.exists ? <span className="hc-wp__tag">มีแล้ว</span> : null}
                  {on ? (
                    <span className="hc-wp__tick">
                      <Ic name="check" size={14} color="#fff" />
                    </span>
                  ) : null}
                </button>
              )
            })}
          </div>
        </>
      ) : null}

      {!items.length && !loading && !error ? (
        <div className="hc-panel hc-wp__empty">
          <p>
            ใส่โดเมนของเว็บเก่าแล้วกด “ดึงรายการรูป” — ระบบจะแสดงรูปทั้งหมดในคลังสื่อของ WordPress
            เรียงจากใหม่ไปเก่า เลือกเฉพาะรูปที่ต้องการใช้บนเว็บใหม่ได้เลย
          </p>
        </div>
      ) : null}
    </div>
  )
}
