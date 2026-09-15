const ANSWERS: Record<number, string[]> = {
  1: ["magnet"], 2: ["sieve"], 3: ["paper", "receiver", "pour"],
  4: ["dish", "heat", "collect-salt"], 5: ["sublime", "gentle-heat", "collect-camphor"],
  6: ["sep-funnel", "settle", "drain"], 7: ["add-water", "stir", "remove-wax", "evaporate"],
  8: ["magnet", "dissolve", "filter-sand", "evaporate"],
};

export function scoreForAttempts(attempts: number) { return Math.max(1, 5 - Math.max(0, attempts)); }
export function validateSequence(levelId: number, submitted: string[]) {
  const expected = ANSWERS[levelId];
  if (!expected || submitted.length !== expected.length) return false;
  return expected.every((step, index) => submitted[index] === step);
}

export function feedbackFor(levelId: number, submitted: string[]) {
  if (!submitted.length) return "ลองเลือกอุปกรณ์หรือขั้นตอนก่อนส่งคำตอบ";
  if (levelId >= 3) return "ยังไม่สำเร็จ ลองคิดว่าควรเตรียมอุปกรณ์ใดก่อนเริ่มแยกสาร";
  return "วิธีนี้ยังไม่ใช้สมบัติที่แตกต่างกันของสาร ลองสังเกตอีกครั้ง";
}
