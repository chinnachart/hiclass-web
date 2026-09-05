# ขึ้น Vercel — ทำตามลำดับนี้

ฐานข้อมูลฝั่ง Supabase **เตรียมไว้ให้แล้ว** (schema `cms` + ข้อมูลตั้งต้น + bucket `media`)
Vercel project `hiclass-web` **ผูกกับ repo นี้แล้ว** — push แล้ว deploy เอง

## ขั้นที่ 1 · ใส่ตัวแปรใน Vercel ก่อน push (สำคัญ ไม่งั้น build พัง)

Vercel → โปรเจกต์ **hiclass-web** → Settings → Environment Variables
ใส่ทีละตัว เลือก Environment เป็น **Production + Preview** ทั้งคู่

| ชื่อ | ค่า |
|---|---|
| `DATABASE_URI` | connection string จาก Supabase แบบ **Shared pooler** พอร์ต **5432** ใส่รหัสผ่านจริงแทน `[YOUR-PASSWORD]` |
| `PAYLOAD_SECRET` | ข้อความสุ่มยาวๆ 40 ตัวอักษรขึ้นไป (ดูวิธีสร้างด้านล่าง) |
| `NEXT_PUBLIC_SITE_URL` | `https://hiclassevcar.com` |
| `CRM_SUPABASE_URL` | `https://bivrzphxfmudsvtkcnpl.supabase.co` |
| `CRM_SUPABASE_SERVICE_KEY` | Supabase → Project Settings → API Keys → **service_role** |
| `S3_BUCKET` | `media` |
| `S3_ENDPOINT` | `https://bivrzphxfmudsvtkcnpl.supabase.co/storage/v1/s3` |
| `S3_REGION` | `ap-southeast-1` |
| `S3_ACCESS_KEY_ID` | Supabase → Storage → Settings → **S3 Access Keys** → New access key |
| `S3_SECRET_ACCESS_KEY` | ได้พร้อมกันกับข้อบน (แสดงครั้งเดียว ก๊อบทันที) |

**สร้าง PAYLOAD_SECRET** — เปิด PowerShell แล้ววาง:
```powershell
-join ((48..57)+(65..90)+(97..122) | Get-Random -Count 48 | ForEach-Object {[char]$_})
```
หรือพิมพ์ประโยคยาวๆ ที่เดาไม่ได้เองก็ได้

> ถ้ารหัสผ่านฐานข้อมูลมีอักขระพิเศษ (`@` `#` `%` ฯลฯ) ต้องแปลงเป็น percent-encoding ก่อนใส่ใน `DATABASE_URI`
> เช่น `@` → `%40` · `#` → `%23` · `%` → `%25` — ไม่งั้นต่อไม่ติด

## ขั้นที่ 2 · push โค้ด

แตกไฟล์ `hiclass-web-src.zip` แล้วเปิด Terminal (Git Bash หรือ PowerShell) ในโฟลเดอร์นั้น:

```bash
git push -u origin main
```

แค่นี้ — repo ตั้ง remote และ branch ไว้ให้แล้ว
push เสร็จ Vercel จะ build เอง ประมาณ 2–3 นาที ดูได้ที่แท็บ Deployments

## ขั้นที่ 3 · สร้างผู้ใช้หลังบ้านคนแรก

เปิด `https://hiclass-web-titleist.vercel.app/admin` (หรือ URL ที่ Vercel ให้)
หน้าแรกจะให้ **สร้างผู้ใช้คนแรก** — ใส่อีเมลและรหัสผ่านที่แข็งแรง คนนี้จะเป็น admin

## ขั้นที่ 4 · ทดสอบให้ครบก่อนชี้โดเมนจริง

1. หน้าแรกขึ้นครบ 10 รุ่น 5 สาขา
2. เข้าหลังบ้าน → รุ่นรถ → แก้ราคาสักรุ่น → Save → หน้าแรกเปลี่ยนทันที
3. อัปโหลดรูปในคลังรูปภาพ → ต้องได้ไฟล์ `.webp`
4. ส่งฟอร์มทดลองขับ → เช็คในพอร์ทัล cinco ว่ามีลีดใหม่ชื่อผู้รับ "เว็บไซต์ - รอรับ"

## ก่อนเปิดจริง — ราคาทั้งหมดเป็นค่าตั้งต้น

**ราคา ระยะทาง และจำนวนสีของทุกรุ่นเป็นตัวเลขตั้งต้น ยังไม่ใช่ราคาจริง**
ทีมการตลาดต้องเข้าไปแก้ให้ครบทั้ง 10 รุ่นในหลังบ้านก่อนชี้โดเมน `hiclassevcar.com` มาที่เว็บใหม่
หน้าเช่ารถจะยังว่างจนกว่าจะติ๊ก "รุ่นนี้มีให้เช่า" และกรอกค่าเช่า

## ขั้นที่ 5 · ชี้โดเมน (ทำเมื่อข้อ 4 ผ่านครบ)

Vercel → hiclass-web → Settings → Domains → Add `hiclassevcar.com`
Vercel จะบอก A record / CNAME ที่ต้องตั้งใน DNS ของคุณ (ns1/ns2.hiclassevcar.com)
