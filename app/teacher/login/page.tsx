import { AppShell } from "@/components/app-shell";
import { TeacherProfileForm } from "@/components/teacher-profile-form";
import { chatGPTSignInPath, getChatGPTUser } from "@/app/chatgpt-auth";
import { findTeacherProfile } from "@/db/teacher-profiles";
import { GraduationCap } from "lucide-react";
import { redirect } from "next/navigation";

export const dynamic="force-dynamic";

export default async function TeacherLogin(){
  const user=await getChatGPTUser();
  if(user){const profile=await findTeacherProfile(user.userId);if(profile)redirect("/teacher/dashboard");}
  return <AppShell title="สำหรับครู"><main className="center-shell"><section className="form-card teacher-account-card"><div className="section-icon"><GraduationCap/></div><p className="eyebrow">พื้นที่สำหรับครู</p><h1>{user?"สมัครโปรไฟล์ครู":"เริ่มใช้งานสำหรับครู"}</h1>{user?<TeacherProfileForm email={user.email} submitLabel="สร้างโปรไฟล์และเริ่มใช้งาน"/>:<><p className="muted">เข้าสู่ระบบอย่างปลอดภัยก่อนตั้งชื่อเล่นและสร้างห้องเรียน นักเรียนยังเข้าห้องผ่าน QR ได้โดยไม่ต้องสมัครบัญชี</p><a className="primary-button teacher-signin" href={chatGPTSignInPath("/teacher/login")} target="_top">เข้าสู่ระบบด้วย ChatGPT</a></>}</section></main></AppShell>;
}
