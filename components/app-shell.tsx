"use client";

import { ArrowLeft, FlaskConical, Home, LogOut, Wifi } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

export function AppShell({children,title,back}:{children:React.ReactNode;title:string;back?:string}) {
  const router=useRouter(); const path=usePathname();
  return <div className="app-page">
    <a className="skip-link" href="#main-content">ข้ามไปยังเนื้อหาหลัก</a>
    <header className="app-header">
      <div className="header-leading">
        {back&&<button className="back-button" onClick={()=>router.push(back)} aria-label="ย้อนกลับ"><ArrowLeft size={20}/></button>}
        <button className="brand-button" onClick={()=>router.push("/")} aria-label="กลับหน้าหลัก"><span className="brand-mark"><FlaskConical size={22}/></span><span><strong>ChemClass Lab</strong><small>{title}</small></span></button>
      </div>
      <div className="header-status"><Wifi size={16}/><span>ออนไลน์</span><span className="demo-pill">โหมดทดลอง</span></div>
    </header>
    <div id="main-content">{children}</div>
    <nav className="mobile-nav" aria-label="เมนูหลัก"><button onClick={()=>router.push("/")}><Home size={19}/>หน้าหลัก</button><button onClick={()=>router.push(path.startsWith("/teacher")?"/teacher/dashboard":"/join")}><LogOut size={19}/>ออก</button></nav>
  </div>;
}

export function LoadingState(){return <div className="loading-state" role="status"><span className="spinner"/>กำลังโหลดข้อมูลห้องเรียน…</div>}

export function StepIndicator({current,items}:{current:number;items:string[]}){return <ol className="step-indicator" aria-label="ขั้นตอนการเข้าห้อง">{items.map((item,index)=><li key={item} className={index+1<current?"done":index+1===current?"current":""}><span>{index+1<current?"✓":index+1}</span><strong>{item}</strong></li>)}</ol>}
