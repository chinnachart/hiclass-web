import type { GlobalConfig } from 'payload'
import { revalidateSite } from '../lib/revalidate'
import { IMG } from '../lib/imageSpecs'

/**
 * ข้อความในหน้า รางวัล / รถเช่า / ศูนย์บริการ / เทิร์นรถเก่า
 *
 * ก่อนหน้านี้ข้อความพวกนี้เขียนตายอยู่ในโค้ด แก้ทีต้องส่งไฟล์ให้ dev ทุกครั้ง
 * ย้ายมาไว้ที่นี่เพื่อให้ทีมการตลาดแก้เองได้ทั้งหมด
 *
 * กติกา: ทุกช่องเว้นว่างได้ — ถ้าเว้นว่าง หน้าเว็บจะใช้ข้อความตั้งต้นเดิม (fallback ในโค้ดหน้า)
 * จึงไม่มีทางที่หน้าเว็บจะกลายเป็นหน้าว่างเพราะลืมกรอก
 */

const FAQ_FIELDS = [
  { name: 'question', type: 'text' as const, required: true, label: 'คำถาม' },
  { name: 'answer', type: 'textarea' as const, required: true, label: 'คำตอบ' },
]

const faqArray = (name: string) => ({
  name,
  type: 'array' as const,
  label: 'คำถามที่พบบ่อย',
  labels: { singular: 'คำถาม', plural: 'คำถาม' },
  admin: {
    description:
      'มีผลกับ Google โดยตรง — คำถามที่ใส่ที่นี่มีโอกาสขึ้นเป็นกล่องคำตอบในหน้าผลค้นหา เขียนคำถามให้เหมือนที่ลูกค้าพิมพ์จริง · ลบให้เหลือ 0 ข้อ = ซ่อนทั้งบล็อกจากหน้าเว็บ',
  },
  fields: FAQ_FIELDS,
})

const seoFields = (titleName: string, descName: string) => [
  {
    type: 'collapsible' as const,
    label: 'หัวข้อและคำอธิบายสำหรับ Google',
    admin: { description: 'ข้อความที่ขึ้นในหน้าผลค้นหา Google และตอนแชร์ลิงก์ · เว้นว่าง = ใช้ค่าเดิมที่ตั้งไว้ตอนสร้างเว็บ' },
    fields: [
      { name: titleName, type: 'text' as const, label: 'หัวข้อ (title)', admin: { description: 'ยาวไม่เกิน ~60 ตัวอักษร ใส่คำที่ลูกค้าเสิร์ชจริงไว้ต้นประโยค' } },
      { name: descName, type: 'textarea' as const, label: 'คำอธิบาย (description)', admin: { description: 'ยาวไม่เกิน ~155 ตัวอักษร' } },
    ],
  },
]

export const PageContent: GlobalConfig = {
  slug: 'page-content',
  label: 'ข้อความในหน้าต่างๆ',
  admin: {
    group: 'เนื้อหาเว็บ',
    description:
      'แก้ข้อความบนหน้า รางวัล · รถเช่า · ศูนย์บริการ · เทิร์นรถเก่า ได้ที่นี่ทั้งหมด — ช่องไหนเว้นว่างจะใช้ข้อความเดิมที่ตั้งไว้ให้',
  },
  access: { read: () => true },
  hooks: { afterChange: [revalidateSite] },
  fields: [
    {
      type: 'tabs',
      tabs: [
        // ─────────────────────────── รางวัล ───────────────────────────
        {
          label: 'รางวัล',
          description: 'หน้า /awards — หน้าที่ใช้พิสูจน์ว่าเราเป็นดีลเลอร์อันดับ 1 ตัวเลขทุกตัวต้องอ้างอิงได้จริง',
          fields: [
            {
              type: 'row',
              fields: [
                { name: 'awKicker', type: 'text', label: 'บรรทัดเล็กเหนือพาดหัว', admin: { width: '50%', description: 'เช่น BYD Dealer of the Year 2025' } },
                { name: 'awAsOf', type: 'text', label: 'ข้อความกำกับที่มาของตัวเลข', admin: { width: '50%', description: 'ต้องมีเสมอเมื่อเคลม "อันดับ 1" เช่น ข้อมูล Hi-Class Group รวมทุกสาขา ณ กันยายน 2569' } },
              ],
            },
            {
              type: 'row',
              fields: [
                { name: 'awHeadline', type: 'text', label: 'พาดหัว บรรทัดที่ 1', admin: { width: '50%' } },
                { name: 'awHeadline2', type: 'text', label: 'พาดหัว บรรทัดที่ 2', admin: { width: '50%' } },
              ],
            },
            { name: 'awLead', type: 'textarea', label: 'ย่อหน้านำ' },
            { name: 'awHeroImage', type: 'upload', relationTo: 'media', label: 'รูปใหญ่ด้านขวา (ถือโล่รางวัล)', admin: { description: `แนวตั้ง 3:4 · ${IMG.portrait34}` } },
            {
              name: 'awStats',
              type: 'array',
              label: 'ตัวเลข 3 กล่องใต้พาดหัว',
              labels: { singular: 'กล่อง', plural: 'กล่อง' },
              maxRows: 4,
              admin: { description: 'เช่น No.1 / ยอดขายกลุ่มดีลเลอร์ BYD ทั่วประเทศ' },
              fields: [
                {
                  type: 'row',
                  fields: [
                    { name: 'value', type: 'text', required: true, label: 'ตัวเลข', admin: { width: '30%' } },
                    { name: 'label', type: 'text', required: true, label: 'คำอธิบาย', admin: { width: '70%' } },
                  ],
                },
              ],
            },
            {
              name: 'awItems',
              type: 'array',
              label: 'รายการรางวัล',
              labels: { singular: 'รางวัล', plural: 'รางวัล' },
              admin: { description: 'เรียงตามปีให้อัตโนมัติ ปีล่าสุดขึ้นก่อน · ใส่ "จำนวนรางวัล" เฉพาะรางวัลทีมช่าง (จะไปอยู่ในบล็อกทีมช่างแทน)' },
              fields: [
                {
                  type: 'row',
                  fields: [
                    { name: 'year', type: 'number', required: true, label: 'ปี (ค.ศ.)', admin: { width: '20%' } },
                    { name: 'title', type: 'text', required: true, label: 'ชื่อรางวัลตามใบประกาศ (อังกฤษ)', admin: { width: '50%', description: 'Google ใช้ข้อความนี้' } },
                    {
                      name: 'level',
                      type: 'select',
                      required: true,
                      defaultValue: 'national',
                      label: 'ระดับ',
                      admin: { width: '30%' },
                      options: [
                        { label: 'ระดับประเทศ', value: 'national' },
                        { label: 'ระดับเอเชียแปซิฟิก', value: 'apac' },
                      ],
                    },
                  ],
                },
                { name: 'th', type: 'text', required: true, label: 'คำอธิบายภาษาไทย 1 ประโยค' },
                {
                  type: 'row',
                  fields: [
                    { name: 'event', type: 'text', required: true, label: 'เวทีที่มอบรางวัล', admin: { width: '70%' } },
                    { name: 'count', type: 'number', min: 0, label: 'จำนวนรางวัล', admin: { width: '30%', description: 'เว้นว่างถ้าได้ใบเดียว' } },
                  ],
                },
              ],
            },
            {
              name: 'awYearPhotos',
              type: 'array',
              label: 'รูปประกอบแยกตามปี',
              labels: { singular: 'รูป', plural: 'รูป' },
              admin: { description: 'รูปจะไปขึ้นข้างรายการรางวัลของปีนั้น' },
              fields: [
                { name: 'year', type: 'number', required: true, label: 'ปี (ค.ศ.)' },
                { name: 'image', type: 'upload', relationTo: 'media', required: true, label: 'รูป', admin: { description: IMG.gallery43 } },
              ],
            },
            {
              type: 'collapsible',
              label: 'บล็อกทีมช่างเทคนิค',
              fields: [
                {
                  type: 'row',
                  fields: [
                    { name: 'awTechTitle', type: 'text', label: 'หัวข้อ', admin: { width: '40%' } },
                    { name: 'awTechSub', type: 'text', label: 'คำอธิบายใต้หัวข้อ', admin: { width: '60%' } },
                  ],
                },
                { name: 'awTechNote', type: 'textarea', label: 'ย่อหน้าปิดท้าย' },
                { name: 'awTechImage', type: 'upload', relationTo: 'media', label: 'รูปโล่รางวัลทีมช่าง', admin: { description: IMG.hero169 } },
              ],
            },
            {
              type: 'collapsible',
              label: 'กล่องชวนทดลองขับท้ายหน้า',
              fields: [
                { name: 'awCtaTitle', type: 'text', label: 'หัวข้อ' },
                { name: 'awCtaSub', type: 'text', label: 'ข้อความรอง' },
              ],
            },
            ...seoFields('awSeoTitle', 'awSeoDesc'),
          ],
        },

        // ─────────────────────────── รถเช่า ───────────────────────────
        {
          label: 'รถเช่า',
          description: 'หน้า /rental — ราคาค่าเช่ายังแก้ที่ "รุ่นรถ" เหมือนเดิม ที่นี่แก้เฉพาะข้อความ',
          fields: [
            { name: 'rtKicker', type: 'text', label: 'บรรทัดเล็กเหนือพาดหัว' },
            { name: 'rtTitle', type: 'text', label: 'พาดหัว' },
            {
              name: 'rtLead',
              type: 'textarea',
              label: 'ย่อหน้านำ',
              admin: { description: 'พิมพ์ {สาขา} ตรงไหน ระบบจะแทนด้วยจำนวนสาขาที่เปิดอยู่จริงให้เอง เช่น "รับรถได้ที่ {สาขา} สาขา"' },
            },
            { name: 'rtFineprint', type: 'textarea', label: 'ข้อความตัวเล็กใต้ตารางราคา', admin: { description: 'เช่น เงื่อนไขราคา ภาษี จำนวนรถจำกัด' } },
            faqArray('rtFaq'),
            ...seoFields('rtSeoTitle', 'rtSeoDesc'),
          ],
        },

        // ────────────────────────── ศูนย์บริการ ──────────────────────────
        {
          label: 'ศูนย์บริการ',
          description: 'หน้า /service',
          fields: [
            { name: 'svKicker', type: 'text', label: 'บรรทัดเล็กเหนือพาดหัว' },
            { name: 'svTitle', type: 'text', label: 'พาดหัว', admin: { description: 'พิมพ์ {สาขา} แทนจำนวนสาขาได้ เช่น "ศูนย์บริการ BYD ทั้ง {สาขา} สาขา"' } },
            { name: 'svLead', type: 'textarea', label: 'ย่อหน้านำ', admin: { description: 'ใช้ {สาขา} ได้เหมือนกัน' } },
            {
              name: 'svServices',
              type: 'array',
              label: 'บริการที่ให้',
              labels: { singular: 'บริการ', plural: 'บริการ' },
              admin: { description: 'การ์ดบริการที่ขึ้นบนสุดของหน้า — ลบให้เหลือ 0 = ซ่อนทั้งบล็อก' },
              fields: [
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'icon',
                      type: 'select',
                      defaultValue: 'wrench',
                      label: 'ไอคอน',
                      admin: { width: '30%' },
                      options: [
                        { label: 'ประแจ (ซ่อม/เช็กระยะ)', value: 'wrench' },
                        { label: 'โล่ (ประกัน/รับรอง)', value: 'shield' },
                        { label: 'สายฟ้า (ไฟฟ้า/แบตเตอรี่)', value: 'bolt' },
                        { label: 'กุญแจ (รถทดแทน)', value: 'key' },
                        { label: 'รถ', value: 'car' },
                        { label: 'พวงมาลัย (ทดลองขับ)', value: 'wheel' },
                        { label: 'นาฬิกา (เวลา/คิว)', value: 'clock' },
                        { label: 'โทรศัพท์', value: 'phone' },
                        { label: 'แชท / LINE', value: 'chat' },
                        { label: 'หมุดแผนที่', value: 'pin' },
                        { label: 'ถูก (การันตี)', value: 'check' },
                      ],
                    },
                    { name: 'title', type: 'text', required: true, label: 'หัวข้อ', admin: { width: '70%' } },
                  ],
                },
                { name: 'body', type: 'textarea', required: true, label: 'คำอธิบาย' },
              ],
            },
            faqArray('svFaq'),
            ...seoFields('svSeoTitle', 'svSeoDesc'),
          ],
        },

        // ────────────────────────── เทิร์นรถเก่า ──────────────────────────
        {
          label: 'เทิร์นรถเก่า',
          description: 'หน้า /trade-in — ช่องในฟอร์มยังคงเดิม ที่นี่แก้ข้อความรอบฟอร์ม',
          fields: [
            { name: 'tiKicker', type: 'text', label: 'บรรทัดเล็กเหนือพาดหัว' },
            { name: 'tiTitle', type: 'text', label: 'พาดหัว' },
            { name: 'tiLead', type: 'textarea', label: 'ย่อหน้านำ' },
            faqArray('tiFaq'),
            ...seoFields('tiSeoTitle', 'tiSeoDesc'),
          ],
        },
      ],
    },
  ],
}
