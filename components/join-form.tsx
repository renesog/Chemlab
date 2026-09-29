"use client";
import { PublicShell } from "@/components/public-shell";
import { RoomCodeInput } from "@/components/room-code-input";
import { StatusIndicator } from "@/components/status-indicator";
import { useDemo } from "@/lib/demo-store";
import { classifyRoomLookup, normalizeRoomCode, type RoomLookup } from "@/lib/room-entry";
import { ArrowRight, Check, DoorOpen, LoaderCircle, QrCode, RotateCcw, TriangleAlert } from "lucide-react";
import { type FormEvent, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type Lookup = RoomLookup | {kind:"idle"|"validating"};
export function JoinForm({initialCode=""}:{initialCode?:string}) {
  const router=useRouter();const store=useDemo();
  const [code,setCode]=useState(()=>normalizeRoomCode(initialCode));
  const [nickname,setNickname]=useState("");
  const [lookup,setLookup]=useState<{code:string;value:Lookup}>({code:"",value:{kind:"idle"}});
  const [retry,setRetry]=useState(0);
  const [phase,setPhase]=useState<"idle"|"joining"|"failed"|"success">("idle");
  const [localError,setLocalError]=useState("");
  const joining=useRef(false);
  const state=lookup.code===code?lookup.value:{kind:"idle" as const};
  const busy=phase==="joining"||phase==="success";
  const invalid=state.kind==="missing"||state.kind==="closed";

  useEffect(()=>{
    if(code.length!==6)return;
    const controller=new AbortController();let disposed=false;
    let timeout:ReturnType<typeof setTimeout>|undefined;
    const timer=setTimeout(()=>{
      setLookup({code,value:{kind:"validating"}});
      timeout=setTimeout(()=>controller.abort(),10000);
      void fetch(`/api/rooms/${encodeURIComponent(code)}`,{cache:"no-store",signal:controller.signal})
        .then(async response=>classifyRoomLookup(response.status,await response.json()))
        .then(value=>{if(!disposed)setLookup({code,value});})
        .catch(()=>{if(!disposed)setLookup({code,value:{kind:"connection"}});})
        .finally(()=>clearTimeout(timeout));
    },300);
    return()=>{disposed=true;clearTimeout(timer);clearTimeout(timeout);controller.abort();};
  },[code,retry]);

  async function submit(event:FormEvent<HTMLFormElement>) {
    event.preventDefault();if(joining.current||busy)return;
    const cleanNickname=nickname.trim();
    if(code.length!==6){setLocalError("กรุณาใส่รหัสห้องให้ครบ 6 ตัว");return;}
    if(cleanNickname.length<2){setLocalError("กรุณาใส่ชื่อเล่นอย่างน้อย 2 ตัวอักษร");return;}
    if(state.kind!=="found")return;
    joining.current=true;setPhase("joining");setLocalError("");
    try {
      const result=await store.join(code,cleanNickname);
      if(!result){setPhase("failed");return;}
      setPhase("success");router.push("/student/classroom");
    } catch {setLocalError("ไม่สามารถเชื่อมต่อได้ กรุณาลองใหม่อีกครั้ง");setPhase("failed");}
    finally {joining.current=false;}
  }
  function changeCode(value:string){setCode(value);setPhase("idle");setLocalError("");}
  const tone=state.kind==="found"?"success":invalid?"warning":state.kind==="connection"?"danger":"neutral";
  const lookupText=state.kind==="validating"?"กำลังตรวจสอบรหัสห้อง…":state.kind==="found"?`พบห้องเรียน: ${state.room.name}`:state.kind==="missing"?"ไม่พบห้องเรียนนี้ ตรวจสอบรหัสแล้วลองอีกครั้ง":state.kind==="closed"?"ห้องเรียนนี้จบกิจกรรมแล้ว ขอรหัสห้องใหม่จากคุณครู":state.kind==="connection"?"ไม่สามารถเชื่อมต่อได้ กรุณาลองใหม่อีกครั้ง":code.length?`ใส่รหัสแล้ว ${code.length} จาก 6 ตัว`:"รอรหัสห้องเรียนจากคุณครู";
  const error=localError||(phase==="failed"?(store.error||"เข้าห้องไม่สำเร็จ กรุณาลองใหม่อีกครั้ง"):"");

  return <PublicShell back="/"><div className="entry-flow entry-student">
    <aside className="entry-rail">
      <DoorOpen size={28} aria-hidden="true"/><p className="entry-kicker">สำหรับนักเรียน</p>
      <h1>ห้องทดลอง<br/>กำลังรอคุณอยู่</h1><p>ใช้รหัสจากคุณครูและชื่อเล่นของคุณ จากนั้นไปเลือกที่นั่งและรอเริ่มกิจกรรม</p>
      <ol className="entry-route"><li aria-current="step"><span>01</span>เข้าร่วมห้องเรียน</li><li><span>02</span>เลือกที่นั่ง</li><li><span>03</span>เริ่มทดลองพร้อมเพื่อน</li></ol>
      <div className="entry-qr-note"><QrCode aria-hidden="true"/><div><strong>มี QR Code จากคุณครู?</strong><p>สแกนด้วยกล้องโทรศัพท์ แล้วเปิดลิงก์ห้อง ระบบจะใส่รหัสให้โดยอัตโนมัติ</p></div></div>
    </aside>
    <section className="entry-form-area" aria-labelledby="join-title">
      <p className="entry-kicker">เข้าร่วมกิจกรรม</p><h2 id="join-title">เข้าร่วมห้องเรียน</h2><p className="entry-intro">ไม่ต้องสมัครบัญชี ใช้ชื่อเล่นสำหรับห้องนี้ได้เลย</p>
      {initialCode&&<p className="entry-link-note"><QrCode size={16} aria-hidden="true"/>ใส่รหัสจากลิงก์ห้องเรียนให้แล้ว</p>}
      <form className="entry-join-form" onSubmit={submit} noValidate aria-busy={busy}>
        <div className="entry-code-field"><label htmlFor="room-code">รหัสห้องเรียน</label><p id="room-code-help">ตัวอักษรภาษาอังกฤษหรือตัวเลข 6 ตัว · วางรหัสทั้งหมดได้</p>
          <RoomCodeInput value={code} onChange={changeCode} disabled={busy} invalid={invalid}/>
          <div id="room-lookup-state" className="entry-lookup-state" role="status" aria-live="polite"><StatusIndicator tone={tone}>{state.kind==="validating"?<LoaderCircle aria-hidden="true"/>:state.kind==="found"?<Check aria-hidden="true"/>:invalid||state.kind==="connection"?<TriangleAlert aria-hidden="true"/>:null}<span>{lookupText}</span></StatusIndicator></div>
          {state.kind==="connection"&&<button type="button" className="entry-text-action" disabled={busy} onClick={()=>setRetry(n=>n+1)}><RotateCcw size={16} aria-hidden="true"/>ตรวจสอบอีกครั้ง</button>}
        </div>
        <div className="entry-name-field"><label htmlFor="nickname">ชื่อที่ใช้ในห้องเรียน</label><input id="nickname" name="nickname" value={nickname} onChange={event=>{setNickname(event.target.value.slice(0,24));setLocalError("");if(phase==="failed")setPhase("idle");}} maxLength={24} autoComplete="nickname" placeholder="เช่น ต้นกล้า" required disabled={busy} aria-describedby={`nickname-help${error?" entry-join-error":""}`} aria-invalid={!!localError||undefined}/><p id="nickname-help">2–24 ตัวอักษร · คุณครูและเพื่อนจะเห็นชื่อนี้</p></div>
        {error&&<p className="error-box" id="entry-join-error" role="alert">{error}</p>}
        <button type="submit" className="primary-button entry-submit" disabled={busy||state.kind!=="found"||nickname.trim().length<2}>{phase==="success"?<><Check size={18} aria-hidden="true"/>เข้าห้องสำเร็จ กำลังไปเลือกที่นั่ง…</>:phase==="joining"?<><LoaderCircle size={18} aria-hidden="true"/>กำลังเข้าร่วมห้องเรียน…</>:<>เข้าร่วมห้องเรียน<ArrowRight size={18} aria-hidden="true"/></>}</button>
        <p className="sr-only" role="status">{phase==="joining"?"กำลังเข้าร่วมห้องเรียน":phase==="success"?"เข้าห้องสำเร็จ":""}</p>
      </form>
    </section>
  </div></PublicShell>;
}