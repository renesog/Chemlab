import { database } from "./live-rooms";
import type { TeacherProfile } from "@/lib/types";

type ProfileRow={nickname:string;avatar:string;color:string};
export async function findTeacherProfile(userId:string):Promise<TeacherProfile|null>{
  const row=await database().prepare("select nickname,avatar,color from teacher_profiles where user_id=?1").bind(userId).first<ProfileRow>();
  if(!row)return null;
  return {nickname:row.nickname,avatar:row.avatar as TeacherProfile["avatar"],color:row.color as TeacherProfile["color"]};
}

export function validTeacherProfile(value:unknown):value is TeacherProfile{
  if(!value||typeof value!=="object")return false;
  const profile=value as Record<string,unknown>;
  return typeof profile.nickname==="string"&&profile.nickname.trim().length>=2&&profile.nickname.trim().length<=32&&["flask","atom","book"].includes(String(profile.avatar))&&["cyan","navy","gold"].includes(String(profile.color));
}
