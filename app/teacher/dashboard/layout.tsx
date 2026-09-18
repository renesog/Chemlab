"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDemo } from "@/lib/demo-store";
import { LoadingState } from "@/components/app-shell";

export default function TeacherDashboardLayout({ children }: { children: React.ReactNode }) {
  const store = useDemo();
  const router = useRouter();

  useEffect(() => {
    if (!store.ready) return;
    const saved = typeof window !== "undefined" ? localStorage.getItem("chemclass-teacher-profile") : null;
    if (!store.profile && !saved) {
      router.replace("/teacher/login");
    }
  }, [store.ready, store.profile, router]);

  if (!store.ready) return <LoadingState />;
  return children;
}
