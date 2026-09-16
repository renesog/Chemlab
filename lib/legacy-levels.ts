import type { PublicLevel } from "./levels";

// Rooms created before the revised lesson keep their original level IDs and progress.
export const LEGACY_LEVELS:PublicLevel[]=[
  {id:1,title:"ตามหาโลหะ",mixture:"ผงตะไบเหล็ก + ผงถ่าน",objective:"แยกผงตะไบเหล็กออกมา",difficulty:1,equipment:[{id:"magnet",label:"แม่เหล็ก"},{id:"sieve",label:"ตะแกรง"},{id:"water",label:"น้ำสะอาด"}]},
  {id:2,title:"ต่างขนาด ต่างทาง",mixture:"ทราย + กรวด",objective:"แยกของแข็งที่มีขนาดต่างกัน",difficulty:1,equipment:[{id:"sieve",label:"ร่อนด้วยตะแกรง"},{id:"magnet",label:"ใช้แม่เหล็ก"},{id:"heat",label:"ให้ความร้อน"}]},
  {id:3,title:"น้ำใสจากทราย",mixture:"ทราย + น้ำ",objective:"แยกทรายออกจากน้ำด้วยการกรอง",difficulty:2,equipment:[{id:"paper",label:"ใส่กระดาษกรองในกรวย"},{id:"receiver",label:"วางภาชนะรองรับ"},{id:"pour",label:"เทส่วนผสมผ่านกรวย"},{id:"heat",label:"ให้ความร้อน"}]},
  {id:4,title:"ผลึกเกลือ",mixture:"เกลือ + น้ำ",objective:"ทำให้ได้เกลือกลับคืนมา",difficulty:2,equipment:[{id:"dish",label:"เทลงจานระเหย"},{id:"heat",label:"ให้ความร้อนอย่างเหมาะสม"},{id:"collect-salt",label:"เก็บผลึกเกลือ"},{id:"sieve",label:"ร่อนด้วยตะแกรง"}]},
  {id:5,title:"ผลึกลอยฟ้า",mixture:"การบูร + เกลือ",objective:"แยกการบูรโดยอาศัยการเปลี่ยนสถานะ",difficulty:3,equipment:[{id:"sublime",label:"เตรียมชุดระเหิด"},{id:"gentle-heat",label:"ให้ความร้อนอย่างเหมาะสม"},{id:"collect-camphor",label:"รวบรวมผลึกการบูร"},{id:"water",label:"เติมน้ำ"}]},
  {id:6,title:"สองชั้นของเหลว",mixture:"น้ำมัน + น้ำ",objective:"แยกของเหลวที่ไม่ละลายเข้าด้วยกัน",difficulty:3,equipment:[{id:"sep-funnel",label:"เทลงกรวยแยก"},{id:"settle",label:"รอให้แยกชั้น"},{id:"drain",label:"เปิดก๊อกแยกชั้นล่าง"},{id:"filter",label:"กรองด้วยกระดาษ"}]},
  {id:7,title:"หวานซ่อนเทียน",mixture:"น้ำตาล + เทียนไข",objective:"แยกและเก็บสารทั้งสองชนิด",difficulty:4,equipment:[{id:"add-water",label:"เติมน้ำสะอาด"},{id:"stir",label:"คนให้น้ำตาลละลาย"},{id:"remove-wax",label:"แยกเทียนไขออก"},{id:"evaporate",label:"ระเหยน้ำจากสารละลาย"},{id:"magnet",label:"ใช้แม่เหล็ก"}]},
  {id:8,title:"ภารกิจสามสาร",mixture:"ผงตะไบเหล็ก + ทราย + เกลือ",objective:"แยกสารทั้งสามชนิดกลับคืนมา",difficulty:5,equipment:[{id:"magnet",label:"ใช้แม่เหล็กแยกเหล็ก"},{id:"dissolve",label:"เติมน้ำให้เกลือละลาย"},{id:"filter-sand",label:"กรองแยกทราย"},{id:"evaporate",label:"ระเหยน้ำเพื่อเก็บเกลือ"},{id:"sieve",label:"ร่อนด้วยตะแกรง"}]},
];
