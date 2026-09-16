import { requireChatGPTUser } from "@/app/chatgpt-auth";
import { findTeacherProfile } from "@/db/teacher-profiles";
import { redirect } from "next/navigation";

export const dynamic="force-dynamic";
export default async function TeacherClassroomsLayout({children}:{children:React.ReactNode}){
  const user=await requireChatGPTUser("/teacher/dashboard");
  if(!await findTeacherProfile(user.userId))redirect("/teacher/login");
  return children;
}
