#!/usr/bin/env python3
"""สร้างแผนที่สาขาแบบผังอย่างง่าย (SVG) → src/lib/branchMaps.ts
แก้ข้อมูลสาขาที่ท้ายไฟล์นี้ แล้วรัน:  python3 scripts/gen-branch-maps.py
หมายเหตุ: เป็นผังอย่างง่าย ไม่ตรงมาตราส่วน · ฝั่งถนน/จุดสังเกตต้องให้เจ้าของยืนยัน (ดูคอมเมนต์รายสาขา)"""
import json, os
# ผังสาขาแบบการ์ดเชิญ — ถนนหลักแนวตั้ง · ถนนตัดบน/ล่าง (ถ้ามี) · หมุด + ป้าย · จุดสังเกต
def svg(code,name,road,top,bottom,side,pin_y,lines,cross_top=None,cross_bot=None,marks=(),north=True):
    o=['<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 560" role="img" aria-label="แผนที่อย่างง่าย BYD Hi-Class %s" font-family="\'Noto Sans Thai\',\'Loma\',sans-serif">'%name,
       '<rect width="720" height="560" rx="20" fill="#f6f6f7"/>']
    ys=[20]+([125] if cross_top else [])+([425] if cross_bot else [])+[540]
    for a,b in zip(ys,ys[1:]):
        y0=a+(25 if a!=20 else 20); y1=b-(25 if b!=540 else 20)
        for x in (40,410): o.append('<rect x="%d" y="%d" width="270" height="%d" rx="10" fill="#ececee"/>'%(x,y0,y1-y0))
    o.append('<line x1="360" y1="20" x2="360" y2="540" stroke="#fff" stroke-width="58" stroke-linecap="round"/>')
    for y,c in ((125,cross_top),(425,cross_bot)):
        if c:
            o.append('<line x1="30" y1="%d" x2="690" y2="%d" stroke="#fff" stroke-width="34" stroke-linecap="round"/>'%(y,y))
            if c.get('l'): o.append('<text x="60" y="%d" fill="#6b6f76" font-size="15" font-weight="700">%s</text>'%(y+5,c['l']))
            if c.get('mrt'):
                o.append('<g transform="translate(360 %d)"><circle r="15" fill="#1e4fa3"/><text y="4" text-anchor="middle" fill="#fff" font-size="11" font-weight="700" font-family="Arial,sans-serif">M</text></g>'%y)
                o.append('<text x="424" y="%d" fill="#1e4fa3" font-size="14" font-weight="700">%s</text>'%(y-13,c['mrt']))
            if c.get('note'): o.append('<text x="424" y="%d" fill="#6b6f76" font-size="13">%s</text>'%(y+43,c['note']))
            if c.get('r'): o.append('<text x="660" y="%d" text-anchor="end" fill="#6b6f76" font-size="15" font-weight="700">%s</text>'%(y+5,c['r']))
    o.append('<line x1="360" y1="24" x2="360" y2="536" stroke="#d9d9de" stroke-width="2" stroke-dasharray="10 10"/>')
    o.append('<text x="372" y="300" transform="rotate(-90 372 300)" text-anchor="middle" letter-spacing="1" fill="#6b6f76" font-size="15" font-weight="700">%s</text>'%road)
    o.append('<text x="360" y="36" text-anchor="middle" fill="#17181a" font-size="13" font-weight="700">↑ %s</text>'%top)
    o.append('<text x="360" y="534" text-anchor="middle" fill="#17181a" font-size="13" font-weight="700">↓ %s</text>'%bottom)
    for m in marks:  # (side,y,text,sub)
        left=m[0]=='L'; cx=322 if left else 398
        o.append('<circle cx="%d" cy="%d" r="7" fill="#fff" stroke="#17181a" stroke-width="2"/>'%(cx,m[1]))
        tx=cx-16 if left else cx+16; an='end' if left else 'start'
        o.append('<text x="%d" y="%d" text-anchor="%s" font-size="14" font-weight="700" fill="#17181a">%s</text>'%(tx,m[1]+5,an,m[2]))
        if len(m)>3: o.append('<text x="%d" y="%d" text-anchor="%s" font-size="12.5" fill="#6b6f76">%s</text>'%(tx,m[1]+23,an,m[3]))
    left=side=='L'; h=58+22*len(lines); bx=52 if left else 424; by=pin_y-h/2
    o.append('<rect x="%d" y="%.0f" width="244" height="%d" rx="14" fill="#fff" stroke="#c8102e" stroke-width="2"/>'%(bx,by,h))
    o.append('<text x="%d" y="%.0f" font-family="\'Kanit\',\'Loma\',sans-serif" font-weight="600" font-size="%d" fill="#17181a">BYD Hi-Class %s</text>'%(bx+16,by+30,19 if len(name)<10 else 17,name))
    for i,(t,st) in enumerate(lines):
        col={'r':'#c8102e','d':'#17181a','m':'#6b6f76'}[st]; fw='700' if st=='r' else '400'
        o.append('<text x="%d" y="%.0f" font-size="13.5" fill="%s" font-weight="%s">%s</text>'%(bx+16,by+53+22*i,col,fw,t))
    px=322 if left else 398
    o.append('<path d="M%d %d L%d %d" stroke="#c8102e" stroke-width="2"/>'%(296 if left else 424,pin_y,px,pin_y))
    o.append('<g transform="translate(%d %d)"><path d="M0 16 C-14 -2 -12 -20 0 -20 C12 -20 14 -2 0 16Z" fill="#c8102e"/><circle cy="-7" r="5" fill="#fff"/></g>'%(px,pin_y))
    if north:
        o.append('<g transform="translate(662 70)" font-family="Arial,sans-serif"><circle r="17" fill="#fff" stroke="#d9d9de"/><path d="M0 -11 L5 5 L0 2 L-5 5Z" fill="#17181a"/><text y="-21" text-anchor="middle" font-size="10" fill="#6b6f76">N</text></g>')
    o.append('<text x="60" y="%d" font-size="12" fill="#9a9da3">แผนที่อย่างง่าย ไม่ตรงตามมาตราส่วน</text>'%(508 if cross_bot else 516))
    o.append('</svg>'); return '\n'.join(o)


M = {}
# รัชดา — เจ้าของยืนยันแล้ว 13 พ.ย. 2569 (ฝั่งซ้ายเมื่อมาจากพระราม 9 · ใกล้ MRT สุทธิสาร · ใกล้ McDonald's)
M['ratchada'] = svg('ratchada','รัชดา','ถ.รัชดาภิเษก','ไปแยกรัชดา-ลาดพร้าว','ไป Big C รัชดา · พระราม 9','L',215,
    [('อาคารกลาสเฮาส์ เลขที่ 207','m'),('ฝั่งซ้ายมือ เมื่อมาจากพระราม 9','r'),("จุดสังเกต: ใกล้ McDonald's",'d')],
    cross_top={'l':'ถ.สุทธิสารวินิจฉัย','mrt':'MRT สุทธิสาร'},
    cross_bot={'l':'ถ.ประชาสงเคราะห์','r':'ถ.ประชาราษฎร์บำเพ็ญ','mrt':'MRT ห้วยขวาง','note':'แยกห้วยขวาง (มีอุโมงค์ทางลอด)'})
# พระราม 5 — ร่างจากคำบอกทาง 9carthai · รอเจ้าของยืนยัน
M['rama5'] = svg('rama5','พระราม 5','ถ.ราชพฤกษ์','ไป Central Westville','ไป ถ.บรมราชชนนี','R',330,
    [('555 หมู่ 2 ถ.ราชพฤกษ์ บางกรวย','m'),('ฝั่งซ้ายมือ เมื่อมาจาก Westville','r'),('อยู่ติดโฮมโปร ราชพฤกษ์','d')],
    marks=[('R',130,'The Crystal SB ราชพฤกษ์'),('R',215,'โฮมโปร ราชพฤกษ์','ผ่านแล้วอีกประมาณ 100 ม.')])
# กาญจนาภิเษก — ร่างจากคำบอกทาง 9carthai · รอเจ้าของยืนยัน
M['kanchana'] = svg('kanchana','กาญจนาภิเษก','ถ.กาญจนาภิเษก','ไป ถ.บรมราชชนนี · บางใหญ่','ไป พระราม 2','L',270,
    [('396/4-6 ถ.กาญจนาภิเษก บางแค','m'),('ฝั่งขาลง (มุ่งหน้าเพชรเกษม)','r'),('จากสะพานกลับรถ ประมาณ 650 ม.','d')],
    cross_bot={'l':'ถ.เพชรเกษม','r':'ไปบางแค'},
    marks=[('L',95,'สะพานกลับรถ','มาจากเพชรเกษม กลับรถที่นี่')])
# ลาดพร้าว — ฝั่งถนนเดาจากพิกัด · รอเจ้าของยืนยัน
M['ladprao'] = svg('ladprao','ลาดพร้าว','ถ.วิภาวดีรังสิต','ไป แยกรัชวิภา · ดอนเมือง','ไป ดินแดง','R',265,
    [('222 แขวงจตุจักร เขตจตุจักร','m'),('ฝั่งขาออก (มุ่งหน้าดอนเมือง)','r'),('เหนือห้าแยกลาดพร้าว','d')],
    cross_bot={'l':'ถ.พหลโยธิน','r':'ถ.ลาดพร้าว'},
    marks=[('R',395,'ห้าแยกลาดพร้าว','เซ็นทรัล ลาดพร้าว')])
# บองมาร์เช่ — ไม่มีข้อมูลทาง · ฝั่งถนนและตำแหน่งตลาดเป็นการเดา · รอเจ้าของแก้
M['bonmarche'] = svg('bonmarche','บองมาร์เช่','ถ.เทศบาลสงเคราะห์','ไป ถ.ประชาชื่น','ไป ถ.วิภาวดีรังสิต','L',290,
    [('105/1 ถ.เทศบาลสงเคราะห์ จตุจักร','m'),('ย่านประชานิเวศน์ 1','d')],
    marks=[('R',200,'ตลาดบองมาร์เช่')], north=False)
# เหม่งจ๋าย — ไม่มีข้อมูลทาง · ฝั่งถนนเป็นการเดา · รอเจ้าของแก้
M['mengjai'] = svg('mengjai','เหม่งจ๋าย','ถ.ประชาอุทิศ','ไป ถ.รัชดาภิเษก (ห้วยขวาง)','ไป แยกเหม่งจ๋าย','L',280,
    [('623 ถ.ประชาอุทิศ วังทองหลาง','m'),('ใกล้แยกเหม่งจ๋าย','d')], north=False)

out = os.path.join(os.path.dirname(__file__), '..', 'src', 'lib', 'branchMaps.ts')
with open(out, 'w') as f:
    f.write('/** แผนที่สาขาแบบผังอย่างง่าย — ไฟล์นี้สร้างอัตโนมัติจาก scripts/gen-branch-maps.py (อย่าแก้มือ) */\n')
    f.write('export const BRANCH_MAPS: Record<string, string> = ' + json.dumps(M, ensure_ascii=False, indent=2) + '\n')
print('wrote', len(M), 'maps')
