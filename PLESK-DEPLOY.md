# วิธีเอาเว็บขึ้น Plesk (hostatom)

คู่มือนี้ทำให้เว็บใหม่รันบนโฮสต์เดิมที่คุณจ่ายอยู่แล้ว — **ไม่มีค่าใช้จ่ายเพิ่ม**
บนเซิร์ฟเวอร์ไม่ต้อง `npm install` และไม่ต้อง build เพราะเรารวมไฟล์มาให้หมดแล้ว

---

## ก่อนเริ่ม — เช็ค 3 ข้อกับ hostatom

ถามซัพพอร์ตก่อน ถ้าข้อไหนไม่ผ่านให้หยุดแล้วคุยกันก่อน

1. แพ็กเกจนี้เลือก **Node.js เวอร์ชัน 20.9 ขึ้นไป** ได้ไหม (แนะนำ 22)
2. แอปใช้ **RAM ได้อย่างน้อย 1 GB** ไหม
3. แอป Node ที่รันค้างตลอดเวลาทำได้ไหม มีการ kill process อัตโนมัติหรือเปล่า

---

## ขั้นที่ 1 — เตรียมฐานข้อมูล (ทำครั้งเดียว บนเครื่องตัวเอง)

เอา connection string จาก Supabase: **Project Settings → Database → Connection string → URI**
ใช้โปรเจกต์ `hiclass-ev-car`

```bash
# บนเครื่องตัวเอง ในโฟลเดอร์โปรเจกต์
export DATABASE_URI="postgres://postgres.xxxx:PASSWORD@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres"
export PAYLOAD_SECRET="$(openssl rand -base64 32)"     # เก็บค่านี้ไว้ ใช้ในขั้นที่ 4 ด้วย

npx payload migrate    # สร้างตารางใน schema cms
npm run seed           # ใส่ 10 รุ่น + 5 สาขา (ครั้งเดียวพอ)
```

> ขั้นนี้ไม่แตะตาราง CRM ใน schema `public` เลย ตารางเว็บอยู่ใน schema `cms` แยกกัน

---

## ขั้นที่ 2 — สร้างไฟล์สำหรับอัปโหลด (บนเครื่องตัวเอง)

```bash
npm install
npm run build
npm run package
```

จะได้ไฟล์ **`hiclass-web-deploy.zip`** (ประมาณ 41 MB)

---

## ขั้นที่ 3 — อัปโหลดขึ้น Plesk

1. Plesk → **Files** → ไปที่ Home directory ของ `hiclassevcar.com`
2. สร้างโฟลเดอร์ใหม่ชื่อ **`app`** — *อย่าเพิ่งไปทับ `httpdocs` ที่ WordPress อยู่*
3. สร้างอีกโฟลเดอร์ชื่อ **`media`** ไว้ระดับเดียวกับ `app` (เก็บรูปที่ทีมการตลาดอัปโหลด)
4. อัปโหลด `hiclass-web-deploy.zip` เข้าโฟลเดอร์ `app` แล้วกด **Extract Files**
5. ลบไฟล์ zip ทิ้งหลังแตกเสร็จ

โครงสร้างที่ควรได้:

```
/httpdocs          ← WordPress เดิม (ยังอยู่ ยังไม่ต้องลบ)
/app               ← เว็บใหม่ มี app.js, server.js, node_modules
/media             ← รูปที่อัปโหลดผ่านหลังบ้าน
```

> **ทำไมแยก `media` ออกมา** — เวลาอัปเดตเว็บครั้งหน้าคุณจะลบของใน `app` แล้วอัปโหลดใหม่ ถ้ารูปอยู่ใน `app` รูปจะหายทั้งหมด

---

## ขั้นที่ 4 — เปิดใช้ Node.js ใน Plesk

ไปที่ **Websites & Domains → hiclassevcar.com → Node.js** (อยู่ในหมวด Dev Tools)

ตั้งค่าดังนี้:

| ช่อง | ใส่ค่า |
|---|---|
| Node.js Version | 20.9 ขึ้นไป (แนะนำ 22) |
| Package Manager | npm |
| Document Root | `/app` |
| Application Mode | `production` |
| Application Root | `/app` |
| Application Startup File | `app.js` |

จากนั้นกด **Custom environment variables** แล้วใส่ให้ครบ 5 ตัว:

| ชื่อตัวแปร | ค่า |
|---|---|
| `DATABASE_URI` | connection string จากขั้นที่ 1 |
| `PAYLOAD_SECRET` | ค่าที่สุ่มไว้ในขั้นที่ 1 |
| `MEDIA_DIR` | path เต็มของโฟลเดอร์ media เช่น `/var/www/vhosts/hiclassevcar.com/media` |
| `CRM_SUPABASE_URL` | `https://bivrzphxfmudsvtkcnpl.supabase.co` |
| `CRM_SUPABASE_SERVICE_KEY` | service_role key จาก Supabase → Project Settings → API |
| `NEXT_PUBLIC_SITE_URL` | `https://hiclassevcar.com` |

**สำคัญ** — `CRM_SUPABASE_SERVICE_KEY` เป็นกุญแจที่เข้าถึงข้อมูลลูกค้าได้ทั้งหมด
ใส่ในช่องนี้เท่านั้น ห้ามใส่ในไฟล์ที่ push ขึ้น GitHub

กด **Enable Node.js** แล้วรอสักครู่

---

## ขั้นที่ 5 — ทดสอบก่อนสลับโดเมนจริง

ตอนนี้เว็บใหม่รันอยู่แล้วแต่ยังไม่ได้ผูกกับโดเมนหลัก ทดสอบผ่าน subdomain ก่อน:

1. สร้าง subdomain เช่น `new.hiclassevcar.com` ชี้ Document Root ไปที่ `/app`
2. เปิดดูว่าหน้าแรกขึ้นครบ
3. เข้า `new.hiclassevcar.com/admin` ล็อกอินด้วย `admin@hiclassevcar.com` / `ChangeMe123!`
4. **เปลี่ยนรหัสผ่านทันที**
5. ลองแก้ราคารถสักรุ่น กด Save แล้วกลับไปดูหน้าแรก — ราคาต้องเปลี่ยนทันที
6. ลองส่งฟอร์มทดลองขับ แล้วเช็คในพอร์ทัล cinco ว่าลีดเข้าจริง ชื่อผู้รับเป็น "เว็บไซต์ - รอรับ"

**ผ่านครบ 6 ข้อแล้วค่อยไปขั้นถัดไป**

---

## ขั้นที่ 6 — สลับมาใช้เว็บใหม่

1. เปลี่ยน Document Root ของ `hiclassevcar.com` จาก `/httpdocs` เป็น `/app`
2. เช็คว่า SSL ยังทำงาน (Plesk → SSL/TLS Certificates)
3. เปิดเว็บดูจากมือถือและคอมพิวเตอร์
4. ส่ง sitemap ใหม่ใน Google Search Console
5. **เก็บ `/httpdocs` กับฐานข้อมูล WordPress ไว้อย่างน้อย 3 เดือน** เผื่อต้องย้อนกลับ

---

## เวลาจะอัปเดตเว็บครั้งต่อไป

```bash
# บนเครื่องตัวเอง
npm run build && npm run package
```

แล้วบน Plesk:
1. ลบทุกอย่างในโฟลเดอร์ `app` (ยกเว้นถ้าเผลอเก็บอะไรไว้)
2. อัปโหลด zip ใหม่ แล้ว Extract
3. กด **Restart App** ในหน้า Node.js

โฟลเดอร์ `media` ไม่ต้องแตะ รูปยังอยู่ครบ

ถ้ามีการเพิ่มช่องใหม่ใน CMS ต้องรัน `npx payload migrate` บนเครื่องตัวเองก่อนด้วย

---

## แก้ปัญหาที่เจอบ่อย

| อาการ | สาเหตุและวิธีแก้ |
|---|---|
| เปิดเว็บแล้วขึ้น 502 | ดู log ที่ Plesk → Logs หรือไฟล์ใน `/logs` มักเป็นเพราะ env ไม่ครบหรือ Node เวอร์ชันเก่าเกิน |
| ขึ้น "cannot connect to Postgres" | `DATABASE_URI` ผิด หรือ Supabase ยังไม่อนุญาต IP ของเซิร์ฟเวอร์ — ลองใช้ connection string แบบ **pooler** (port 5432 หรือ 6543) |
| รูปที่อัปโหลดหายหลังอัปเดตเว็บ | `MEDIA_DIR` ไม่ได้ตั้ง หรือชี้เข้าไปในโฟลเดอร์ `app` |
| หน้าเว็บไม่อัปเดตหลังกด Save | ปกติอัปเดตทันที ถ้าไม่ขยับให้กด Restart App |
| ฟอร์มส่งแล้วขึ้น error | ยังไม่ได้ใส่ `CRM_SUPABASE_URL` / `CRM_SUPABASE_SERVICE_KEY` |
| หลังบ้านช้ามาก | RAM ไม่พอ — ขอเพิ่มจาก hostatom หรือย้ายไป Vercel Pro |

---

## ถ้าวันหนึ่งอยากย้ายไป Vercel

โค้ดชุดเดียวกันใช้ได้เลย ไม่ต้องเขียนใหม่ — push ขึ้น GitHub, import ที่ Vercel, ใส่ env ชุดเดิม
มีจุดเดียวที่ต้องเปลี่ยน: Vercel ไม่มีดิสก์ถาวร ต้องย้ายรูปไปเก็บที่ Supabase Storage แทน `MEDIA_DIR`
