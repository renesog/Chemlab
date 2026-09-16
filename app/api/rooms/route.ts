import { database, findRoom, json, parseRoom, rateAllowed } from "@/db/live-rooms";
import type { Classroom } from "@/lib/types";
import { getChatGPTUser } from "@/app/chatgpt-auth";
import { findTeacherProfile } from "@/db/teacher-profiles";

export async function POST(request:Request){
  const user=await getChatGPTUser();if(!user)return json({error:"กรุณาเข้าสู่ระบบครูก่อนสร้างห้อง"},401);
  if(!await findTeacherProfile(user.userId))return json({error:"กรุณาสร้างโปรไฟล์ครูก่อน"},403);
  let body:{room?:Classroom;teacherToken?:string};try{body=await request.json()}catch{return json({error:"ข้อมูลห้องไม่ถูกต้อง"},400)}
  const room=body.room;if(!room||typeof room.id!=="string"||room.id.length>80||!/^[A-Z0-9]{6}$/.test(room.code)||typeof room.name!=="string"||room.name.trim().length<2||room.name.length>60||!Array.isArray(room.desks)||room.desks.length<1||room.desks.length>40||!Array.isArray(room.students)||room.students.length!==0||typeof room.subject!=="string"||room.subject.length>80)return json({error:"ข้อมูลห้องไม่ถูกต้อง"},400);
  if(!await rateAllowed(`create:${request.headers.get("cf-connecting-ip")??"local"}`,15))return json({error:"สร้างห้องถี่เกินไป กรุณารอสักครู่"},429);
  const existing=await findRoom(room.id);
  if(existing){if(existing.owner_user_id!==user.userId)return json({error:"ห้องนี้ไม่ใช่ของคุณ"},403);return json({room:parseRoom(existing),teacherToken:existing.teacher_token,published:true});}
  const teacherToken=crypto.randomUUID()+crypto.randomUUID();
  try{await database().prepare("insert into live_rooms(id,code,snapshot,teacher_token,owner_user_id,version,updated_at) values(?1,?2,?3,?4,?5,1,?6)").bind(room.id,room.code,JSON.stringify(room),teacherToken,user.userId,Date.now()).run();}
  catch{return json({error:"รหัสห้องนี้ถูกใช้งานแล้ว กรุณาสร้างห้องใหม่"},409)}
  return json({room,teacherToken,published:true},201);
}
