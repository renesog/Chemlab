import test from "node:test";
import assert from "node:assert/strict";
import { customQuestionError } from "./custom-questions.ts";
import type { ActivityConfig } from "./types.ts";

const activity:ActivityConfig={mode:"QUESTIONS",title:"เกมแยกสาร",hintsEnabled:true,levelIds:[1000],pointsByLevel:{1000:5},customQuestions:[{id:1000,title:"แยกสารผสม",mixture:"เหล็ก + ถ่าน",objective:"แยกผงเหล็กออกจากถ่าน",equipment:[{id:"magnet",label:"แม่เหล็ก"},{id:"sieve",label:"ตะแกรง"}],maxPoints:5,correctPoints:5,wrongPenalty:1}]};
const keys={"1000":{steps:["magnet"],hint:"อะไรถูกดูดได้",explanation:"เหล็กถูกแม่เหล็กดูด แต่ถ่านไม่ถูกดูด"}};

test("ตรวจโจทย์และเฉลยที่ครูสร้าง",()=>{assert.equal(customQuestionError(activity,keys),null)});
test("ปฏิเสธเฉลยที่ไม่ใช่อุปกรณ์ในโจทย์",()=>{assert.ok(customQuestionError(activity,{"1000":{...keys["1000"],steps:["unknown"]}}))});
test("ปฏิเสธคะแนนที่เกินคะแนนเต็ม",()=>{const invalid=structuredClone(activity);invalid.customQuestions![0].correctPoints=8;assert.ok(customQuestionError(invalid,keys))});
test("ปฏิเสธข้อมูลผิดรูปโดยไม่ล้มเซิร์ฟเวอร์",()=>{assert.ok(customQuestionError({...activity,customQuestions:[null]} as unknown as ActivityConfig,keys));assert.ok(customQuestionError(activity,null as never))});
