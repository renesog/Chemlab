"use client";

import { ArrowRight, CheckCircle2, FlaskConical, GraduationCap, Sparkles, UsersRound, Atom, Dna } from "lucide-react";
import { useRouter } from "next/navigation";
import { useDemo } from "@/lib/demo-store";

export default function Home() {
  const router = useRouter();
  const store = useDemo();

  return (
    <main className="role-page modern-role-page">
      {/* Decorative background ambient glows */}
      <div className="ambient-glow glow-1" aria-hidden="true" />
      <div className="ambient-glow glow-2" aria-hidden="true" />

      <header className="brand-bar modern-brand-bar">
        <div className="brand-mark" aria-hidden="true">
          <FlaskConical size={24} />
        </div>
        <div>
          <strong>ChemClass Lab</strong>
          <span>ห้องเรียนวิทยาศาสตร์เสมือนจริง</span>
        </div>
        <div className="brand-badge" aria-hidden="true">
          <Sparkles size={14} />
          <span>Interactive Sim</span>
        </div>
      </header>

      <section className="role-shell" aria-labelledby="role-heading">
        <div className="role-intro">
          <p className="eyebrow modern-eyebrow">
            <Atom size={16} className="inline-icon" /> ยินดีต้อนรับสู่ห้องปฏิบัติการเคมี
          </p>
          <h1 id="role-heading">
            วันนี้คุณเข้าห้องเรียน<br />ในบทบาทไหน?
          </h1>
          <p className="role-subheading">
            แพลตฟอร์มจำลองการทดลองวิทยาศาสตร์แบบกระบวนการจริง เรียลไทม์ และไม่ต้องสมัครบัญชี
          </p>
        </div>

        <div className="role-grid modern-role-grid">
          {/* Card: Teacher */}
          <button 
            type="button"
            className="role-card modern-role-card teacher" 
            onClick={() => router.push(store.profile ? "/teacher/dashboard" : "/teacher/login")}
          >
            <div className="role-card-inner">
              <div className="role-icon-wrapper">
                <span className="role-icon">
                  <GraduationCap size={36} />
                </span>
                <span className="role-chip teacher-chip">คุณครูผู้สอน</span>
              </div>
              <div className="role-copy">
                <small>สำหรับผู้จัดกิจกรรม / คุณครู</small>
                <strong>ฉันเป็นครู</strong>
                <span>สร้างห้องเรียน ออกโจทย์ จัดผังโต๊ะ ล็อกที่นั่ง และติดตามผลคะแนนสด</span>
                <span className="role-action-link">
                  เข้าสู่ห้องเรียนครู <ArrowRight size={18} className="arrow-animated" />
                </span>
              </div>
            </div>
            <div className="card-shine" aria-hidden="true" />
          </button>

          {/* Card: Student */}
          <button 
            type="button"
            className="role-card modern-role-card student" 
            onClick={() => router.push("/join")}
          >
            <div className="role-card-inner">
              <div className="role-icon-wrapper">
                <span className="role-icon student-icon">
                  <UsersRound size={36} />
                </span>
                <span className="role-chip student-chip">นักเรียน / ผู้เข้าสอบ</span>
              </div>
              <div className="role-copy">
                <small>เข้าร่วมได้ทันที สะดวกรวดเร็ว</small>
                <strong>ฉันเป็นนักเรียน</strong>
                <span>สแกน QR หรือใส่รหัส 6 หลัก เลือกที่นั่ง สร้างตัวละคร และเริ่มแยกสาร</span>
                <span className="role-action-link student-link">
                  ใส่รหัสเข้าห้องเรียน <ArrowRight size={18} className="arrow-animated" />
                </span>
              </div>
            </div>
            <div className="card-shine" aria-hidden="true" />
          </button>
        </div>

        {/* Value assurances */}
        <div className="role-assurance modern-role-assurance">
          <span><CheckCircle2 size={18} /> เข้าใช้งานได้ทันที ไม่ต้องกรอกรหัสผ่าน</span>
          <span><CheckCircle2 size={18} /> รองรับสมาร์ตโฟน แท็บเล็ต และคอมพิวเตอร์</span>
          <span><CheckCircle2 size={18} /> ซิงก์คะแนนและสถานะโต๊ะแบบเรียลไทม์</span>
        </div>
      </section>
    </main>
  );
}
