/** เมนูหลัก — ชื่อและลำดับเหมือนเว็บปัจจุบันทุกประการ */
export const NAV = [
  { href: '/', label: 'Home' },
  { href: '/promotion', label: 'Promotion' },
  { href: '/car-model', label: 'Car Model', drop: 'models' },
  { href: '/price', label: 'ราคา/ผ่อน' },
  { href: '/service', label: 'Service' },
  { href: '/rental', label: 'บริการรถให้เช่า' },
  { href: '/branches', label: 'สาขาของเรา', drop: 'branches' },
  { href: '/contact', label: 'ติดต่อเรา' },
  { href: '/news', label: 'ข่าวสารและกิจกรรม' },
] as const
