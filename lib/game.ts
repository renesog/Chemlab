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

export function progressiveHint(levelId: number, version: 1 | 2, mistakes: number) {
  const id = version === 1 ? ({1:1,2:4,3:5,4:6,5:2,6:7,7:3,8:8} as Record<number,number>)[levelId] : levelId;
  const hints: Record<number, [string, string]> = {
    1: ["สารทั้งสองตอบสนองต่อแรงดึงดูดเหมือนกันหรือไม่", "นึกถึงสมบัติที่แตกต่างกันของเหล็กกับผงถ่าน"],
    2: ["เปรียบเทียบการละลายและการเปลี่ยนสถานะของสารทั้งสอง", "เลือกแนวทางเดียวให้ครบ และคิดว่าจะเก็บสารที่แยกออกมาอย่างไร"],
    3: ["สารใดละลายในน้ำ และสารใดยังคงแยกอยู่", "พิจารณาสถานะของเทียนไข และวิธีเก็บสารที่ละลายอยู่กลับคืน"],
    4: ["อนุภาคของสารทั้งสองมีขนาดเท่ากันหรือไม่", "ขนาดช่องของอุปกรณ์ควรให้สารชนิดหนึ่งผ่านและกักอีกชนิดไว้"],
    5: ["สารใดผ่านวัสดุกรองได้ และสารใดควรถูกกักไว้", "ตรวจว่าชุดกรองและภาชนะรับพร้อมก่อนถ่ายสารหรือยัง"],
    6: ["เมื่อของเหลวเปลี่ยนสถานะ สารที่ละลายอยู่จะไปอยู่ที่ใด", "คิดถึงภาชนะที่เหมาะกับความร้อน และขั้นตอนเก็บสารที่เหลือ"],
    7: ["ของเหลวทั้งสองรวมเป็นเนื้อเดียวกันหรือแยกชั้น", "ปล่อยให้ชั้นของเหลวชัดเจนก่อน แล้วพิจารณาว่าควรนำชั้นใดออกก่อน"],
    8: ["สารแต่ละชนิดมีสมบัติใดที่ช่วยแยกออกจากส่วนที่เหลือ", "ทบทวนหลังแต่ละขั้นว่าเหลือของแข็งหรือสารละลายใดที่ต้องแยกต่อ"],
  };
  const choices = hints[id];
  return choices?.[mistakes >= 2 ? 1 : 0] ?? "ทบทวนสมบัติของสารและเป้าหมายการแยก";
}

export function reasoningFeedback(levelId: number, submitted: string[], version: 1 | 2, mistakes: number) {
  const answers = (version === 1 ? LEGACY_ANSWERS : ANSWERS)[levelId] ?? [];
  if (answers.some(answer => answer.length === submitted.length && answer.every(id => submitted.includes(id)) && new Set(submitted).size === submitted.length)) {
    return "อุปกรณ์ที่เลือกใช้ได้ ลองตรวจลำดับว่าอะไรต้องเตรียมก่อน และอะไรควรทำหลัง";
  }
  return progressiveHint(levelId, version, mistakes);
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
