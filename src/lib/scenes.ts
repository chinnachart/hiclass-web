/** ฉากหลังการ์ดรถหน้าแรก (ไฟล์ใน public/scenes/) — ใช้ร่วมกันระหว่าง ModelCarousel กับ preload ในหน้าแรก */
export const SCENE_SLUGS = ['atto-3', 'sealion-6', 'sealion-7', 'sealion-5', 'atto-2', 'atto-1', 'dolphin', 'seal-5', 'seal-6', 'm6']
export const sceneOf = (slug: string): string | undefined => (SCENE_SLUGS.includes(slug) ? `/scenes/${slug}.webp` : undefined)
