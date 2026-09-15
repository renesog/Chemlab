"use client";

import { FlaskConical, Home, LogOut, Wifi } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

export function AppShell({children,title,back}:{children:React.ReactNode;title:string;back?:string}) {
  const router=useRouter(); const path=usePathname();
  return <div className="app-page">
    <header className="app-header">
      <button className="brand-button" onClick={()=>router.push(back??"/")} aria-label="กลับหน้าหลัก"><span className="brand-mark"><FlaskConical size={22}/></span><span><strong>ChemClass Lab</strong><small>{title}</small></span></button>
      <div className="header-status"><Wifi size={16}/><span>ออนไลน์</span><span className="demo-pill">โหมดทดลอง</span></div>
    </header>
    {children}
    <nav className="mobile-nav" aria-label="เมนูหลัก"><button onClick={()=>router.push("/")}><Home size={19}/>หน้าหลัก</button><button onClick={()=>router.push(path.startsWith("/teacher")?"/teacher/dashboard":"/join")}><LogOut size={19}/>ออก</button></nav>
  </div>;
}

export function LoadingState(){return <div className="loading-state" role="status"><span className="spinner"/>กำลังโหลดข้อมูลห้องเรียน…</div>}
