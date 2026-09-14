import type { GlobalConfig } from 'payload'
import { revalidateSite } from '../lib/revalidate'
import { IMG } from '../lib/imageSpecs'

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: 'ตั้งค่าเว็บไซต์',
  admin: { group: 'ตั้งค่าระบบ', description: 'ข้อความและตัวเลขที่ใช้ร่วมกันทั้งเว็บ' },
  access: { read: () => true },
  hooks: { afterChange: [revalidateSite] },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'หน้าแรก',
          description:
            'แถบบนสุดของหน้าแรก เป็นวิดีโอพื้นหลัง + ข้อความสลับทีละใบทุก 6 วินาที · ลูกค้ากดจุดด้านล่างเลือกดูเองได้',
          fields: [
            {
              name: 'heroSlides',
              type: 'array',
              label: 'สไลด์ข้อเสนอหน้าแรก',
              labels: { singular: 'สไลด์', plural: 'สไลด์' },
              maxRows: 6,
              admin: {
                description:
                  '1 แถว = 1 ข้อความที่สลับบนหน้าแรก · แนะนำ 3–4 ใบ ถ้ามากกว่านั้นลูกค้าดูไม่ทัน · ลากจุดซ้ายมือเพื่อสลับลำดับ · ' +
                  'ถ้าไม่มีแถวเลย หรือปิดสวิตช์หมดทุกแถว หน้าเว็บจะใช้ข้อความตั้งต้นที่เขียนไว้ในโค้ด (ไม่มีทางเกิดหน้าว่าง)',
                initCollapsed: true,
              },
              fields: [
                {
                  type: 'row',
                  fields: [
                    { name: 'enabled', type: 'checkbox', defaultValue: true, label: 'เปิดใช้สไลด์นี้', admin: { width: '30%' } },
                    {
                      name: 'accent',
                      type: 'select',
                      defaultValue: 'gold',
                      label: 'โทนสีของสไลด์',
                      options: [
                        { label: 'ทอง (ข้อเสนอพิเศษ)', value: 'gold' },
                        { label: 'ขาว (เน้นข้อความ)', value: 'line' },
                        { label: 'แดง (เร่งด่วน/Flash)', value: 'red' },
                      ],
                      admin: { width: '40%', description: 'คุมสีเส้นและคำสั้นเหนือพาดหัว' },
                    },
                    { name: 'center', type: 'checkbox', defaultValue: false, label: 'จัดข้อความกลางจอ', admin: { width: '30%' } },
                  ],
                },
                {
                  name: 'kicker',
                  type: 'text',
                  label: 'คำสั้นเหนือพาดหัว',
                  admin: { description: 'เช่น Private Offer · Flash Deal เฉพาะเดือนนี้ — สั้นๆ ไม่เกิน 5 คำ' },
                },
                {
                  name: 'title',
                  type: 'textarea',
                  label: 'พาดหัวใหญ่',
                  admin: {
                    description:
                      'กด Enter ขึ้นบรรทัดใหม่ได้ · อยากให้คำไหนเป็น "สีทอง" ให้ครอบด้วยเครื่องหมายดอกจัน เช่น ดีลที่ลงหน้าเว็บ *ไม่ได้* · ยาวไม่เกิน 2 บรรทัดกำลังสวยบนมือถือ',
                  },
                },
                {
                  name: 'sub',
                  type: 'textarea',
                  label: 'ข้อความรอง',
                  admin: { description: 'กด Enter ขึ้นบรรทัดใหม่ได้ · ใช้ *คำ* ให้เป็นสีทองได้เหมือนกัน · 2 บรรทัดกำลังดี' },
                },
                {
                  type: 'row',
                  fields: [
                    { name: 'ctaLabel', type: 'text', label: 'ปุ่มหลัก — ข้อความ', admin: { width: '40%', description: 'เช่น ทักแชทรับดีล' } },
                    {
                      name: 'ctaHref',
                      type: 'text',
                      label: 'ปุ่มหลัก — ไปที่ไหน',
                      admin: {
                        width: '35%',
                        description: 'พิมพ์ line: เพื่อใช้ LINE กลาง (แท็บติดต่อ) · หรือใส่หน้าในเว็บ เช่น /test-drive, /trade-in, /register',
                      },
                    },
                    {
                      name: 'ctaKind',
                      type: 'select',
                      defaultValue: 'gold',
                      label: 'สีปุ่มหลัก',
                      options: [
                        { label: 'ทอง', value: 'gold' },
                        { label: 'เขียว LINE', value: 'line' },
                        { label: 'แดง', value: 'red' },
                      ],
                      admin: { width: '25%' },
                    },
                  ],
                },
                {
                  type: 'row',
                  fields: [
                    { name: 'ghostLabel', type: 'text', label: 'ปุ่มรอง — ข้อความ', admin: { width: '50%', description: 'เว้นว่าง = ไม่มีปุ่มรอง' } },
                    { name: 'ghostHref', type: 'text', label: 'ปุ่มรอง — ไปที่ไหน', admin: { width: '50%' } },
                  ],
                },
                {
                  name: 'note',
                  type: 'text',
                  label: 'บรรทัดเล็กใต้ปุ่ม',
                  admin: { description: 'เช่น ตอบกลับ 08.00–20.00 ทุกวัน — ใช้ลดความลังเลก่อนกด' },
                },
                {
                  name: 'chips',
                  type: 'textarea',
                  label: 'ป้ายเล็กใต้ปุ่ม',
                  admin: { description: '1 บรรทัด = 1 ป้าย · ไม่เกิน 3 ป้าย · เว้นว่างได้' },
                },
              ],
            },
            {
              label: 'ช่องเดิมของ hero (เลิกใช้แล้ว)',
              type: 'collapsible',
              admin: {
                initCollapsed: true,
                description: 'ตั้งแต่เปลี่ยน hero เป็นสไลด์ ช่องกลุ่มนี้ไม่มีผลกับหน้าเว็บแล้ว — เก็บไว้เฉยๆ ไม่ต้องแก้',
              },
              fields: [
                { name: 'heroHeadline', type: 'text', required: true, label: 'พาดหัวใหญ่ (เดิม)', defaultValue: 'ลองขับ BYD ใกล้บ้าน' },
                { name: 'heroHeadline2', type: 'text', label: 'พาดหัวบรรทัดที่สอง (เดิม)', defaultValue: 'วันนี้ ฟรี' },
                { name: 'heroSub', type: 'textarea', label: 'ข้อความรอง (เดิม)', defaultValue: '5 สาขาในกรุงเทพฯ นัดออนไลน์ 1 นาที ทีมขายโทรยืนยันภายใน 1 ชั่วโมง' },
                { name: 'heroBlurb', type: 'textarea', label: 'ย่อหน้าแนะนำบริษัท (เดิม)' },
              ],
            },
          ],
        },
        {
          label: 'ป๊อปอัพหน้าแรก',
          description:
            'รูปแคมเปญที่เด้งขึ้นกลางจอเมื่อลูกค้าเปิดหน้าแรก · ลูกค้าปิดแล้วจะไม่เด้งอีกจนถึงวันถัดไป · เปลี่ยนรูปใหม่ = เด้งใหม่ทันที',
          fields: [
            {
              name: 'popupEnabled',
              type: 'checkbox',
              defaultValue: false,
              label: 'เปิดป๊อปอัพ',
              admin: { description: 'ติ๊กออก = ไม่เด้งเลย (ไม่ต้องลบรูป เก็บไว้ใช้รอบหน้าได้)' },
            },
            {
              name: 'popupImage',
              type: 'upload',
              relationTo: 'media',
              label: 'รูปป๊อปอัพ',
              admin: { description: IMG.popup45 },
            },
            {
              name: 'popupHref',
              type: 'text',
              defaultValue: '/test-drive',
              label: 'กดที่รูปแล้วไปหน้า',
              admin: { description: 'ใส่เป็นเส้นทางในเว็บ เช่น /test-drive · /promotion · /car-model/atto-2 (ใส่ลิงก์เต็ม https:// ได้ จะเปิดแท็บใหม่)' },
            },
            {
              name: 'popupAlt',
              type: 'text',
              label: 'คำอธิบายรูปสั้นๆ',
              admin: { description: 'เช่น "ATTO Week Surprise Deal 11–13 กันยายน" — ใช้บอก Google และผู้ใช้ที่เปิดโหมดอ่านหน้าจอ' },
            },
            {
              type: 'row',
              fields: [
                { name: 'popupStart', type: 'date', label: 'เริ่มเด้งวันที่', admin: { width: '50%', description: 'เว้นว่าง = เด้งทันที' } },
                { name: 'popupEnd', type: 'date', label: 'เด้งถึงวันที่', admin: { width: '50%', description: 'เว้นว่าง = เด้งไปเรื่อยๆ · ใส่วันสุดท้ายของแคมเปญไว้ จะได้ไม่ต้องกลับมาปิดเอง' } },
              ],
            },
          ],
        },
        {
          label: 'ความน่าเชื่อถือ',
          description: 'ตัวเลขจริงของบริษัท ใส่แล้วขึ้นหน้าแรกอัตโนมัติ ช่องไหนเว้นว่างจะไม่แสดง',
          fields: [
            {
              type: 'row',
              fields: [
                { name: 'deliveredCount', type: 'number', min: 0, label: 'ส่งมอบแล้ว (คัน)', admin: { width: '33%', description: 'เช่น 3500 — เว็บจะแสดงเป็น "3,500+ คัน"' } },
                { name: 'yearsOpen', type: 'number', min: 0, label: 'เปิดมาแล้ว (ปี)', admin: { width: '33%' } },
                { name: 'googleRating', type: 'number', min: 0, max: 5, label: 'คะแนนรีวิว Google (เช่น 4.8)', admin: { width: '34%', step: 0.1 } },
              ],
            },
            { name: 'trustNote', type: 'text', label: 'ประโยคเสริมความมั่นใจ', admin: { description: 'เช่น ศูนย์บริการมาตรฐาน BYD ครบทั้ง 5 สาขา ช่างผ่านการอบรมจากโรงงาน' } },
          ],
        },
        {
          label: 'Google & การวัดผล',
          description: 'ค่าจาก Google Analytics และ Search Console — ใส่ครั้งเดียว',
          fields: [
            {
              name: 'gaMeasurementId',
              type: 'text',
              label: 'Google Analytics Measurement ID',
              admin: { description: 'ขึ้นต้นด้วย G- เช่น G-ABC123XYZ (Analytics → Admin → Data Streams) — โหลดแบบ Consent Mode: ก่อนผู้ใช้กดยอมรับคุกกี้จะไม่ตั้งคุกกี้ (ส่งได้เฉพาะสัญญาณไม่ระบุตัวตน)' },
            },
            {
              name: 'googleSiteVerification',
              type: 'text',
              label: 'รหัสยืนยัน Google Search Console',
              admin: { description: 'เฉพาะค่าใน content="..." ของ meta tag ที่ Search Console ให้มา' },
            },
            {
              name: 'googleAdsId',
              type: 'text',
              label: 'Google Ads Conversion ID',
              admin: { description: 'ขึ้นต้นด้วย AW- เช่น AW-123456789 (Google Ads → Goals → Conversions → เปิด action → Tag setup) — เว้นว่าง = ไม่ส่ง conversion ให้ Google Ads' },
            },
            {
              type: 'row',
              fields: [
                { name: 'adsLabelTestDrive', type: 'text', label: 'Label: นัดทดลองขับ', admin: { width: '50%', description: 'ส่วนหลัง / ของ send_to เช่น AbC-dEfGhIjK (เว้นว่าง = ส่งเฉพาะ event เข้า GA4)' } },
                { name: 'adsLabelRegister', type: 'text', label: 'Label: ลงทะเบียนความสนใจ', admin: { width: '50%' } },
              ],
            },
            {
              type: 'row',
              fields: [
                { name: 'adsLabelPhone', type: 'text', label: 'Label: กดโทร', admin: { width: '50%', description: 'ยิงเมื่อกดลิงก์ tel: ทุกที่ในเว็บ' } },
                { name: 'adsLabelLine', type: 'text', label: 'Label: กดแอด LINE', admin: { width: '50%', description: 'ยิงเมื่อกดลิงก์ LINE ทุกที่ในเว็บ' } },
              ],
            },
          ],
        },
        {
          label: 'ติดต่อ',
          fields: [
            { name: 'mainPhone', type: 'text', required: true, label: 'เบอร์ติดต่อบริษัท (รถเช่า / นโยบายความเป็นส่วนตัว)', defaultValue: '099-493-4863', admin: { description: 'ใช้เฉพาะหน้ารถเช่าและหน้านโยบายความเป็นส่วนตัว — ปุ่ม "โทร" ที่อื่นทั้งเว็บให้ลูกค้าเลือกสาขาแล้วโทรเบอร์สาขา (แก้ที่ \'สาขาของเรา\')' } },
            { name: 'lineUrl', type: 'text', label: 'ลิงก์ LINE Official', admin: { description: 'สำคัญ — ปุ่ม "แอด LINE" ทุกหน้าใช้ลิงก์นี้ เช่น https://lin.ee/xxxxx (ถ้าเว้นว่างปุ่มจะกลายเป็น "ติดต่อเรา")' } },
            { name: 'facebookUrl', type: 'text', label: 'ลิงก์ Facebook' },
            {
              name: 'contactEmail',
              type: 'email',
              label: 'อีเมลกลางสำหรับลูกค้าติดต่อ',
              defaultValue: 'bydhiclass.online@gmail.com',
              admin: { description: 'แสดงท้ายเว็บ หน้าติดต่อเรา และส่งให้ Google เป็นอีเมลของธุรกิจ' },
            },
            { name: 'footerAbout', type: 'textarea', label: 'ย่อหน้าแนะนำบริษัท', admin: { description: 'แสดงท้ายเว็บทุกหน้า และหัวหน้าติดต่อเรา — เล่าว่า Hi-Class ต่างจากดีลเลอร์อื่นยังไง' } },
          ],
        },
        {
          label: 'คำนวณค่างวด',
          fields: [
            {
              name: 'financeRate',
              type: 'number',
              required: true,
              defaultValue: 2.89,
              label: 'อัตราดอกเบี้ยสำรอง (%)',
              admin: { description: 'ใช้เฉพาะช่องที่เว้นว่างในตารางดอกเบี้ยด้านล่าง (หรือเมื่อลบตารางทั้งหมด) — ใส่เป็นเปอร์เซ็นต์ เช่น 2.89' },
            },
            {
              name: 'financeRates',
              type: 'array',
              label: 'ตารางดอกเบี้ย ตามเงินดาวน์ × จำนวนงวด (ใช้กับทุกรุ่น)',
              labels: { singular: 'แถวเงินดาวน์', plural: 'แถวเงินดาวน์' },
              admin: {
                description:
                  'ลอกจากชีทไฟแนนซ์ของฝ่ายขาย · 1 แถว = 1 ระดับเงินดาวน์ · ใส่ดอกเบี้ยคงที่ต่อปี (%) ของแต่ละจำนวนงวด · หน้าเว็บแสดงเงินดาวน์ตามแถวที่มี เรียงมากไปน้อยให้เอง (30% อยู่บนสุด) และตัวเลื่อนในเครื่องคำนวณเลือกได้เฉพาะเงินดาวน์เหล่านี้ · ช่องไหนเว้นว่างจะใช้ "อัตราดอกเบี้ยสำรอง" ด้านบน',
              },
              fields: [
                {
                  type: 'row',
                  fields: [
                    { name: 'down', type: 'number', required: true, min: 0, max: 90, label: 'เงินดาวน์ (%)', admin: { width: '20%' } },
                    { name: 'r48', type: 'number', min: 0, label: '48 งวด (%)', admin: { width: '20%', step: 0.01 } },
                    { name: 'r60', type: 'number', min: 0, label: '60 งวด (%)', admin: { width: '20%', step: 0.01 } },
                    { name: 'r72', type: 'number', min: 0, label: '72 งวด (%)', admin: { width: '20%', step: 0.01 } },
                    { name: 'r84', type: 'number', min: 0, label: '84 งวด (%)', admin: { width: '20%', step: 0.01 } },
                  ],
                },
              ],
            },
            {
              name: 'defaultDownPercent',
              type: 'number',
              defaultValue: 20,
              label: 'เงินดาวน์เริ่มต้น (%)',
              admin: { description: 'ต้องเป็นค่าที่มีในตารางดอกเบี้ย (ถ้าไม่มี เว็บจะใช้แถวที่ใกล้ที่สุด) — ใช้กับค่างวดตัวแดงบนหัวหน้ารุ่นรถ/ตารางผ่อน และหน้าเปรียบเทียบ' },
            },
            {
              name: 'defaultTerm',
              type: 'number',
              defaultValue: 60,
              label: 'จำนวนงวดเริ่มต้น',
              admin: { description: '48 / 60 / 72 / 84' },
            },
            {
              name: 'financeNote',
              type: 'text',
              label: 'ข้อความกำกับใต้ผลคำนวณ',
              defaultValue: 'ตัวเลขเป็นการประมาณเบื้องต้น เงื่อนไขจริงขึ้นอยู่กับการอนุมัติของสถาบันการเงิน',
            },
          ],
        },
        {
          label: 'ลีดทดลองขับ',
          fields: [
            {
              name: 'leadSourceLabel',
              type: 'text',
              required: true,
              defaultValue: 'Website - ทดลองขับ',
              label: 'ชื่อแหล่งที่มาที่บันทึกลง CRM',
              admin: { description: 'ค่านี้จะถูกเขียนลงช่อง lead_source ในระบบ CRM เพื่อให้แยกออกว่าลีดมาจากเว็บ' },
            },
            {
              name: 'leadHolderName',
              type: 'text',
              required: true,
              defaultValue: 'เว็บไซต์ - รอรับ',
              label: 'ชื่อผู้รับลีดตั้งต้น',
              admin: { description: 'ลีดจากเว็บจะลงชื่อนี้ก่อน แล้วให้หัวหน้าสาขากดรับในพอร์ทัล' },
            },
          ],
        },
      ],
    },
  ],
}
