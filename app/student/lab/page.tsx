"use client";

import { AppShell } from "@/components/app-shell";
import { ChallengeWorkbench, ToolIcon } from "@/components/challenge-workbench";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { useGameClock } from "@/components/game-start-countdown";
import { currentStudentFrom, useDemo } from "@/lib/demo-store";
import { gameIsLive } from "@/lib/live-game";
import { LEVELS } from "@/lib/levels";
import { LEGACY_LEVELS } from "@/lib/legacy-levels";
import { ArrowDown, ArrowRight, ArrowUp, CheckCircle2, CircleHelp, RotateCcw, Send, Trophy, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

export default function Lab(){
  const store=useDemo();
  const router=useRouter();
  const now=useGameClock();
  const {room,student}=currentStudentFrom(store);
  const catalog=room?.catalogVersion===2?LEVELS:LEGACY_LEVELS;
  const activeLevels=room?.activity.levelIds??catalog.map(item=>item.id);
  const [success,setSuccess]=useState<{levelId:number;score:number;explanation:string}|null>(null);
  const levelIndex=Math.max(0,activeLevels.indexOf(success?.levelId??student?.currentLevel??activeLevels[0]));
  const level=catalog.find(item=>item.id===activeLevels[levelIndex])??catalog[0];
  const [selected,setSelected]=useState<string[]>([]);
  const [feedback,setFeedback]=useState<{ok:boolean;text:string}|null>(null);
  const [busy,setBusy]=useState(false);
  const maxPoints=room?.activity.pointsByLevel[level.id]??5;
  const score=Math.max(1,maxPoints-(student?.attemptsByLevel?.[level.id]??0));
  const available=useMemo(()=>level.equipment.filter(e=>!selected.includes(e.id)),[level,selected]);
  const mistakes=student?.attemptsByLevel?.[level.id]??0;

  if(!room||!student)return <AppShell title="ห้องทดลอง"><main className="empty-state"><h1>กรุณาเข้าห้องก่อน</h1><button className="primary-button" onClick={()=>router.push("/join")}>ใส่รหัสห้อง</button></main></AppShell>;
  if(!gameIsLive(room,now)||!student.deskId)return <AppShell title="ห้องทดลอง"><main className="empty-state"><h1>กำลังรอคุณครูเริ่มเกม</h1><button className="primary-button" onClick={()=>router.push("/student/classroom")}>กลับไปห้องเรียน</button></main></AppShell>;

  function moveStep(index:number,direction:-1|1){
    const target=index+direction;
    if(target<0||target>=selected.length)return;
    setSelected(old=>{const next=[...old];[next[index],next[target]]=[next[target],next[index]];return next});
    setFeedback(null);
  }

  function addStep(id:string){if(!level.equipment.some(item=>item.id===id))return;setSelected(old=>old.includes(id)?old:[...old,id]);setFeedback(null)}
  function nextChallenge(){if(levelIndex===activeLevels.length-1){router.push("/student/results");return}setSelected([]);setFeedback(null);setSuccess(null)}

  async function submit(){
    if(!selected.length){setFeedback({ok:false,text:"เลือกขั้นตอนอย่างน้อย 1 ขั้นตอนก่อนส่งคำตอบ"});return;}
    setBusy(true);
    try{
      const data=await store.submitAttempt(level.id,selected);
      setFeedback({ok:data.correct,text:data.feedback});
      if(data.correct)setSuccess({levelId:level.id,score:data.score,explanation:data.explanation});
    }catch(error){setFeedback({ok:false,text:error instanceof Error?error.message:"เชื่อมต่อไม่ได้ ลองอีกครั้ง"})}
    finally{setBusy(false)}
  }

  return <AppShell title="ห้องทดลอง" back="/student/classroom"><main className="lab-shell">
    <header className="lab-header challenge-header">
      <div><p className="eyebrow">{room.activity.title} · ชาเลนจ์ {levelIndex+1}/{activeLevels.length}</p><h1>{level.title}</h1><p className="challenge-mixture">สารผสม: <strong>{level.mixture}</strong></p><p className="challenge-objective"><CircleHelp aria-hidden="true"/>{level.objective}</p></div>
      <div className="score-card"><Trophy/><span><small>คะแนนที่จะได้</small><strong>{score}<em>/{maxPoints}</em></strong><small>{mistakes?`ลองผิด ${mistakes} ครั้ง`:"ทำถูกครั้งแรกได้เต็ม"}</small></span></div>
    </header>
    <div className="level-progress" style={{gridTemplateColumns:`repeat(${activeLevels.length},1fr)`}} aria-label={`ความคืบหน้าด่าน ${levelIndex+1} จาก ${activeLevels.length}`}>
      {activeLevels.map((id,index)=><span key={id} className={index<levelIndex?"done":index===levelIndex?"current":""}><i>{index<levelIndex?"✓":index+1}</i><small>{index===levelIndex?"กำลังทำ":""}</small></span>)}
    </div>

    <ChallengeWorkbench level={level} selected={selected} onAdd={addStep}/>
    <div className="challenge-layout">
      <section className="panel equipment-panel">
        <div className="section-title"><div><h2>เลือกเครื่องมือและวิธีการ</h2><span>แตะเพื่อเพิ่มในแผน หรือใช้เมาส์ลากไปวางบนโต๊ะทดลอง</span></div></div>
        <div className="equipment-list challenge-tools">{available.map(e=><button key={e.id} draggable onDragStart={event=>event.dataTransfer.setData("text/plain",e.id)} onClick={()=>addStep(e.id)}><ToolIcon id={e.id}/><span>{e.label}</span><strong>เพิ่ม</strong></button>)}{!available.length&&<p className="mini-empty compact-empty">เลือกเครื่องมือครบแล้ว</p>}</div>
      </section>
      <section className="sequence-panel challenge-plan">
        <div className="section-title"><div><h2>แผนทดลองของฉัน</h2><span>{selected.length?`${selected.length} ขั้นตอน · ปรับลำดับด้วยลูกศรได้`:"เลือกเครื่องมือที่คิดว่าจะช่วยแยกสาร"}</span></div>{selected.length>0&&<button onClick={()=>{setSelected([]);setFeedback(null)}}><RotateCcw/>เริ่มวางแผนใหม่</button>}</div>
        {selected.length?<ol className="step-list">{selected.map((id,index)=>{const item=level.equipment.find(e=>e.id===id)!;return <li key={id}>
          <span className="step-number">{index+1}</span><strong>{item.label}</strong>
          <span className="reorder-actions"><button onClick={()=>moveStep(index,-1)} disabled={index===0} aria-label={`เลื่อน ${item.label} ขึ้น`}><ArrowUp/></button><button onClick={()=>moveStep(index,1)} disabled={index===selected.length-1} aria-label={`เลื่อน ${item.label} ลง`}><ArrowDown/></button><button className="remove-step" onClick={()=>{setSelected(s=>s.filter(x=>x!==id));setFeedback(null)}} aria-label={`ลบ ${item.label}`}><X/></button></span>
        </li>})}</ol>:<div className="sequence-empty"><CircleHelp/><strong>ยังไม่มีขั้นตอน</strong><span>เลือกเครื่องมือจากรายการเพื่อเริ่มชาเลนจ์</span></div>}
        {feedback&&!feedback.ok&&<div className="feedback error" role="status"><CircleHelp/><span><strong>ยังไม่สำเร็จ ลองปรับแผน</strong>{feedback.text}</span></div>}
        <div className="submit-zone"><span>ตอบผิดลดคะแนนที่จะได้ครั้งละ 1 · ต่ำสุด 1</span><button className="primary-button submit-answer" onClick={submit} disabled={busy||!!success||selected.length===0}>{busy?"กำลังทดลอง…":<><Send/>ทดลองแยกสาร</>}</button></div>
      </section>
    </div>
    {success&&<Dialog open onOpenChange={()=>{}}><DialogContent className="challenge-success" showCloseButton={false}><div className="challenge-success-icon"><CheckCircle2 size={46}/></div><p className="eyebrow">ชาเลนจ์ {levelIndex+1} สำเร็จ</p><DialogTitle id="challenge-success-title">แยกสารได้แล้ว!</DialogTitle><strong className="challenge-earned">+{success.score} คะแนน</strong><DialogDescription>{success.explanation}</DialogDescription><div className="separated-materials"><span>สารที่แยกได้</span><div>{level.mixture.split(/\s*\+\s*/).map((name,index)=><strong key={`${index}-${name}`}>{name.trim()}</strong>)}</div></div><button className="primary-button" onClick={nextChallenge}>{levelIndex===activeLevels.length-1?"ดูสรุปผล":"ไปชาเลนจ์ถัดไป"}<ArrowRight/></button></DialogContent></Dialog>}
  </main></AppShell>
}
