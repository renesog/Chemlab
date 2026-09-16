export type PublicLevel = {
  id: number;
  title: string;
  mixture: string;
  objective: string;
  difficulty: number;
  equipment: { id: string; label: string }[];
};

export const LEVELS: PublicLevel[] = [
  { id: 1, title: "เหล็กอยู่ไหน", mixture: "ผงถ่าน + ผงตะไบเหล็ก", objective: "เลือกวิธีแยกผงตะไบเหล็กออกจากผงถ่าน", difficulty: 1, equipment: [{id:"magnet",label:"ใช้แม่เหล็กดูดผงตะไบเหล็ก"},{id:"sieve",label:"ร่อนด้วยตะแกรง"},{id:"water",label:"เติมน้ำสะอาด"}] },
  { id: 2, title: "เกลือกับการบูร", mixture: "เกลือ + การบูร", objective: "แยกการบูรออกจากเกลือ เลือกเส้นทางการละลายน้ำหรือการระเหิด", difficulty: 2, equipment: [{id:"sublime",label:"เตรียมชุดระเหิด"},{id:"gentle-heat",label:"ให้ความร้อนอย่างระมัดระวัง"},{id:"collect-camphor",label:"เก็บผลึกการบูรที่ควบแน่น"},{id:"add-water",label:"เติมน้ำให้เกลือละลาย"},{id:"stir",label:"คนให้เกลือละลาย"},{id:"filter-camphor",label:"กรองแยกการบูร"},{id:"sieve",label:"ร่อนด้วยตะแกรง"}] },
  { id: 3, title: "น้ำตาลซ่อนในเทียนไข", mixture: "น้ำตาล + เทียนไข (พาราฟิน)", objective: "แยกเทียนไขและนำน้ำตาลกลับคืน โดยใช้สมบัติการละลายน้ำ", difficulty: 3, equipment: [{id:"add-water",label:"เติมน้ำสะอาดหรือน้ำอุ่น"},{id:"stir",label:"คนให้น้ำตาลละลายในน้ำ"},{id:"cool-wax",label:"ปล่อยให้เทียนไขเย็นและแข็งตัว"},{id:"remove-wax",label:"ตักเทียนไขที่ลอยอยู่ออก"},{id:"evaporate",label:"ระเหยน้ำอย่างอ่อนเพื่อเก็บน้ำตาล"},{id:"magnet",label:"ใช้แม่เหล็ก"},{id:"sieve",label:"ร่อนด้วยตะแกรง"}] },
  { id: 4, title: "ต่างขนาด ต่างทาง", mixture: "ทราย + กรวด", objective: "แยกของแข็งที่มีขนาดต่างกัน", difficulty: 3, equipment: [{id:"sieve",label:"ร่อนด้วยตะแกรง"},{id:"magnet",label:"ใช้แม่เหล็ก"},{id:"heat",label:"ให้ความร้อน"}] },
  { id: 5, title: "น้ำใสจากทราย", mixture: "ทราย + น้ำ", objective: "แยกทรายออกจากน้ำด้วยการกรอง", difficulty: 4, equipment: [{id:"paper",label:"ใส่กระดาษกรองในกรวย"},{id:"receiver",label:"วางภาชนะรองรับ"},{id:"pour",label:"เทส่วนผสมผ่านกรวย"},{id:"heat",label:"ให้ความร้อน"}] },
  { id: 6, title: "ผลึกเกลือ", mixture: "เกลือ + น้ำ", objective: "ทำให้ได้เกลือกลับคืนมา", difficulty: 4, equipment: [{id:"dish",label:"เทลงจานระเหย"},{id:"heat",label:"ให้ความร้อนอย่างเหมาะสม"},{id:"collect-salt",label:"เก็บผลึกเกลือ"},{id:"sieve",label:"ร่อนด้วยตะแกรง"}] },
  { id: 7, title: "สองชั้นของเหลว", mixture: "น้ำมัน + น้ำ", objective: "แยกของเหลวที่ไม่ละลายเข้าด้วยกัน", difficulty: 4, equipment: [{id:"sep-funnel",label:"เทลงกรวยแยก"},{id:"settle",label:"รอให้แยกชั้น"},{id:"drain",label:"เปิดก๊อกแยกชั้นล่าง"},{id:"filter",label:"กรองด้วยกระดาษ"}] },
  { id: 8, title: "ภารกิจสามสาร", mixture: "ผงตะไบเหล็ก + ทราย + เกลือ", objective: "แยกสารทั้งสามชนิดกลับคืนมา", difficulty: 5, equipment: [{id:"magnet",label:"ใช้แม่เหล็กแยกเหล็ก"},{id:"dissolve",label:"เติมน้ำให้เกลือละลาย"},{id:"filter-sand",label:"กรองแยกทราย"},{id:"evaporate",label:"ระเหยน้ำเพื่อเก็บเกลือ"},{id:"sieve",label:"ร่อนด้วยตะแกรง"}] },
];
