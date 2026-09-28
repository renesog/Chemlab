export type LabToolKind = "magnet" | "sieve" | "funnel" | "burner" | "water" | "dish" | "stir" | "beaker";

export function labToolKind(id: string, label = ""): LabToolKind {
  const value = `${id} ${label}`.toLowerCase();
  if (/magnet|แม่เหล็ก/.test(value)) return "magnet";
  if (/sieve|ตะแกรง|ร่อน/.test(value)) return "sieve";
  if (/funnel|filter|paper|กรวย|กรอง/.test(value)) return "funnel";
  if (/stir|คนให้|กวน/.test(value)) return "stir";
  if (/heat|sublim|evaporat|ความร้อน|ระเหิด|ระเหย/.test(value)) return "burner";
  if (/dish|จาน/.test(value)) return "dish";
  if (/water|dissolve|เติมน้ำ|ละลาย/.test(value)) return "water";
  return "beaker";
}

// General usage guidance only; never contains a level's answer sequence.
export function labToolDescription(id: string, label: string) {
  const descriptions: Record<LabToolKind, string> = {
    magnet: "ใช้ตรวจหรือดึงสารที่ตอบสนองต่อแม่เหล็ก ลองพิจารณาสมบัติของสารในโจทย์ก่อนเลือกใช้",
    sieve: "แยกอนุภาคด้วยช่องตะแกรง ขนาดอนุภาคและขนาดช่องมีผลต่อสิ่งที่ผ่านลงไป",
    funnel: "ใช้ถ่ายเทหรือแยกสารตามชนิดของกรวยและวัสดุกรอง ควรคิดถึงสารที่ต้องการเก็บและภาชนะรองรับ",
    burner: "ใช้ความร้อนเปลี่ยนสภาพของสาร ควรพิจารณาว่าสารแต่ละชนิดตอบสนองต่อความร้อนอย่างไร",
    water: "เติมตัวทำละลายเพื่อดูสมบัติการละลาย สารแต่ละชนิดอาจตอบสนองไม่เหมือนกัน",
    dish: "ภาชนะตื้นมีพื้นที่ผิวสัมผัสมาก เหมาะกับการสังเกตการเปลี่ยนแปลงของสารในภาชนะ",
    stir: "การคนช่วยให้สารสัมผัสกันทั่วถึง แต่ไม่ได้ทำให้สารทุกชนิดละลายได้",
    beaker: "อ่านชื่อขั้นตอนและพิจารณาว่าต้องทำก่อนหรือหลังขั้นตอนอื่น โดยดูจากเป้าหมายของโจทย์",
  };
  return descriptions[labToolKind(id,label)];
}
