/* ไอคอนเส้น 24px ชุดเดียวทั้งเว็บ — ไม่ใช้อีโมจิ */
type P = { size?: number; color?: string; sw?: number; className?: string }

const PATHS: Record<string, string> = {
  phone: 'M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2',
  chat: 'M21 12a8 8 0 0 1-8 8H8l-4 3v-4.5A8 8 0 0 1 3 12a8 8 0 0 1 9-8 8 8 0 0 1 9 8z',
  pin: 'M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z M14.5 9.5a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0z',
  wheel: 'M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0z M12 3v6M12 15v6M3 12h6M15 12h6',
  chev: 'M9 6l6 6-6 6',
  chevd: 'M6 9l6 6 6-6',
  back: 'M15 6l-6 6 6 6',
  menu: 'M4 7h16M4 12h16M4 17h16',
  x: 'M6 6l12 12M18 6L6 18',
  check: 'M5 12l5 5L20 7',
  arrow: 'M5 12h14M13 6l6 6-6 6',
  nav: 'M3 11l18-8-8 18-2-8-8-2z',
  calendar: 'M3 7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M3 10h18M8 3v4M16 3v4',
  clock: 'M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z M12 7v5l3 2',
  bolt: 'M13 2L4 14h7l-1 8 9-12h-7l1-8z',
  search: 'M18 11a7 7 0 1 1-14 0 7 7 0 0 1 14 0z M20 20l-3.5-3.5',
  car: 'M3 13l2-5a2 2 0 0 1 2-1h10a2 2 0 0 1 2 1l2 5v5h-2a2 2 0 0 1-4 0H9a2 2 0 0 1-4 0H3v-5z M3 13h18',
  wrench: 'M14.7 6.3a4 4 0 0 0 5 5l-9.4 9.4a2 2 0 0 1-2.8-2.8L16.9 8.5',
  key: 'M15 9a3 3 0 1 1 6 0 3 3 0 0 1-6 0z M15.5 11.5L4 23l-1-1 2-2 1 1 2-2-1-1 2-2 1 1 2-2',
  shield: 'M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3z M9 12l2 2 4-4',
  swap: 'M4 8h13l-3-3M20 16H7l3 3',
  facebook: 'M14 8h3V4h-3a4 4 0 0 0-4 4v3H7v4h3v6h4v-6h3l1-4h-4V8z',
}

export default function Icon({ name, size = 20, color = 'currentColor', sw = 2, className }: P & { name: keyof typeof PATHS | string }) {
  const d = PATHS[name]
  if (!d) return null
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={sw}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d={d} />
    </svg>
  )
}
