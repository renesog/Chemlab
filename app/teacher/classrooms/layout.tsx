"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase/config";
import { LoadingState } from "@/components/app-shell";

export default function TeacherClassroomsLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.replace("/teacher/login");
      } else {
        setReady(true);
      }
    });
    return unsubscribe;
  }, [router]);

  if (!ready) return <LoadingState />;
  return children;
}
