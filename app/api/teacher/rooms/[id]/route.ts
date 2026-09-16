import { getChatGPTUser } from "@/app/chatgpt-auth";
import { database, findRoom, json } from "@/db/live-rooms";

export async function DELETE(request:Request,{params}:{params:Promise<{id:string}>}){
  const user=await getChatGPTUser();
  if(!user)return json({error:"กรุณาเข้าสู่ระบบครู"},401);
  const{id}=await params;
  const room=await findRoom(id);
  if(!room||room.id!==id)return json({error:"ไม่พบห้องเรียน"},404);
  const owned=room.owner_user_id===user.userId;
  const legacy=!room.owner_user_id&&request.headers.get("x-teacher-token")===room.teacher_token;
  if(!owned&&!legacy)return json({error:"คุณไม่มีสิทธิ์ลบห้องนี้"},403);
  const result=owned
    ?await database().prepare("delete from live_rooms where id=?1 and owner_user_id=?2").bind(id,user.userId).run()
    :await database().prepare("delete from live_rooms where id=?1 and owner_user_id is null and teacher_token=?2").bind(id,room.teacher_token).run();
  if(result.meta.changes<1)return json({error:"ไม่พบห้องเรียน หรือห้องถูกลบไปแล้ว"},404);
  return json({deleted:true});
}
