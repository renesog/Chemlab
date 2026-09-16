import { AppShell } from "@/components/app-shell";
import { TeacherProfileForm } from "@/components/teacher-profile-form";
import { requireChatGPTUser } from "@/app/chatgpt-auth";
import { findTeacherProfile } from "@/db/teacher-profiles";
import { redirect } from "next/navigation";

export const dynamic="force-dynamic";

export default async function TeacherProfilePage(){
  const user=await requireChatGPTUser("/teacher/profile");
  const profile=await findTeacherProfile(user.userId);
  if(!profile)redirect("/teacher/login");
  return <AppShell title="โปรไฟล์ครู" back="/teacher/dashboard"><main className="center-shell"><section className="form-card teacher-account-card"><p className="eyebrow">บัญชีครู</p><h1>แก้ไขโปรไฟล์</h1><TeacherProfileForm initial={profile} email={user.email} submitLabel="บันทึกโปรไฟล์"/></section></main></AppShell>;
}
