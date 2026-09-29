"use client";
import { ArrowLeft, Check, DoorOpen, FlaskConical, Home, LayoutDashboard, Wifi, WifiOff } from "lucide-react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { StatusIndicator } from "@/components/status-indicator";
import { NavigationLink } from "@/components/navigation-link";

export function AppShell({ children, title, back, compact = false }: {
  children: React.ReactNode; title: string; back?: string; compact?: boolean;
}) {
  const path = usePathname();
  const [online, setOnline] = useState(true);
  useEffect(() => {
    const update = () => setOnline(navigator.onLine);
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => { window.removeEventListener("online", update); window.removeEventListener("offline", update); };
  }, []);
  const teacher = path.startsWith("/teacher");
  const destination = teacher ? "/teacher/dashboard" : "/join";
  return <div className={`app-page shell${compact ? " classroom-app" : ""}`}>
    <a className="skip-link" href="#main-content">ข้ามไปยังเนื้อหาหลัก</a>
    <header className="shell-header">
      <div className="shell-leading">
        {back && <Link className="shell-back" href={back} aria-label="ย้อนกลับ"><ArrowLeft size={18}/></Link>}
        <Link className="shell-brand" href="/" aria-label="ChemClass Lab · กลับหน้าหลัก">
          <FlaskConical aria-hidden="true"/><span><strong>ChemClass Lab</strong><small>{title}</small></span>
        </Link>
      </div>
      <div className="shell-tools">
        <nav className="shell-nav" aria-label="เมนูหลัก">
          <NavigationLink href="/" active={path === "/"}><Home aria-hidden="true"/><span>หน้าหลัก</span></NavigationLink>
          <NavigationLink href={destination} active={path === destination}>
            {teacher ? <LayoutDashboard aria-hidden="true"/> : <DoorOpen aria-hidden="true"/>}
            <span>{teacher ? "แดชบอร์ด" : "เข้าห้องใหม่"}</span>
          </NavigationLink>
        </nav>
        <StatusIndicator tone={online ? "success" : "warning"} role="status" aria-label={online ? "เครือข่ายออนไลน์" : "ออฟไลน์ รอการเชื่อมต่อ"}>
          {online ? <Wifi aria-hidden="true"/> : <WifiOff aria-hidden="true"/>}
          <span className="shell-connection-label">{online ? "ออนไลน์" : "ออฟไลน์"}</span>
        </StatusIndicator>
      </div>
    </header>
    <div id="main-content" className="shell-content" tabIndex={-1}>{children}</div>
  </div>;
}
export function LoadingState() {
  return <div className="loading-state" role="status"><span className="spinner" aria-hidden="true"/><strong>กำลังโหลดข้อมูลห้องเรียน…</strong><small>ระบบกำลังซิงก์ข้อมูลเรียลไทม์</small></div>;
}
export function StepIndicator({ current, items }: { current: number; items: string[] }) {
  return <ol className="flow-steps" aria-label="ขั้นตอนการเข้าห้อง">{items.map((item,index)=><li key={item} className={index+1<current?"done":index+1===current?"current":""} aria-current={index+1===current?"step":undefined}>
    <span aria-hidden="true">{index+1<current?<Check size={14}/>:index+1}</span><strong>{item}</strong>{index+1<current&&<small className="sr-only">เสร็จแล้ว</small>}
  </li>)}</ol>;
}