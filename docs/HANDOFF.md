# HANDOFF — สรุปงานที่ทำกับ Claude Code (เซสชันเครื่อง Windows · 1 พ.ย. 2026)

ไฟล์นี้มีเหมือนกันทั้ง 2 repo (hiclass-web และ hiclass-portal) เพื่อให้ Claude Code เซสชันใหม่ (cloud) รู้บริบททั้งหมด
อ่านคู่กับ CLAUDE.md ของ repo นั้นๆ (CLAUDE.md ชนะไฟล์นี้ถ้าขัดกัน)

---

## 1. เจ้าของและวิธีตอบ
- Title (ชินชาติ) · Sales Director, Hi-Class EV Car (ดีลเลอร์ BYD) · ดูแลทั้ง IT, ฝ่ายขาย, MKT และโปรเจกต์สาขาใหม่ เหม่งจ๋าย
- ตอบภาษาไทย สั้น ข้อความธรรมดา ไม่ใช้ Markdown หนัก (iPad สระไทยหาย) · ไม่ชัวร์ให้ถามเป็นข้อๆ
- ห้ามส่งข้อความในนามเจ้าของ/ทีม (LINE ฯลฯ) โดยไม่ให้อ่านร่างก่อน · LINE OA ใกล้เต็มโควต้า อย่าเพิ่ม LINE push โดยไม่ถาม
- ห้าม commit token/key/รหัสผ่าน · ใช้ env ของ Vercel

## 2. ระบบโดยย่อ
| | Cinco (hiclass-portal) | เว็บ (hiclass-web) |
|---|---|---|
| URL | cinco.hiclassevcar.com | hiclassevcar.com (หลังบ้าน /admin) |
| Stack | React single-file src/App.jsx (~23,400 บรรทัด, CRLF) + Vite | Next.js App Router + Payload CMS |
| DB | Supabase bivrzphxfmudsvtkcnpl schema public | Supabase เดียวกัน schema cms |
| Deploy | push main = production ทันที (Vercel) | push main = production ทันที (Vercel) |
| GitHub | chinnachart/hiclass-portal | chinnachart/hiclass-web |

- Vercel preview ของ branch ต้องล็อกอิน Vercel ถึงจะเปิดดูได้
- เว็บ: cache ข้อมูล CMS 300 วินาที (unstable_cache) · กด Save ในหลังบ้าน = ล้าง cache ทันที · แก้ DB ตรง = รอสูงสุด 5 นาที
- เว็บ: ทุก route ใน (site) เป็น force-dynamic (ตั้งใจไว้ ไม่เปลี่ยนเป็น ISR เพราะเสี่ยง build พัง และ TTFB 0.2-0.3s ดีอยู่แล้ว)
- เว็บ: title template "%s | BYD Hi-Class EV Car" · หน้ารุ่นใช้ title: { absolute } เลี่ยง template
- เครื่องเจ้าของเป็น Windows: ไฟล์หลายไฟล์ CRLF · Python ต้อง PYTHONUTF8=1 ไม่งั้นภาษาไทยเพี้ยน
- อย่าแตะ git repo ในโฟลเดอร์ Downloads ของเจ้าของ (มีงานเว็บที่ยังไม่ commit: globals.css, page.tsx, sitemap.ts, Footer.tsx)

## 3. งานที่ทำเสร็จแล้ว

### Cinco
- commit CLAUDE.md + .gitignore (node_modules/, dist/) — main 4780569
- v313 แก้ "ข้อมูลโหลดไม่ขึ้นหลังเปิดทิ้งไว้" — **ยังไม่ merge** อยู่ใน PR https://github.com/chinnachart/hiclass-portal/pull/2 (branch v313-token-sync, commit 6d66305)
  - สาเหตุ: เปิดหลายแท็บ แต่ละแท็บ refresh token เอง → Supabase หมุน refresh token → แท็บอื่นได้ refresh_token_already_used → 401 PGRST303 ~290 ครั้ง/วัน
  - แก้: useEffect refresh ใน App.jsx เพิ่ม adopt (ใช้ token ใหม่กว่าจาก localStorage "hc_session_v1"), busy guard, catch แล้วอ่าน session ซ้ำ, ฟัง visibilitychange และ storage event
  - เพิ่ม scripts/smoke.mjs (esbuild + jsdom, 6 เช็ค: หน้า login, restore session, adopt token จากแท็บอื่น, แพ้ race แล้ว adopt, refresh เอง, ไม่มี render error) และ docs/CHANGELOG.md
  - รอ: เจ้าของดู preview แล้วตัดสินใจ merge · หลัง merge ควรเช็คจำนวน 401 ใน Supabase logs ว่าลดลง

### เว็บ (main ล่าสุด bfd25bd)
- 23c56e7 เพิ่ม CLAUDE.md
- 8b2fb62 ทดลองขับ: โทรกลับภายใน 25 นาที (เดิม 1 ชั่วโมง) ทุกหน้า: awards, car-model/[slug], contact, delivery, หน้าแรก, test-drive, TestDriveForm.tsx, seoModel.ts
  - DB (schema cms) แก้แล้วด้วย: page_content.aw_cta_sub และ news id 7, 8, 9, 19, 20 (1 ชั่วโมง → 25 นาที)
- 4543ce2 / 57d0d71 ปุ่ม LINE: ไม่มี LINE กลาง (เจ้าของตัดสินใจใช้ LINE แยกสาขา) → CallPicker.tsx มี prop kind="line" ให้เลือกสาขา (กรองสาขาที่มี lineUrl) ใช้ใน MobileBar, MobileMenu, ModelCarousel (หน้าแรก), car-model/[slug], awards
- 4543ce2 หน้าใหม่ /faq รวมคำถาม (ซื้อ/ทดลองขับ + tiFaq/svFaq/rtFaq จาก CMS) · ใส่ใน sitemap และ Footer · ใช้ breadcrumbLd อย่างเดียว (กัน FAQPage schema ซ้ำ)
- 5c77860 ลิงก์รีวิว Google ของแต่ละสาขา (หน้า /reviews และหน้าสาขา) ใช้ mapUrl ของสาขา
- 7a6773f SEO: title หน้ารุ่น "BYD {รุ่น} {ปี} ราคา ตารางผ่อน สเปค สี | Hi-Class" · description ~130 ตัวอักษร
- bfd25bd SEO: หน้ารุ่นเพิ่ม #overview "ภาพรวม", "เหมาะกับใคร", #compare ตารางเทียบ 2 รุ่นใกล้เคียง, FAQ เพิ่ม (extraFaq) — สร้างจากข้อมูลจริงใน src/lib/seoModel.ts (nearestModels, modelOverview, modelFitFor, extraFaq) · เนื้อหาต่อหน้า 888 → ~1,100 คำ

## 4. ข้อมูลที่สรุปให้เจ้าของแล้ว (ไม่ใช่งานโค้ด)
- เทียบเว็บกับ bydsuscobeyond.com และ bydmetromobile.com (ตาราง + SEO) — จุดที่ metromobile ยังเหนือกว่า: เนื้อหาต่อหน้ารุ่นมากกว่า (~2,700 คำรวมเมนู), มีแกลเลอรีภาพทุกมุม, ตารางรุ่นย่อย
- หมายเหตุ: รายงานเทียบรอบแรกเคยบอกผิดว่าเว็บเราไม่มีปุ่มโทร/ไม่ prefill รุ่นในฟอร์มทดลองขับ — จริงๆ มีแล้ว (ยอมรับกับเจ้าของแล้ว) → ก่อนสรุปว่า "ไม่มี" ให้เช็คโค้ดก่อนเสมอ
- ไอเดียพัฒนา 10 ข้อ (Cinco + เว็บ), ประเด็นขอขึ้นเงินเดือน — คุยในแชทแล้ว ไม่ต้องทำต่อ
- วิธีดู preview และหลักการ branch vs production

## 5. งานค้าง / ขั้นต่อไป
1. Cinco PR #2 (v313): รอเจ้าของดู preview แล้วสั่ง merge — ห้าม merge เองโดยไม่ได้รับอนุญาต
2. หลัง merge v313: เช็ค Supabase API logs ว่า 401 / PGRST303 ลดลง
3. รูป gallery หน้ารุ่น: ทุกรุ่นมี 0 รูป · โค้ดแสดงผลมีแล้ว (h2 "รูปเพิ่มเติม", alt ใช้ g.alt หรือ fallback "BYD {รุ่น}")
   - เจ้าของต้องอัปเอง: /admin → "รุ่นรถ" → เลือกรุ่น → ช่อง "รูปเพิ่มเติม" (ใต้ "รูปหลักของรุ่นนี้") → Create New / Choose from existing → ใส่ "คำอธิบายรูป" (alt) เช่น "BYD Atto 3 ภายใน คอนโซลหน้า" → Save
   - แนะนำ 1600×1200 แนวนอน ≤5 MB, 5-8 รูป/รุ่น · ถ้าเว้น alt ระบบใช้ชื่อไฟล์ → ตั้งชื่อไฟล์ให้สื่อความหมาย
   - เจ้าของจะบอกเมื่ออัปเสร็จ → Claude เปิดเช็คว่ารูปขึ้นทุกรุ่นและ alt ถูกต้อง
4. SEO ต่อ (ถ้าเจ้าของสั่ง): ตารางรุ่นย่อย+ราคาต่อรุ่นย่อย, เนื้อหาเพิ่มให้ใกล้ metromobile

## 6. เครื่องมือ/ทริกที่ใช้
- เช็ค deploy: commit statuses ของ GitHub ที่ context มีคำว่า "Vercel" (`gh api repos/chinnachart/<repo>/commits/<sha>/statuses`)
- Supabase MCP: execute_sql (select), apply_migration (DDL), query_logs (ดู error API)
- แก้ข้อมูล DB (UPDATE) → ขออนุญาตเจ้าของในแชทก่อนเสมอ และให้ rollback SQL
- เว็บ: มีไฟล์ใหม่ใน src/migrations/ → ต้องรัน SQL บน schema cms ก่อน push
- เว็บ: ห้ามส่ง seller_id / seller_ref / phone_digits ในข้อมูลลีด · รูปแบบ notes "สะดวก: ..." ห้ามเปลี่ยนฝั่งเดียว
