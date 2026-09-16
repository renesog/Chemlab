import { getChatGPTUser } from "@/app/chatgpt-auth";
import { database, findRoom, json, parseRoom } from "@/db/live-rooms";
import { findQuestionKeys } from "@/db/question-keys";
import { customQuestionError, type PrivateQuestionKeys } from "@/lib/custom-questions";
import type { ActivityConfig } from "@/lib/types";

async function ownedRoom(id:string,request:Request){const user=await getChatGPTUser();if(!user)return null;const room=await findRoom(id);return room&&(room.owner_user_id===user.userId||!room.owner_user_id&&request.headers.get("x-teacher-token")===room.teacher_token)?room:null}

export async function GET(request:Request,{params}:{params:Promise<{id:string}>}){
  const{id}=await params;const room=await ownedRoom(id,request);if(!room)return json({error:"ไม่มีสิทธิ์ดูโจทย์ห้องนี้"},403);
  return json({answerKeys:await findQuestionKeys(id)});
}

export async function PUT(request:Request,{params}:{params:Promise<{id:string}>}){
  const{id}=await params;const room=await ownedRoom(id,request);if(!room)return json({error:"ไม่มีสิทธิ์แก้โจทย์ห้องนี้"},403);
  let body:{activity?:ActivityConfig;answerKeys?:PrivateQuestionKeys};try{body=await request.json()}catch{return json({error:"ข้อมูลโจทย์ไม่ถูกต้อง"},400)}
  if(!body.activity||!body.answerKeys)return json({error:"ข้อมูลโจทย์ไม่ครบ"},400);
  const issue=customQuestionError(body.activity,body.answerKeys);if(issue)return json({error:issue},400);
  const current=parseRoom(room);
  if(current.status!=="OPEN")return json({error:"แก้โจทย์ได้ก่อนเริ่มเกมเท่านั้น"},409);
  const now=Date.now();
  const updated={...current,activity:body.activity,students:current.students.map(student=>({...student,currentLevel:body.activity!.levelIds[0],totalScore:0,wrongAttempts:0,attemptsByLevel:{},completed:[]}))};
  const snapshot=JSON.stringify(updated);
  try{
    const result=await database().batch([
      database().prepare("update live_rooms set snapshot=?1,version=version+1,updated_at=?2 where id=?3 and version=?4").bind(snapshot,now,id,room.version),
      database().prepare("insert into live_room_answer_keys(room_id,answers_json,updated_at) select ?1,?2,?3 where exists(select 1 from live_rooms where id=?1 and version=?4 and snapshot=?5) on conflict(room_id) do update set answers_json=excluded.answers_json,updated_at=excluded.updated_at").bind(id,JSON.stringify(body.answerKeys),now,room.version+1,snapshot),
    ]);
    if(result[0].meta.changes!==1||result[1].meta.changes!==1)return json({error:"ห้องเปลี่ยนสถานะแล้ว กรุณาโหลดใหม่"},409);
    return json({room:updated});
  }catch{return json({error:"ห้องเปลี่ยนสถานะแล้ว กรุณาโหลดใหม่"},409)}
}
