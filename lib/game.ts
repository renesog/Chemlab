const ANSWERS: Record<number, string[][]> = {
  1: [["magnet"]],
  2: [["sublime", "gentle-heat", "collect-camphor"],["add-water", "stir", "filter-camphor"]],
  3: [["add-water", "stir", "cool-wax", "remove-wax", "evaporate"]],
  4: [["sieve"]],
  5: [["paper", "receiver", "pour"]],
  6: [["dish", "heat", "collect-salt"]],
  7: [["sep-funnel", "settle", "drain"]],
  8: [["magnet", "dissolve", "filter-sand", "evaporate"]],
};
const LEGACY_ANSWERS:Record<number,string[][]>={
  1:[["magnet"]],2:[["sieve"]],3:[["paper","receiver","pour"]],
  4:[["dish","heat","collect-salt"]],5:[["sublime","gentle-heat","collect-camphor"]],
  6:[["sep-funnel","settle","drain"]],7:[["add-water","stir","remove-wax","evaporate"]],
  8:[["magnet","dissolve","filter-sand","evaporate"]],
};

export function scoreForAttempts(attempts: number, maxPoints = 5) { return Math.max(1, Math.max(1, maxPoints) - Math.max(0, attempts)); }
export function scoreForCustomAttempts(attempts:number,correctPoints:number,wrongPenalty:number,maxPoints:number){
  return Math.max(1,Math.min(maxPoints,correctPoints)-Math.max(0,attempts)*wrongPenalty);
}
export function validateSequence(levelId: number, submitted: string[],catalogVersion:1|2=2) {
  const expected = (catalogVersion===2?ANSWERS:LEGACY_ANSWERS)[levelId];
  return !!expected?.some(sequence=>submitted.length===sequence.length&&sequence.every((step,index)=>submitted[index]===step));
}

export function feedbackFor(levelId: number, submitted: string[]) {
  if (!submitted.length) return "ลองเลือกอุปกรณ์หรือขั้นตอนก่อนส่งคำตอบ";
  if (levelId === 2) return "ลองเลือกวิธีใดวิธีหนึ่งให้ครบก่อน: ใช้ความต่างของการละลาย หรือการระเหิด";
  if (levelId === 3) return "น้ำตาลละลายน้ำได้ แต่เทียนไขไม่ละลาย ลองเรียงตั้งแต่เติมน้ำจนเก็บน้ำตาลคืน";
  if (levelId >= 4) return "ยังไม่สำเร็จ ลองคิดว่าควรเตรียมอุปกรณ์ใดก่อนเริ่มแยกสาร";
  return "วิธีนี้ยังไม่ใช้สมบัติที่แตกต่างกันของสาร ลองสังเกตอีกครั้ง";
}

export function explanationFor(levelId:number,catalogVersion:1|2=2){
  if(catalogVersion===1)return "วิธีที่เลือกใช้สมบัติที่แตกต่างกันของสาร จึงแยกส่วนผสมได้สำเร็จ";
  const explanations:Record<number,string>={
    1:"เหล็กถูกแม่เหล็กดูด แต่ผงถ่านไม่ถูกดูด จึงแยกออกจากกันได้",
    2:"การบูรกับเกลือมีสมบัติต่างกัน: การบูรระเหิดได้ ส่วนเกลือละลายน้ำได้",
    3:"น้ำตาลละลายในน้ำ แต่เทียนไขไม่ละลายและลอยอยู่ จึงตักเทียนไขออกก่อนนำน้ำตาลกลับคืน",
    4:"อนุภาคกรวดใหญ่กว่าทราย ตะแกรงจึงคัดแยกได้",
    5:"กระดาษกรองกักทรายไว้ แต่น้ำผ่านลงภาชนะรองรับ",
    6:"เมื่อน้ำระเหยออก เกลือที่ละลายอยู่จะเหลือเป็นผลึก",
    7:"น้ำมันกับน้ำไม่ละลายรวมกันและแยกเป็นชั้น จึงใช้กรวยแยกได้",
    8:"ใช้สมบัติแม่เหล็ก การละลาย การกรอง และการระเหยต่อเนื่องเพื่อแยกสารทั้งสาม",
  };
  return explanations[levelId]??"แยกสารสำเร็จ";
}
