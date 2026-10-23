/** แบบสำรวจคอร์ส AI สำหรับพนักงาน (/ai-course) — ตัวเลือกใช้ร่วมกันทั้งฟอร์มและ API
 *  ข้อมูลลง public.ai_course_survey (RLS เปิด ไม่มี policy = เขียน/อ่านได้เฉพาะ service_role)
 *  เจ้าของดูผ่าน Google Sheet ที่ดึง /api/ai-course/export?key=… (IMPORTDATA) */

export const AI_LEVELS = [
  'ไม่เคยใช้เลย',
  'เคยลองใช้บ้าง',
  'ใช้ในงานเป็นประจำ',
  'ใช้คล่อง สอนคนอื่นได้',
] as const

export const KNOWN_AIS = [
  'ChatGPT',
  'Google Gemini',
  'Claude',
  'Microsoft Copilot',
  'Meta AI (ใน Facebook/Messenger)',
  'Grok',
  'DeepSeek',
  'Perplexity',
  'Canva AI',
  'CapCut AI',
  'ยังไม่รู้จักตัวไหนเลย',
] as const

export const TOPICS = [
  'เริ่มต้นใช้ AI ตั้งแต่ศูนย์',
  'เทคนิคถาม AI ให้ได้คำตอบดี (Prompt)',
  'ตอบแชทลูกค้า LINE / Facebook',
  'เขียนแคปชั่น โพสต์ขายรถ',
  'ทำรูป / วิดีโอด้วย AI',
  'สรุปตัวเลข Excel / Google Sheet',
  'เขียนเอกสาร อีเมล ใบเสนอราคา',
  'สรุปประชุม / ถอดเสียง',
  'แปลภาษา (อังกฤษ / จีน)',
  'ค้นข้อมูลรถ เทียบคู่แข่ง',
] as const

export const HOME_BRANCH_EXTRA = ['สำนักงาน / ส่วนกลาง', 'อื่นๆ'] as const

export const pickList = (v: unknown, allowed: readonly string[], max = 20): string[] =>
  Array.isArray(v) ? [...new Set(v.map((x) => String(x)).filter((x) => allowed.includes(x)))].slice(0, max) : []
