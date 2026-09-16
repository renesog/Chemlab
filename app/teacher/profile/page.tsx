"use client";

import { AppShell, LoadingState } from "@/components/app-shell";
import { TeacherProfileForm } from "@/components/teacher-profile-form";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase/config";
import { useDemo } from "@/lib/demo-store";

export default function TeacherProfilePage() {
  const router = useRouter();
  const store = useDemo();
  const [email, setEmail] = useState("");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.replace("/teacher/login");
      } else {
        setEmail(user.email ?? "");
        setReady(true);
      }
    });
    return unsubscribe;
  }, [router]);

  if (!ready || !store.ready) return <AppShell title="โปรไฟล์ครู" back="/teacher/dashboard"><LoadingState /></AppShell>;

  return (
    <AppShell title="โปรไฟล์ครู" back="/teacher/dashboard">
      <main className="center-shell">
        <section className="form-card teacher-account-card">
          <p className="eyebrow">บัญชีครู</p>
          <h1>แก้ไขโปรไฟล์</h1>
          <TeacherProfileForm initial={store.profile ?? undefined} email={email} submitLabel="บันทึกโปรไฟล์" />
        </section>
      </main>
    </AppShell>
  );
}
