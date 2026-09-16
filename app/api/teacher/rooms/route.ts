import { getChatGPTUser } from "@/app/chatgpt-auth";
import { database, json } from "@/db/live-rooms";
import type { Classroom } from "@/lib/types";

export async function GET(){
  const user=await getChatGPTUser();if(!user)return json({error:"กรุณาเข้าสู่ระบบครู"},401);
  const result=await database().prepare("select id,snapshot from live_rooms where owner_user_id=?1 order by updated_at desc limit 100").bind(user.userId).all<{id:string;snapshot:string}>();
  return json({rooms:result.results.map(row=>JSON.parse(row.snapshot) as Classroom)});
}
