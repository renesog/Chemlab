"use client";

import { AppShell, LoadingState } from "@/components/app-shell";
import { TeacherProfileForm } from "@/components/teacher-profile-form";
import { useDemo } from "@/lib/demo-store";
import { GraduationCap } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function TeacherLogin() {
  const store = useDemo();
  const router = useRouter();

  useEffect(() => {
    if (store.ready && store.profile) {
      router.replace("/teacher/dashboard");
    }
  }, [store.ready, store.profile, router]);

  if (!store.ready) {
    return (
      <AppShell title="สำหรับครู">
        <LoadingState />
      </AppShell>
    );
  }

  return (
    <AppShell title="สำหรับครู">
      <main className="center-shell">
        <section className="form-card teacher-account-card">
          <div className="section-icon">
            <GraduationCap size={30} />
          </div>
          <p className="eyebrow">พื้นที่สำหรับครูผู้สอน</p>
          <h1>เริ่มต้นใช้งานห้องเรียน</h1>
          <p className="muted">
            ตั้งชื่อเล่นและเลือกไอคอนของคุณครูเพื่อเริ่มสร้างห้องเรียน จัดโต๊ะ และติดตามผลการทดลองของนักเรียน (เข้าใช้งานได้ทันที ไม่ต้องใช้รหัสผ่าน)
          </p>
          <TeacherProfileForm submitLabel="เข้าสู่ห้องเรียน / แดชบอร์ด" />
        </section>
      </main>
    </AppShell>
  );
}
