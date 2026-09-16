import type { ActivityConfig, CustomQuestion } from "./types";

export type PrivateQuestionKey={steps:string[];hint:string;explanation:string};
export type PrivateQuestionKeys=Record<string,PrivateQuestionKey>;

export function customQuestionError(activity:ActivityConfig,keys:PrivateQuestionKeys):string|null{
  if(!activity||typeof activity!=="object"||activity.mode!=="QUESTIONS"||typeof activity.title!=="string"||activity.title.trim().length<2||activity.title.length>60)return "กรุณาตั้งชื่อเกม 2–60 ตัวอักษร";
  const questions=activity.customQuestions;
  if(!Array.isArray(questions)||questions.length<1||questions.length>10)return "เกมต้องมีโจทย์ 1–10 ข้อ";
  if(questions.some(question=>!question||typeof question!=="object"))return "ข้อมูลโจทย์ไม่ถูกต้อง";
  if(typeof activity.hintsEnabled!=="boolean")return "กรุณาเลือกว่าจะเปิดคำใบ้หรือไม่";
  const ids=questions.map(question=>question.id);
  if(new Set(ids).size!==ids.length||ids.some(id=>!Number.isInteger(id)||id<1000||id>9999)||!Array.isArray(activity.levelIds)||activity.levelIds.length!==ids.length||activity.levelIds.some((id,index)=>id!==ids[index]))return "ลำดับข้อไม่ถูกต้อง";
  if(!keys||typeof keys!=="object"||Array.isArray(keys)||Object.keys(keys).length!==questions.length)return "กรุณากำหนดคำตอบให้ครบทุกข้อ";
  for(const question of questions){
    if(questionError(question))return `ข้อ ${ids.indexOf(question.id)+1}: ${questionError(question)}`;
    const key=keys[String(question.id)];
    const toolIds=new Set(question.equipment.map(tool=>tool.id));
    if(!key||!Array.isArray(key.steps)||key.steps.length<1||key.steps.length>8||new Set(key.steps).size!==key.steps.length||key.steps.some(step=>typeof step!=="string"||!toolIds.has(step)))return `ข้อ ${ids.indexOf(question.id)+1}: เลือกลำดับคำตอบจากอุปกรณ์ที่เพิ่มไว้`;
    if(typeof key.hint!=="string"||key.hint.length>200||typeof key.explanation!=="string"||key.explanation.trim().length<5||key.explanation.length>300)return `ข้อ ${ids.indexOf(question.id)+1}: ตรวจคำใบ้และคำอธิบายหลังเฉลย`;
  }
  return null;
}

function questionError(question:CustomQuestion):string|null{
  if(!question||typeof question!=="object")return "ข้อมูลโจทย์ไม่ถูกต้อง";
  if(typeof question.title!=="string"||question.title.trim().length<2||question.title.length>60)return "ตั้งชื่อโจทย์ 2–60 ตัวอักษร";
  if(typeof question.mixture!=="string"||question.mixture.trim().length<3||question.mixture.length>120)return "ระบุสารผสม 3–120 ตัวอักษร";
  if(typeof question.objective!=="string"||question.objective.trim().length<5||question.objective.length>180)return "ระบุภารกิจ 5–180 ตัวอักษร";
  if(!Array.isArray(question.equipment)||question.equipment.length<2||question.equipment.length>10)return "เพิ่มตัวเลือกอุปกรณ์ 2–10 รายการ";
  if(question.equipment.some(tool=>!tool||typeof tool!=="object")||new Set(question.equipment.map(tool=>tool.id)).size!==question.equipment.length||question.equipment.some(tool=>typeof tool.id!=="string"||!/^[a-z0-9-]{1,30}$/.test(tool.id)||typeof tool.label!=="string"||tool.label.trim().length<2||tool.label.length>80))return "ตรวจชื่ออุปกรณ์ให้ครบและไม่ซ้ำ";
  if(!Number.isInteger(question.maxPoints)||question.maxPoints<1||question.maxPoints>100||!Number.isInteger(question.correctPoints)||question.correctPoints<1||question.correctPoints>question.maxPoints||!Number.isInteger(question.wrongPenalty)||question.wrongPenalty<0||question.wrongPenalty>20)return "คะแนนต้องเป็นจำนวนเต็มในช่วงที่กำหนด";
  return null;
}
