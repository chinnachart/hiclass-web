# CLAUDE.md — hiclass-web (เว็บ hiclassevcar.com)

เจ้าของ: Title (ชินชาติ) · Hi-Class EV Car (ดีลเลอร์ BYD) · Next.js + Payload CMS · Vercel auto-deploy `main` = production ทันที
ระบบพนักงาน Cinco อยู่อีก repo (hiclass-portal) แต่ใช้ Supabase เดียวกัน `bivrzphxfmudsvtkcnpl` (schema `cms` = เว็บนี้ · `public` = Cinco)

## วิธีตอบเจ้าของ
ห้ามใช้เครื่องหมายจุดกลาง "·" (13 พ.ย. 2026 เจ้าของไม่ชอบ มองว่าเป็นเอกลักษณ์ที่ Claude เขียน): ห้ามใช้ในคำตอบ ข้อความบนเว็บ เอกสาร และสไลด์ ทั้งของใหม่และเวลาแก้ของเดิม ใช้เว้นวรรค ขึ้นบรรทัดใหม่ ขีดกลาง หรือขีดตั้ง | แทน — ยกเว้นรูปแบบ notes ที่ส่งเข้า CNC ตามสัญญาด้านล่าง (ระบบอ่านด้วย regex) ห้ามเปลี่ยนโดยไม่แก้ทั้งสองฝั่ง
ชื่อเรียก: ตั้งแต่ 13 พ.ย. 2026 เจ้าของให้เรียกระบบพนักงานว่า "CNC" (เดิมเรียก Cinco) — ใช้คำว่า CNC ในคำตอบและเอกสาร · ชื่อในโค้ด/โดเมนยังเป็น Cinco จนกว่าเจ้าของสั่งเปลี่ยน
ภาษาไทย สั้น เริ่มด้วย "ทำอะไรไปแล้ว" · ข้อความธรรมดา ไม่ใช้ Markdown หนัก (iPad สระหาย) · ไม่ชัวร์ถามเป็นข้อๆ · รายงาน: แก้อะไร · เทสต์ผ่าน · commit · ต้องเช็คอะไรต่อ

## Flow
1. `git pull` → แก้ → เทสต์ → commit → `git push origin main` → เช็ค Vercel deploy
2. งานใหญ่/เสี่ยง → branch + PR ให้เจ้าของดู preview ก่อน
3. เพิ่ม 1 บรรทัดใน `docs/CHANGELOG.md`

## เทสต์ก่อน push (ห้ามข้าม)
- `npx tsc --noEmit` + `npx next build` ผ่าน (ใช้ `DATABASE_URI` ปลอมได้)
- มีคอมโพเนนต์หลังบ้าน "ใหม่" → `npx payload generate:importmap` แล้ว commit ไฟล์ importmap ด้วย (แก้เนื้อในคอมโพเนนต์เดิมไม่ต้อง)

## Migration (บทเรียน 28 ก.ย. — Vercel ไม่รัน Payload migration ให้)
- มีไฟล์ใหม่ใน `src/migrations/` → ต้องรัน SQL นั้นบน Supabase schema `cms` **ก่อน** push โค้ด ไม่งั้น /admin และหน้ารุ่นรถ 500 ทันที
- ใน SQL ต้อง insert ชื่อ migration ลง `cms.payload_migrations` ด้วย
- Claude รัน DDL เองได้ด้วย Supabase MCP `apply_migration` (ทดสอบ BEGIN…ROLLBACK ก่อน · ใส่ rollback SQL ในรายงาน) · ไม่มี MCP → บอกเจ้าของรันใน SQL Editor

## สัญญากับ Cinco (ห้ามเปลี่ยนรูปแบบโดยไม่แก้ทั้งสองฝั่ง)
- ลีดเข้า `public.crm_leads`: seller_name 'เว็บไซต์ - รอรับ' · lead_source 'Website' · branch/model ไม่มีเว้นวรรค (พระราม5 กาญจนาภิเษก ลาดพร้าว รัชดา บองมาร์เช่ เหม่งจ๋าย) · contact_info เบอร์ล้วน · **ห้ามส่ง** seller_id / seller_ref / phone_digits
- /test-drive: interest Hot · test_drive true · appointment_date/slot · notes เริ่ม `สะดวก: …` (Cinco อ่านด้วย regex หยุดที่ `·`)
- /register: interest Warm · test_drive false · notes `อีเมล: … · LINE ID: … · หมายเหตุ: …`
- ทั้งสอง: notes ต่อท้าย `ที่มา: … · gclid:… · หน้าแรกที่เข้า:…`
- กระดิ่ง `notifications` kind 'web_lead' tab 'mktleads' ref = lead id · body ห้ามมีเบอร์
- /trade-in → `trade_in_requests` · /service#appointment → `service_appointments` (ไม่ใช่ลีด)
- รุ่นบนเว็บ 10 รุ่น (ไม่มี Seal, E6, T3)

## อื่นๆ
- ขนาดรูปมาตรฐานอยู่ที่ `src/lib/imageSpecs.ts` (แหล่งเดียว)
- redirect เว็บเก่า WordPress อยู่ใน `next.config.mjs` · path ไทยต้อง percent-encode · ใช้ `:rest(.*)` แทน `:rest*` หลังขีด
- Google Ads / GA4 ผ่าน `components/Tracking.tsx` แบบ Consent Mode v2 · AW-ID/label ตั้งในหลังบ้าน (SiteSettings)
- ห้าม commit key/token · service key อยู่ใน env Vercel เท่านั้น
