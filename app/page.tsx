"use client";
import Link from "next/link";
import { ArrowRight, GraduationCap, UsersRound } from "lucide-react";
import { PublicShell } from "@/components/public-shell";
import { ScienceDiagram } from "@/components/science-diagram";
import { useDemo } from "@/lib/demo-store";

export default function Home() {
  const store=useDemo();
  return <PublicShell><div className="entry-landing">
    <section className="entry-identity" aria-labelledby="identity-title">
      <p className="entry-kicker">ห้องเรียนวิทยาศาสตร์ / การแยกสาร</p>
      <h1 id="identity-title">ChemClass<br/><span>Lab.</span></h1>
      <p className="entry-manifesto">เริ่มจากความสงสัย<br/>หาคำตอบด้วยการทดลอง</p>
      <ScienceDiagram/>
      <p className="entry-identity-note">สังเกตสมบัติของสาร เลือกอุปกรณ์<br/>แล้วเรียงวิธีทดลองด้วยตัวเอง</p>
    </section>
    <section className="entry-actions" aria-labelledby="start-title">
      <p className="entry-kicker">เลือกบทบาทของคุณ</p>
      <h2 id="start-title">เริ่มต้นใช้งาน</h2>
      <p className="entry-intro">หนึ่งห้องเรียน หลายการค้นพบ<br/>เลือกทางเข้าสำหรับคุณ</p>
      <div className="entry-role-actions">
        <Link href={store.profile?"/teacher/dashboard":"/teacher/login"} className="entry-role-row">
          <GraduationCap aria-hidden="true"/><span><strong>ครูผู้สอน</strong><small>{store.profile?"กลับไปจัดการห้องเรียนของคุณ":"สร้างห้องและควบคุมกิจกรรม"}</small></span><ArrowRight aria-hidden="true"/>
        </Link>
        <Link href="/join" className="entry-role-row">
          <UsersRound aria-hidden="true"/><span><strong>นักเรียน</strong><small>ใส่รหัสห้อง แล้วเริ่มทดลอง</small></span><ArrowRight aria-hidden="true"/>
        </Link>
      </div>
      <p className="entry-footnote">นักเรียนใช้เพียงชื่อเล่นและรหัสจากคุณครู<br/>หรือเปิดลิงก์ห้องจาก QR Code</p>
    </section>
  </div></PublicShell>;
}