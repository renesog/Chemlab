"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDemo } from "@/lib/demo-store";
import { LoadingState } from "@/components/app-shell";

export default function TeacherClassroomsLayout({ children }: { children: React.ReactNode }) {
  const store = useDemo();
  const router = useRouter();

  useEffect(() => {
    if (store.ready && !store.profile) {
      router.replace("/teacher/login");
    }
  }, [store.ready, store.profile, router]);

  if (!store.ready) return <LoadingState />;
  return children;
}
