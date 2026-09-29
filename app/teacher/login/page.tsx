"use client";
import { PublicShell } from "@/components/public-shell";
import { TeacherProfileForm } from "@/components/teacher-profile-form";
import { StatusIndicator } from "@/components/status-indicator";
import { useDemo } from "@/lib/demo-store";
import { ArrowRight, GraduationCap, LoaderCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function TeacherLogin() {
  const store=useDemo();const router=useRouter();
  useEffect(()=>{if(store.ready&&store.profile)router.replace("/teacher/dashboard");},[store.ready,store.profile,router]);
  return <PublicShell back="/"><div className="entry-flow entry-teacher">
    <aside className="entry-rail">
      <GraduationCap size={28} aria-hidden="true"/><p className="entry-kicker">สำหรับครูผู้สอน</p>
      <h1>พื้นที่ของครู<br/>พร้อมสำหรับการค้นพบ</h1>
      <p>ตั้งชื่อที่นักเรียนจะเห็น แล้วไปสร้างห้องหรือเปิดห้องเรียนที่มีอยู่ในแดชบอร์ด</p>
      <ol className="entry-route"><li><span>01</span>ตั้งโปรไฟล์ครู</li><li><span>02</span>สร้างหรือเลือกห้องเรียน</li><li><span>03</span>แชร์รหัสแล้วเริ่มกิจกรรม</li></ol>
      <p className="entry-rail-note">ใช้รูปแบบเข้าใช้งานเดิม<br/>ไม่ต้องกรอกรหัสผ่าน <ArrowRight size={14} aria-hidden="true"/></p>
    </aside>
    <section className="entry-form-area" aria-labelledby="teacher-entry-title">
      <p className="entry-kicker">เริ่มพื้นที่ทำงาน</p><h2 id="teacher-entry-title">ให้ห้องเรียนรู้จักคุณ</h2>
      <p className="entry-intro">ชื่อและไอคอนนี้ใช้แสดงตัวคุณครูในห้องเรียน</p>
      {!store.ready||store.profile?<div className="entry-loading" role="status"><StatusIndicator tone="info"><LoaderCircle size={16} aria-hidden="true"/>{store.profile?"กำลังเปิดแดชบอร์ด…":"กำลังตรวจสอบโปรไฟล์…"}</StatusIndicator></div>:<TeacherProfileForm entry submitLabel="เข้าสู่แดชบอร์ด"/>}
    </section>
  </div></PublicShell>;
}