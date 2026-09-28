'use client'

import { useEffect, useState } from 'react'

/**
 * กับดักบอท (ลูกค้าไม่เห็น) — ใส่ไว้ใน <form> แล้วส่ง fd.get('website') / fd.get('_t') ไปกับ API
 * - ช่อง "website" ซ่อนไว้นอกจอ คนไม่กรอก แต่บอทที่กรอกทุกช่องจะกรอก
 * - "_t" = เวลาที่ฟอร์มโหลดเสร็จ (ms) · ส่งเร็วกว่า 3 วินาที = บอท
 */
export default function BotTrap() {
  const [t, setT] = useState('')
  useEffect(() => setT(String(Date.now())), [])
  return (
    <div aria-hidden="true" style={{ position: 'absolute', left: '-10000px', top: 'auto', width: 1, height: 1, overflow: 'hidden' }}>
      <label>
        Website
        <input type="text" name="website" tabIndex={-1} autoComplete="off" defaultValue="" />
      </label>
      <input type="hidden" name="_t" value={t} readOnly />
    </div>
  )
}
