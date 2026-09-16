import { getChatGPTUser } from "@/app/chatgpt-auth";
import { database, json, rateAllowed } from "@/db/live-rooms";
import { findTeacherProfile, validTeacherProfile } from "@/db/teacher-profiles";

export async function GET(){
  const user=await getChatGPTUser();if(!user)return json({error:"กรุณาเข้าสู่ระบบครู"},401);
  return json({profile:await findTeacherProfile(user.userId),email:user.email});
}

export async function PUT(request:Request){
  const user=await getChatGPTUser();if(!user)return json({error:"กรุณาเข้าสู่ระบบครู"},401);
  if(!await rateAllowed(`profile:${user.userId}`,20))return json({error:"บันทึกถี่เกินไป กรุณารอสักครู่"},429);
  let body:unknown;try{body=await request.json()}catch{return json({error:"ข้อมูลโปรไฟล์ไม่ถูกต้อง"},400)}
  if(!validTeacherProfile(body))return json({error:"ชื่อเล่นต้องมี 2–32 ตัวอักษร และเลือกโปรไฟล์จากรายการ"},400);
  const profile={...body,nickname:body.nickname.trim()};const now=Date.now();
  await database().prepare("insert into teacher_profiles(user_id,nickname,avatar,color,created_at,updated_at) values(?1,?2,?3,?4,?5,?5) on conflict(user_id) do update set nickname=excluded.nickname,avatar=excluded.avatar,color=excluded.color,updated_at=excluded.updated_at").bind(user.userId,profile.nickname,profile.avatar,profile.color,now).run();
  return json({profile});
}
