/** คำนวณค่างวดแบบดอกเบี้ยคงที่ (flat rate) — วิธีที่ไฟแนนซ์รถในไทยใช้ */
export function monthlyPayment(price: number, downPercent: number, term: number, ratePercent: number) {
  const down = Math.round((price * downPercent) / 100)
  const financed = price - down
  if (financed <= 0 || term <= 0) return { down, financed, perMonth: 0 }
  const perMonth = Math.round((financed + financed * (ratePercent / 100) * (term / 12)) / term)
  return { down, financed, perMonth }
}
