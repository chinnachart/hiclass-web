/** ช่วงเวลานัดทดลองขับ — ต้องตรงกับ check constraint crm_leads.appointment_slot ใน Cinco เป๊ะ (ขีดกลางเป็น en-dash) */
export const APPOINTMENT_SLOTS = ['เช้า (09:00–12:00)', 'บ่าย (12:00–15:00)', 'เย็น (15:00–18:00)'] as const
export type AppointmentSlot = (typeof APPOINTMENT_SLOTS)[number]
export const isAppointmentSlot = (s: string): s is AppointmentSlot => (APPOINTMENT_SLOTS as readonly string[]).includes(s)
