'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

/** ปุ่มลบคำตอบในหน้าดูผล Outing 2570 (ใช้ลบคำตอบทดสอบ หรือคำตอบที่กรอกผิด) — ถามยืนยันก่อนลบ ลบแล้วกู้คืนไม่ได้ */
export default function OutingDeleteButton({ id, name, accessKey }: { id: number; name: string; accessKey: string }) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  async function del() {
    if (busy) return
    if (!window.confirm(`ลบคำตอบของ "${name}" ?\n\nลบแล้วกู้คืนไม่ได้`)) return
    setBusy(true)
    try {
      const res = await fetch('/api/outing/delete', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, key: accessKey }) })
      const data = await res.json().catch(() => ({}))
      if (!res.ok && res.status !== 404) throw new Error(data?.message || 'ลบไม่สำเร็จ')
      router.refresh()
    } catch (e) {
      window.alert(e instanceof Error ? e.message : 'ลบไม่สำเร็จ')
    } finally {
      setBusy(false)
    }
  }
  return (
    <button type="button" onClick={del} disabled={busy} style={{ fontSize: 12, fontWeight: 600, color: 'var(--red)', border: '1px solid var(--line)', background: '#fff', borderRadius: 8, padding: '4px 10px', cursor: 'pointer', whiteSpace: 'nowrap' }}>
      {busy ? 'กำลังลบ…' : 'ลบ'}
    </button>
  )
}
