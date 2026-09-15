"use client";

import { AppShell, StepIndicator } from "@/components/app-shell";
import { useDemo } from "@/lib/demo-store";
import { ArrowRight, DoorOpen, KeyRound, ShieldCheck, UserRound } from "lucide-react";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export function JoinForm({initialCode=""}:{initialCode?:string}){
  const router=useRouter();
  const {join}=useDemo();
  const [code,setCode]=useState(initialCode.toUpperCase().slice(0,6));
  const [nickname,setNickname]=useState("");
  const [error,setError]=useState("");

  function submit(e:FormEvent<HTMLFormElement>){
    e.preventDefault();
    const cleanCode=code.trim().toUpperCase();
    const cleanNickname=nickname.trim();
    if(!/^[A-Z0-9]{6}$/.test(cleanCode)){setError("รหัสห้องต้องมีตัวอักษรหรือตัวเลข 6 ตัว");return;}
    if(cleanNickname.length<2){setError("กรุณาใส่ชื่อเล่นอย่างน้อย 2 ตัวอักษร");return;}
    const result=join(cleanCode,cleanNickname);
    if(!result){setError("ไม่พบห้องนี้ หรือคุณครูปิดห้องแล้ว กรุณาตรวจรหัสอีกครั้ง");return;}
    router.push("/student/avatar");
  }

  return <AppShell title="เข้าร่วมห้อง"><main className="center-shell join-shell">
    <section className="join-workspace">
      <div className="join-context">
        <span className="section-icon cyan"><DoorOpen/></span>
        <p className="eyebrow">สำหรับนักเรียน</p>
        <h1>เข้าห้องเรียน</h1>
        <p>ใช้รหัสจากคุณครู แล้วสร้างตัวละครก่อนเลือกที่นั่ง</p>
        <StepIndicator current={1} items={["เข้าห้อง","สร้างตัวละคร","เลือกที่นั่ง"]}/>
        <div className="privacy-note"><ShieldCheck/><span><strong>ไม่ต้องสมัครบัญชี</strong><small>ใช้เพียงชื่อเล่นสำหรับห้องนี้</small></span></div>
      </div>
      <form className="join-form form-stack" onSubmit={submit} noValidate>
        <label htmlFor="room-code">รหัสห้อง <small>6 ตัว</small>
          <div className="input-wrap code-input"><KeyRound/><input id="room-code" name="code" value={code} onChange={e=>{setCode(e.target.value.replace(/[^a-z0-9]/gi,"").toUpperCase().slice(0,6));setError("")}} inputMode="text" maxLength={6} autoCapitalize="characters" autoCorrect="off" spellCheck={false} placeholder="CHEM82" autoFocus required/></div>
        </label>
        <label htmlFor="nickname">ชื่อเล่น
          <div className="input-wrap"><UserRound/><input id="nickname" name="nickname" value={nickname} onChange={e=>{setNickname(e.target.value.slice(0,24));setError("")}} maxLength={24} autoComplete="nickname" placeholder="เช่น ต้นกล้า" required/></div>
          <small className="field-hint">ชื่อนี้จะแสดงบนโต๊ะและหน้าจอคุณครู</small>
        </label>
        {error&&<p className="error-box" role="alert">{error}</p>}
        <button className="primary-button cyan-button" disabled={code.length!==6||nickname.trim().length<2}>เข้าร่วมห้อง <ArrowRight size={19}/></button>
        <p className="demo-hint">ทดลองได้ทันทีด้วยรหัส <button type="button" onClick={()=>setCode("CHEM82")}>CHEM82</button></p>
      </form>
    </section>
  </main></AppShell>
}

export default function Join(){return <JoinForm/>}
