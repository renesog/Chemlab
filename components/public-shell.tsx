"use client";
import Link from "next/link";
import { ArrowLeft, FlaskConical, Wifi, WifiOff } from "lucide-react";
import { useEffect, useState } from "react";
import { StatusIndicator } from "@/components/status-indicator";

export function PublicShell({ children, back }: { children: React.ReactNode; back?: string }) {
  const [online,setOnline]=useState(true);
  useEffect(()=>{
    const update=()=>setOnline(navigator.onLine);update();
    window.addEventListener("online",update);window.addEventListener("offline",update);
    return()=>{window.removeEventListener("online",update);window.removeEventListener("offline",update);};
  },[]);
  return <div className="entry-page">
    <a className="entry-skip" href="#entry-content">ข้ามไปยังเนื้อหา</a>
    <header className="entry-header">
      <div className="entry-header-leading">{back&&<Link href={back} className="entry-back" aria-label="กลับไปเลือกบทบาท"><ArrowLeft size={18}/></Link>}
      <Link href="/" className="entry-brand"><FlaskConical aria-hidden="true" size={22}/><span>ChemClass <b>Lab</b></span></Link></div>
      <StatusIndicator tone={online?"neutral":"warning"} role="status">{online?<Wifi aria-hidden="true"/>:<WifiOff aria-hidden="true"/>}<span>{online?"ออนไลน์":"ออฟไลน์"}</span></StatusIndicator>
    </header>
    <main id="entry-content" tabIndex={-1} className="entry-main">{children}</main>
    <footer className="entry-footer"><span>สังเกต · วางแผน · ทดลอง</span><span>ห้องเรียนการแยกสาร</span></footer>
  </div>;
}
