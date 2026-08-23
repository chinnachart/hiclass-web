/**
 * รวมไฟล์ที่ต้องใช้ตอนรันทั้งหมดไว้ในโฟลเดอร์ deploy/ แล้วบีบเป็น zip
 * สำหรับอัปโหลดขึ้น Plesk — บนเซิร์ฟเวอร์ไม่ต้อง npm install และไม่ต้อง build
 *
 * วิธีใช้:  npm run build && npm run package
 */
import { cp, rm, mkdir, writeFile, readFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import path from 'node:path'

const run = promisify(execFile)
const root = process.cwd()
const out = path.join(root, 'deploy')

const step = (msg) => console.log('  ' + msg)

if (!existsSync(path.join(root, '.next/standalone'))) {
  console.error('ยังไม่ได้ build — รัน "npm run build" ก่อน')
  process.exit(1)
}

console.log('\nกำลังรวมไฟล์สำหรับ Plesk\n')

await rm(out, { recursive: true, force: true })
await mkdir(out, { recursive: true })

step('คัดลอกโปรแกรมหลัก (standalone)')
await cp(path.join(root, '.next/standalone'), out, { recursive: true })

step('คัดลอกไฟล์ static ของหน้าเว็บ')
await cp(path.join(root, '.next/static'), path.join(out, '.next/static'), { recursive: true })

if (existsSync(path.join(root, 'public'))) {
  step('คัดลอกโฟลเดอร์ public')
  await cp(path.join(root, 'public'), path.join(out, 'public'), { recursive: true })
}

step('คัดลอก migration (ไว้รันตอนอัปเดตฐานข้อมูล)')
await cp(path.join(root, 'src/migrations'), path.join(out, 'migrations'), { recursive: true })

// Plesk เรียกไฟล์นี้เป็นจุดเริ่มต้นของแอป
step('สร้างไฟล์เริ่มต้น app.js')
await writeFile(
  path.join(out, 'app.js'),
  `// จุดเริ่มต้นของแอปสำหรับ Plesk — ตั้งค่าช่องนี้ใน Application Startup File
// Plesk/Passenger จะกำหนดพอร์ตมาให้เองผ่านตัวแปร PORT
process.env.NODE_ENV = 'production'
process.env.HOSTNAME = process.env.HOSTNAME || '127.0.0.1'
import('./server.js')
`,
  'utf8',
)

// package.json ฉบับย่อ — Plesk อ่านไฟล์นี้เพื่อรู้ว่าเป็นแอป Node
step('สร้าง package.json สำหรับรัน')
const pkg = JSON.parse(await readFile(path.join(root, 'package.json'), 'utf8'))
await writeFile(
  path.join(out, 'package.json'),
  JSON.stringify(
    {
      name: pkg.name,
      version: pkg.version,
      private: true,
      type: 'module',
      main: 'app.js',
      scripts: { start: 'node app.js' },
    },
    null,
    2,
  ) + '\n',
  'utf8',
)

step('บีบไฟล์เป็น hiclass-web-deploy.zip')
await rm(path.join(root, 'hiclass-web-deploy.zip'), { force: true })
await run('zip', ['-rq', path.join(root, 'hiclass-web-deploy.zip'), '.'], { cwd: out, maxBuffer: 1024 * 1024 * 64 })

const { stdout } = await run('du', ['-sh', path.join(root, 'hiclass-web-deploy.zip')])
console.log('\nเสร็จแล้ว: ' + stdout.trim().split('\t')[0] + '  →  hiclass-web-deploy.zip')
console.log('อัปโหลดไฟล์นี้ขึ้น Plesk แล้วทำตาม PLESK-DEPLOY.md\n')
