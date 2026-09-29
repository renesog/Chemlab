import type { Metadata } from "next";
import "./globals.css";
import "./challenge.css";
import "./virtual-lab.css";
import "./teacher-account.css";
import "./question-builder.css";
import "./foundation.css";
import { DemoProvider } from "@/lib/demo-store";

export const metadata: Metadata = {
  title: "ChemClass Lab | ห้องเรียนวิทยาศาสตร์เสมือน",
  description: "จัดห้องเรียนและเรียนรู้การแยกสารผ่านเกมทดลองแบบโต้ตอบ",
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="th"><body><DemoProvider>{children}</DemoProvider></body></html>;
}
