"use client";

import { AppShell, LoadingState } from "@/components/app-shell";
import { TeacherProfileForm } from "@/components/teacher-profile-form";
import { useRouter } from "next/navigation";
import { useDemo } from "@/lib/demo-store";

export default function TeacherProfilePage() {
  const router = useRouter();
  const store = useDemo();

  if (!store.ready) return <AppShell title="โปรไฟล์ครู" back="/teacher/dashboard"><LoadingState /></AppShell>;

  return (
    <AppShell title="โปรไฟล์ครู" back="/teacher/dashboard">
      <main className="center-shell">
        <section className="form-card teacher-account-card">
          <p className="eyebrow">บัญชีครู</p>
          <h1>แก้ไขโปรไฟล์</h1>
          <TeacherProfileForm initial={store.profile ?? undefined} submitLabel="บันทึกโปรไฟล์" />
        </section>
      </main>
    </AppShell>
  );
}
