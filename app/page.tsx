"use client";

import { ArrowRight, FlaskConical, GraduationCap, UsersRound } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  return (
    <main className="role-page">
      <header className="brand-bar">
        <div className="brand-mark" aria-hidden="true"><FlaskConical size={24} /></div>
        <div><strong>ChemClass Lab</strong><span>ห้องเรียนวิทยาศาสตร์เสมือน</span></div>
      </header>
      <section className="role-shell" aria-labelledby="role-heading">
        <div className="role-intro">
          <p className="eyebrow">เริ่มต้นใช้งาน</p>
          <h1 id="role-heading">วันนี้คุณเข้าห้องเรียน<br />ในบทบาทไหน?</h1>
          <p>เลือกบทบาทเพื่อเข้าสู่พื้นที่ที่เหมาะกับคุณ</p>
        </div>
        <div className="role-grid">
          <button className="role-card teacher" onClick={() => router.push("/teacher/login")}>
            <span className="role-icon"><GraduationCap size={34} /></span>
            <span className="role-copy"><strong>ฉันเป็นครู</strong><span>สร้างห้อง จัดโต๊ะ และติดตามการทดลอง</span></span>
            <ArrowRight className="role-arrow" aria-hidden="true" />
          </button>
          <button className="role-card student" onClick={() => router.push("/join")}>
            <span className="role-icon"><UsersRound size={34} /></span>
            <span className="role-copy"><strong>ฉันเป็นนักเรียน</strong><span>ใส่รหัสห้อง เลือกที่นั่ง และเริ่มทดลอง</span></span>
            <ArrowRight className="role-arrow" aria-hidden="true" />
          </button>
        </div>
        <p className="role-note">นักเรียนไม่ต้องสมัครบัญชี</p>
      </section>
    </main>
  );
}
