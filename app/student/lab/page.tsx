"use client";

import { AppShell } from "@/components/app-shell";
import { currentStudentFrom, useDemo } from "@/lib/demo-store";
import { LEVELS } from "@/lib/levels";
import { ArrowDown, ArrowUp, CheckCircle2, CircleHelp, FlaskConical, RotateCcw, Send, Trophy, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

export default function Lab(){
  const store=useDemo();
  const router=useRouter();
  const {room,student}=currentStudentFrom(store);
  const activeLevels=room?.activity.levelIds??LEVELS.map(item=>item.id);
  const levelIndex=Math.max(0,activeLevels.indexOf(student?.currentLevel??activeLevels[0]));
  const level=LEVELS.find(item=>item.id===activeLevels[levelIndex])??LEVELS[0];
  const [selected,setSelected]=useState<string[]>([]);
  const [attempts,setAttempts]=useState(0);
  const [feedback,setFeedback]=useState<{ok:boolean;text:string}|null>(null);
  const [busy,setBusy]=useState(false);
  const maxPoints=room?.activity.pointsByLevel[level.id]??5;
  const score=Math.max(1,maxPoints-attempts);
  const available=useMemo(()=>level.equipment.filter(e=>!selected.includes(e.id)),[level,selected]);

  if(!room||!student)return <AppShell title="ห้องทดลอง"><main className="empty-state"><h1>กรุณาเข้าห้องก่อน</h1><button className="primary-button" onClick={()=>router.push("/join")}>ใส่รหัสห้อง</button></main></AppShell>;

  function moveStep(index:number,direction:-1|1){
    const target=index+direction;
    if(target<0||target>=selected.length)return;
    setSelected(old=>{const next=[...old];[next[index],next[target]]=[next[target],next[index]];return next});
    setFeedback(null);
  }

  async function submit(){
    if(!selected.length){setFeedback({ok:false,text:"เลือกขั้นตอนอย่างน้อย 1 ขั้นตอนก่อนส่งคำตอบ"});return;}
    setBusy(true);
    try{
      const res=await fetch("/api/attempt",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({levelId:level.id,steps:selected,previousAttempts:attempts,maxPoints})});
      const data=await res.json();
      if(!res.ok)throw new Error(data.error);
      setFeedback({ok:data.correct,text:data.feedback});
      if(data.correct){
        setTimeout(()=>{
          store.recordAttempt(level.id,true,data.score);
          if(levelIndex===activeLevels.length-1)router.push("/student/results");
          else{setSelected([]);setAttempts(0);setFeedback(null)}
        },800);
      }else{
        setAttempts(value=>value+1);
        store.recordAttempt(level.id,false,data.score);
      }
    }catch(error){setFeedback({ok:false,text:error instanceof Error?error.message:"เชื่อมต่อไม่ได้ ลองอีกครั้ง"})}
    finally{setBusy(false)}
  }

  return <AppShell title="ห้องทดลอง" back="/student/classroom"><main className="lab-shell">
    <header className="lab-header">
      <div><p className="eyebrow">{room.activity.title} · ด่าน {levelIndex+1} จาก {activeLevels.length}</p><h1>{level.mixture}</h1><p>{level.objective}</p></div>
      <div className="score-card"><Trophy/><span><small>คะแนนด่านนี้</small><strong>{score}<em>/{maxPoints}</em></strong></span></div>
    </header>
    <div className="level-progress" style={{gridTemplateColumns:`repeat(${activeLevels.length},1fr)`}} aria-label={`ความคืบหน้าด่าน ${levelIndex+1} จาก ${activeLevels.length}`}>
      {activeLevels.map((id,index)=><span key={id} className={index<levelIndex?"done":index===levelIndex?"current":""}><i>{index<levelIndex?"✓":index+1}</i><small>{index===levelIndex?"กำลังทำ":""}</small></span>)}
    </div>

    <div className="lab-grid">
      <section className="panel equipment-panel">
        <div className="section-title"><div><h2>1. เลือกอุปกรณ์</h2><span>แตะตามลำดับที่ต้องใช้</span></div></div>
        <div className="equipment-list">{available.map(e=><button key={e.id} onClick={()=>{setSelected(s=>[...s,e.id]);setFeedback(null)}}><FlaskConical/><span>{e.label}</span><strong>+ เพิ่ม</strong></button>)}{!available.length&&<p className="mini-empty compact-empty">เพิ่มอุปกรณ์ครบแล้ว</p>}</div>
      </section>

      <section className="experiment-zone">
        <div className="experiment-visual"><FlaskConical size={58}/><span>{level.title}</span><small>เป้าหมาย: {level.objective}</small></div>
        <div className="sequence-panel">
          <div className="section-title"><div><h2>2. ตรวจลำดับขั้นตอน</h2><span>{selected.length?`${selected.length} ขั้นตอน — ใช้ลูกศรเพื่อสลับลำดับ`:"ยังไม่ได้เลือกขั้นตอน"}</span></div>{selected.length>0&&<button onClick={()=>{setSelected([]);setFeedback(null)}}><RotateCcw/>ล้างทั้งหมด</button>}</div>
          {selected.length?<ol className="step-list">{selected.map((id,index)=>{const item=level.equipment.find(e=>e.id===id)!;return <li key={id}>
            <span className="step-number">{index+1}</span><strong>{item.label}</strong>
            <span className="reorder-actions"><button onClick={()=>moveStep(index,-1)} disabled={index===0} aria-label={`เลื่อน ${item.label} ขึ้น`}><ArrowUp/></button><button onClick={()=>moveStep(index,1)} disabled={index===selected.length-1} aria-label={`เลื่อน ${item.label} ลง`}><ArrowDown/></button><button className="remove-step" onClick={()=>{setSelected(s=>s.filter(x=>x!==id));setFeedback(null)}} aria-label={`ลบ ${item.label}`}><X/></button></span>
          </li>})}</ol>:<div className="sequence-empty"><CircleHelp/><strong>เริ่มจากเลือกอุปกรณ์ด้านซ้าย</strong><span>ขั้นตอนที่เลือกจะมาเรียงตรงนี้</span></div>}
          {feedback&&<div className={feedback.ok?"feedback success":"feedback error"} role="status">{feedback.ok?<CheckCircle2/>:<CircleHelp/>}<span><strong>{feedback.ok?"ทำสำเร็จ":"ลองคิดอีกครั้ง"}</strong>{feedback.text}</span></div>}
          <div className="submit-zone"><span>ส่งผิดหักครั้งละ 1 คะแนน ต่ำสุด 1 คะแนน</span><button className="primary-button submit-answer" onClick={submit} disabled={busy||!!feedback?.ok||selected.length===0}>{busy?"กำลังตรวจ…":<><Send/>ยืนยันลำดับ</>}</button></div>
        </div>
      </section>
    </div>
  </main></AppShell>
}
