import '@fontsource/kanit/thai-600.css'
import '@fontsource/kanit/latin-600.css'
import '@fontsource/noto-sans-thai/thai-400.css'
import '@fontsource/noto-sans-thai/latin-400.css'

// layout แยกสำหรับหน้าทดลองดีไซน์ — ไม่ต่อฐานข้อมูล (preview ของ Vercel ไม่มี env)
export const metadata = { robots: { index: false, follow: false } }

export default function PreviewLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th">
      <body style={{ margin: 0, background: '#fff', fontFamily: "'Noto Sans Thai', sans-serif", ['--font-display' as string]: "'Kanit', 'Noto Sans Thai', sans-serif" }}>
        {children}
      </body>
    </html>
  )
}
