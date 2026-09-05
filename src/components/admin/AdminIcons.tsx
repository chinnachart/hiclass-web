/* ไอคอนสำหรับหลังบ้าน — ไฟล์แยกเพราะใช้ทั้งฝั่ง server และ client */
const PATHS: Record<string, string> = {
  car: 'M3 13l2-5a2 2 0 0 1 2-1h10a2 2 0 0 1 2 1l2 5v5h-2a2 2 0 0 1-4 0H9a2 2 0 0 1-4 0H3v-5z M3 13h18',
  tag: 'M3 12V4h8l9 9-8 8-9-9z M9 8.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z',
  image: 'M3 6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M11 10a2 2 0 1 1-4 0 2 2 0 0 1 4 0z M21 16l-5-5-8 9',
  pin: 'M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z M14.5 9.5a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0z',
  edit: 'M4 20h4l10-10-4-4L4 16v4z M13 7l4 4',
  eye: 'M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12z M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0z',
  plus: 'M12 5v14M5 12h14',
  check: 'M5 12l5 5L20 7',
  arrow: 'M5 12h14M13 6l6 6-6 6',
}

export function AdminIcon({ name, size = 18, color = 'currentColor' }: { name: string; size?: number; color?: string }) {
  const d = PATHS[name]
  if (!d) return null
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flexShrink: 0 }}>
      <path d={d} />
    </svg>
  )
}
