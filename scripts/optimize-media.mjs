/**
 * ย่อรูปทั้งคลังให้เล็กลง (zip #25)
 *
 * ปัญหาที่แก้
 *  - รูปต้นฉบับบางไฟล์กว้างถึง 5417 พิกเซล หนัก 400 KB
 *  - ไฟล์ย่อที่ระบบสร้างไว้ (thumb/card/hero) บางไฟล์เป็น PNG หนักถึง 1.7 MB ใหญ่กว่าต้นฉบับ 3 เท่า
 *  ทั้งสองอย่างทำให้ตัวแปลงรูปของ Vercel ต้องดึงไฟล์ใหญ่มาแปลงทุกครั้งที่เจอขนาดใหม่ หน้าเว็บเลยช้าตอนโหลดครั้งแรก
 *
 * สิ่งที่สคริปต์ทำ
 *  1. อ่านรายการรูปจากฐานข้อมูล
 *  2. โหลดไฟล์จาก Supabase Storage
 *  3. ย่อให้กว้างไม่เกิน 1600 พิกเซล แปลงเป็น WebP แล้วอัปทับที่เดิม (ชื่อไฟล์เดิม URL เดิม ไม่มีลิงก์ไหนพัง)
 *  4. สร้างไฟล์ย่อ thumb/card/hero ใหม่เป็น WebP แล้วอัปเดตขนาดในฐานข้อมูลให้ตรง
 *
 * วิธีใช้ (รันบนเครื่องตัวเอง ในโฟลเดอร์โปรเจกต์)
 *   1) สร้างไฟล์ .env.local ให้มี DATABASE_URI และ S3_* ครบ (ค่าเดียวกับที่ตั้งไว้บน Vercel)
 *   2) ดูก่อนว่าจะแตะไฟล์ไหนบ้าง ยังไม่แก้จริง
 *        node --env-file=.env.local scripts/optimize-media.mjs
 *   3) ถ้าผลลัพธ์ดูถูกต้อง ค่อยสั่งทำจริง
 *        node --env-file=.env.local scripts/optimize-media.mjs --apply
 *
 * ตัวเลือกเพิ่ม
 *   --max=1600     ความกว้างสูงสุดของต้นฉบับ
 *   --quality=80   คุณภาพ WebP
 *   --only=16,34   ทำเฉพาะรูป id ที่ระบุ (ไว้ทดลองกับไฟล์เดียวก่อน)
 *
 * ข้อควรรู้
 *  - ทำงานซ้ำได้ ไฟล์ที่เล็กอยู่แล้วจะถูกข้าม
 *  - แนะนำให้สำรอง bucket ก่อนรันจริง เพราะไฟล์เดิมจะถูกเขียนทับ
 *  - หลังรันเสร็จ รูปที่ Vercel แปลงไว้แล้วจะยังเป็นของเก่าอยู่ระยะหนึ่ง กด Redeploy เพื่อล้างแคชได้
 */

import { Client } from 'pg'
import sharp from 'sharp'
import { S3Client, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3'

const args = process.argv.slice(2)
const APPLY = args.includes('--apply')
const MAX_WIDTH = Number(args.find((a) => a.startsWith('--max='))?.split('=')[1] || 1600)
const QUALITY = Number(args.find((a) => a.startsWith('--quality='))?.split('=')[1] || 80)
const ONLY = (args.find((a) => a.startsWith('--only='))?.split('=')[1] || '')
  .split(',')
  .map((n) => Number(n.trim()))
  .filter(Boolean)

// ขนาดย่อ ต้องตรงกับ imageSizes ใน src/collections/Media.ts
const SIZES = [
  { name: 'thumb', width: 400, height: 250, fit: 'cover' },
  { name: 'card', width: 800, height: null, fit: 'inside' },
  { name: 'hero', width: 1920, height: null, fit: 'inside' },
]

const need = ['DATABASE_URI', 'S3_BUCKET', 'S3_ENDPOINT', 'S3_ACCESS_KEY_ID', 'S3_SECRET_ACCESS_KEY']
const missing = need.filter((k) => !process.env[k])
if (missing.length) {
  console.error(`ขาดค่าใน .env.local: ${missing.join(', ')}`)
  process.exit(1)
}

const s3 = new S3Client({
  endpoint: process.env.S3_ENDPOINT,
  region: process.env.S3_REGION || 'ap-southeast-1',
  forcePathStyle: true,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
  },
})
const BUCKET = process.env.S3_BUCKET

const kb = (n) => `${Math.round(Number(n || 0) / 1024)} KB`

async function getObject(key) {
  const res = await s3.send(new GetObjectCommand({ Bucket: BUCKET, Key: key }))
  const chunks = []
  for await (const c of res.Body) chunks.push(c)
  return Buffer.concat(chunks)
}

async function putObject(key, body, contentType) {
  await s3.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: body,
      ContentType: contentType,
      CacheControl: 'public, max-age=31536000, immutable',
    }),
  )
}

/** เปลี่ยนนามสกุลเป็น .webp โดยคงชื่อเดิมไว้ */
const toWebpName = (filename) => filename.replace(/\.[^.]+$/, '') + '.webp'

const db = new Client({ connectionString: process.env.DATABASE_URI })
await db.connect()

const where = ONLY.length ? `where id = any($1::int[])` : ''
const { rows } = await db.query(
  `select id, filename, mime_type, filesize, width, height,
          sizes_thumb_filename, sizes_thumb_filesize,
          sizes_card_filename, sizes_card_filesize,
          sizes_hero_filename, sizes_hero_filesize
     from cms.media ${where} order by id`,
  ONLY.length ? [ONLY] : [],
)

console.log(`${APPLY ? 'กำลังทำจริง' : 'โหมดดูอย่างเดียว (ยังไม่แก้อะไร)'} · รูปทั้งหมด ${rows.length} ไฟล์ · กว้างสูงสุด ${MAX_WIDTH}px · คุณภาพ ${QUALITY}\n`)

let touched = 0
let before = 0
let after = 0

for (const m of rows) {
  if (!m.filename) continue

  const oversizedOriginal = Number(m.width) > MAX_WIDTH || Number(m.filesize) > 150 * 1024
  const badDerivative = SIZES.some((s) => {
    const fn = m[`sizes_${s.name}_filename`]
    const fs = Number(m[`sizes_${s.name}_filesize`] || 0)
    return fn && (!/\.webp$/i.test(fn) || fs > Number(m.filesize))
  })
  if (!oversizedOriginal && !badDerivative) continue

  const sizeBefore =
    Number(m.filesize || 0) +
    SIZES.reduce((sum, s) => sum + Number(m[`sizes_${s.name}_filesize`] || 0), 0)

  console.log(`#${m.id} ${m.filename}`)
  console.log(`   เดิม ${m.width}x${m.height} ${kb(m.filesize)} · รวมไฟล์ย่อ ${kb(sizeBefore)}`)

  if (!APPLY) {
    before += sizeBefore
    touched++
    console.log('   (ดูอย่างเดียว ยังไม่แก้)\n')
    continue
  }

  try {
    const src = await getObject(m.filename)

    // ต้นฉบับ
    const base = sharp(src, { failOn: 'none' }).rotate()
    const meta = await base.metadata()
    const targetWidth = Math.min(meta.width || MAX_WIDTH, MAX_WIDTH)
    const newOriginal = await sharp(src, { failOn: 'none' })
      .rotate()
      .resize({ width: targetWidth, withoutEnlargement: true })
      .webp({ quality: QUALITY })
      .toBuffer()
    const newMeta = await sharp(newOriginal).metadata()

    const newFilename = toWebpName(m.filename)
    await putObject(newFilename, newOriginal, 'image/webp')

    const updates = {
      filename: newFilename,
      url: `/api/media/file/${newFilename}`,
      mime_type: 'image/webp',
      filesize: newOriginal.length,
      width: newMeta.width,
      height: newMeta.height,
    }

    // ไฟล์ย่อ
    for (const s of SIZES) {
      const outName = toWebpName(m.filename).replace(
        /\.webp$/,
        `-${s.width}x${s.height || ''}.webp`,
      )
      const buf = await sharp(newOriginal)
        .resize({
          width: s.width,
          ...(s.height ? { height: s.height } : {}),
          fit: s.fit,
          position: 'centre',
          withoutEnlargement: true,
        })
        .webp({ quality: QUALITY })
        .toBuffer()
      const bmeta = await sharp(buf).metadata()
      await putObject(outName, buf, 'image/webp')
      updates[`sizes_${s.name}_filename`] = outName
      updates[`sizes_${s.name}_url`] = `/api/media/file/${outName}`
      updates[`sizes_${s.name}_mime_type`] = 'image/webp'
      updates[`sizes_${s.name}_filesize`] = buf.length
      updates[`sizes_${s.name}_width`] = bmeta.width
      updates[`sizes_${s.name}_height`] = bmeta.height
    }

    const cols = Object.keys(updates)
    await db.query(
      `update cms.media set ${cols.map((c, i) => `${c} = $${i + 2}`).join(', ')}, updated_at = now() where id = $1`,
      [m.id, ...cols.map((c) => updates[c])],
    )

    const sizeAfter =
      newOriginal.length + SIZES.reduce((sum, s) => sum + Number(updates[`sizes_${s.name}_filesize`] || 0), 0)

    console.log(`   ใหม่  ${newMeta.width}x${newMeta.height} ${kb(newOriginal.length)} · รวมไฟล์ย่อ ${kb(sizeAfter)}\n`)
    before += sizeBefore
    after += sizeAfter
    touched++
  } catch (err) {
    console.error(`   ข้าม #${m.id} — ${err.message}\n`)
  }
}

await db.end()

console.log('———')
console.log(`แตะทั้งหมด ${touched} ไฟล์`)
if (APPLY) {
  console.log(`ขนาดรวม ${kb(before)} → ${kb(after)} (ลดลง ${kb(before - after)})`)
  console.log('ขั้นตอนต่อไป: เข้า Vercel กด Redeploy เพื่อล้างแคชรูปเก่า')
} else {
  console.log(`ขนาดรวมของไฟล์ที่จะถูกแก้ ${kb(before)}`)
  console.log('ถ้าถูกต้องแล้ว สั่งทำจริงด้วย --apply')
}
