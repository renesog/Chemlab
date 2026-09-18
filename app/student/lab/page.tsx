"use client";

import { AppShell } from "@/components/app-shell";
import { ChallengeWorkbench, ToolIcon } from "@/components/challenge-workbench";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useGameClock } from "@/components/game-start-countdown";
import { currentStudentFrom, useDemo } from "@/lib/demo-store";
import { finishedLevels, gameIsLive } from "@/lib/live-game";
import { LEVELS } from "@/lib/levels";
import { LEGACY_LEVELS } from "@/lib/legacy-levels";
import { ArrowRight, CheckCircle2, CircleHelp, Lightbulb, RotateCcw, Send, SkipForward, Trophy, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";

export default function Lab(){
  const store=useDemo();
  const router=useRouter();
  const {room,student}=currentStudentFrom(store);
  const now=useGameClock(room);
  const catalog=room?.activity.mode==="QUESTIONS"?room.activity.customQuestions?.map(question=>({id:question.id,title:question.title,mixture:question.mixture,objective:question.objective,difficulty:1,equipment:question.equipment}))??[]:room?.catalogVersion===2?LEVELS:LEGACY_LEVELS;
  const activeLevels=room?.activity.levelIds??catalog.map(item=>item.id);
  const [success,setSuccess]=useState<{levelId:number;score:number;explanation:string}|null>(null);
  const levelIndex=Math.max(0,activeLevels.indexOf(success?.levelId??student?.currentLevel??activeLevels[0]));
  const level=catalog.find(item=>item.id===activeLevels[levelIndex])??catalog[0]??LEVELS[0];
  const [selected,setSelected]=useState<string[]>([]);
  const [feedback,setFeedback]=useState<{ok:boolean;text:string}|null>(null);
  const [hint,setHint]=useState("");
  const [busy,setBusy]=useState(false);
  const [pendingAction,setPendingAction]=useState<"submit"|"skip"|null>(null);
  const customQuestion=room?.activity.mode==="QUESTIONS"?room.activity.customQuestions?.find(question=>question.id===level.id):undefined;
  const maxPoints=customQuestion?.maxPoints??room?.activity.pointsByLevel[level.id]??5;
  const available=useMemo(()=>level.equipment.filter(e=>!selected.includes(e.id)),[level,selected]);
  const mistakes=student?.attemptsByLevel?.[level.id]??0;
  const score=customQuestion?Math.max(1,Math.min(maxPoints,customQuestion.correctPoints)-mistakes*customQuestion.wrongPenalty):Math.max(1,maxPoints-mistakes);

  if(!room||!student)return <AppShell title="ห้องทดลอง"><main className="empty-state"><h1>กรุณาเข้าห้องก่อน</h1><button className="primary-button" onClick={()=>router.push("/join")}>ใส่รหัสห้อง</button></main></AppShell>;
  if(finishedLevels(student,activeLevels)&&!success)return <AppShell title="ห้องทดลอง"><main className="empty-state"><h1>ทำกิจกรรมครบแล้ว</h1><p>ดูคะแนน ข้อที่ผ่าน และข้อที่ข้ามได้ในหน้าสรุปผล</p><button className="primary-button" onClick={()=>router.push("/student/results")}>ดูสรุปผล</button></main></AppShell>;
  if(!gameIsLive(room,now)||!student.deskId)return <AppShell title="ห้องทดลอง"><main className="empty-state"><h1>กำลังรอคุณครูเริ่มเกม</h1><button className="primary-button" onClick={()=>router.push("/student/classroom")}>กลับไปห้องเรียน</button></main></AppShell>;

  function addStep(id:string){if(!level.equipment.some(item=>item.id===id))return;setSelected(old=>old.includes(id)?old:[...old,id]);setFeedback(null)}
  function removeStep(id:string){setSelected(s=>s.filter(x=>x!==id));setFeedback(null)}

  function reorderStep(from:number,to:number){
    setSelected(old=>{
      const next=[...old];
      const [item]=next.splice(from,1);
      next.splice(to,0,item);
      return next;
    });
    setFeedback(null);
  }

  function nextChallenge(){if(levelIndex===activeLevels.length-1){router.push("/student/results");return}setSelected([]);setFeedback(null);setHint("");setSuccess(null)}

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
  async function skip(){
    setBusy(true);setFeedback(null);
    try{await store.skipLevel(level.id);setSelected([]);setHint("");if(levelIndex===activeLevels.length-1)router.push("/student/results")}
    catch(error){setFeedback({ok:false,text:error instanceof Error?error.message:"ข้ามข้อไม่ได้ กรุณาลองอีกครั้ง"})}
    finally{setBusy(false)}
  }

  return <AppShell title="ห้องทดลอง" back="/student/classroom"><main className="lab-shell">
    {/* ── Header ── */}
    <header className="lab-header challenge-header">
      <div><p className="eyebrow">{room.activity.title} · ชาเลนจ์ {levelIndex+1}/{activeLevels.length}</p><h1>{level.title}</h1><p className="challenge-mixture">สารผสม: <strong>{level.mixture}</strong></p><p className="challenge-objective"><CircleHelp aria-hidden="true"/>{level.objective}</p></div>
      <div className="score-card"><Trophy/><span><small>คะแนนที่จะได้</small><strong>{score}<em>/{maxPoints}</em></strong><small>{mistakes?`ลองผิด ${mistakes} ครั้ง`:"ทำถูกครั้งแรกได้เต็ม"}</small></span></div>
    </header>

    {/* ── Level progress ── */}
    <div className="level-progress" style={{gridTemplateColumns:`repeat(${activeLevels.length},1fr)`}} aria-label={`ความคืบหน้าด่าน ${levelIndex+1} จาก ${activeLevels.length}`}>
      {activeLevels.map((id,index)=><span key={id} className={student.skipped?.includes(id)?"skipped":student.completed.includes(id)?"done":index===levelIndex?"current":""}><i>{student.skipped?.includes(id)?"–":student.completed.includes(id)?"✓":index+1}</i><small>{student.skipped?.includes(id)?"ข้าม":index===levelIndex?"กำลังทำ":""}</small></span>)}
    </div>

    {/* ── Lab Bench (โต๊ะทดลอง) ── */}
    <ChallengeWorkbench
      level={level}
      selected={selected}
      onAdd={addStep}
      onRemove={removeStep}
      onReorder={reorderStep}
    />

    {/* ── Equipment Shelf (ชั้นวางอุปกรณ์) ── */}
    <section className="equipment-shelf">
      <div className="shelf-header">
        <div>
          <h2>ชั้นวางอุปกรณ์</h2>
          <span>แตะเพื่อเพิ่ม หรือลากไปวางบนโต๊ะทดลอง</span>
        </div>
        {selected.length>0&&<button className="shelf-reset" onClick={()=>{setSelected([]);setFeedback(null)}}><RotateCcw size={16}/>เริ่มใหม่</button>}
      </div>
      <div className="shelf-grid">
        {available.map(e=>(
          <button
            key={e.id}
            className="shelf-item"
            draggable
            onDragStart={event=>{event.dataTransfer.setData("equipment-id",e.id);event.dataTransfer.effectAllowed="copy"}}
            onClick={()=>addStep(e.id)}
          >
            <ToolIcon id={e.id}/>
            <span>{e.label}</span>
          </button>
        ))}
        {!available.length&&<p className="shelf-empty">เลือกอุปกรณ์ครบแล้ว — ตรวจลำดับแล้วส่งคำตอบได้เลย</p>}
      </div>
    </section>

    {/* ── Feedback ── */}
    {feedback&&!feedback.ok&&<div className="feedback error" role="status"><CircleHelp/><span><strong>ยังไม่สำเร็จ ลองปรับแผน</strong>{feedback.text}</span></div>}

    {/* ── Hint ── */}
    {room.activity.hintsEnabled&&<div className="challenge-hint"><button onClick={async()=>{try{setHint(await store.getHint(level.id))}catch(error){setHint(error instanceof Error?error.message:"เปิดคำใบ้ไม่ได้")}}}><Lightbulb/>ขอคำใบ้</button>{hint&&<p role="status">{hint}</p>}</div>}

    {/* ── Action Bar ── */}
    <div className="lab-action-bar">
      <span className="action-bar-note">ตอบผิดลดคะแนนที่จะได้ครั้งละ {customQuestion?.wrongPenalty??1} · ต่ำสุด 1</span>
      <div className="action-bar-buttons">
        {mistakes>0&&<button className="secondary-button lab-skip" onClick={()=>setPendingAction("skip")} disabled={busy||!!success}><SkipForward size={18}/>ข้ามข้อนี้</button>}
        <button className="primary-button submit-answer" onClick={()=>setPendingAction("submit")} disabled={busy||!!success||selected.length===0}>{busy?"กำลังทดลอง…":<><Send size={18}/>ทดลองแยกสาร</>}</button>
      </div>
    </div>

    {/* ── Success Dialog ── */}
    {success&&<Dialog open onOpenChange={()=>{}}><DialogContent className="challenge-success" showCloseButton={false}><div className="challenge-success-icon"><CheckCircle2 size={46}/></div><p className="eyebrow">ชาเลนจ์ {levelIndex+1} สำเร็จ</p><DialogTitle id="challenge-success-title">แยกสารได้แล้ว!</DialogTitle><strong className="challenge-earned">+{success.score} คะแนน</strong><DialogDescription>{success.explanation}</DialogDescription><div className="separated-materials"><span>สารที่แยกได้</span><div>{level.mixture.split(/\s*\+\s*/).map((name,index)=><strong key={`${index}-${name}`}>{name.trim()}</strong>)}</div></div><button className="primary-button" onClick={nextChallenge}>{levelIndex===activeLevels.length-1?"ดูสรุปผล":"ไปชาเลนจ์ถัดไป"}<ArrowRight/></button></DialogContent></Dialog>}

    {/* ── Confirm Dialog ── */}
    <AlertDialog open={!!pendingAction} onOpenChange={open=>{if(!open)setPendingAction(null)}}><AlertDialogContent className="lab-confirm-dialog"><AlertDialogTitle>{pendingAction==="skip"?`ข้ามชาเลนจ์ ${levelIndex+1}?`:`ส่งแผนทดลองชาเลนจ์ ${levelIndex+1}?`}</AlertDialogTitle><AlertDialogDescription>{pendingAction==="skip"?"ข้อนี้จะได้ 0 คะแนน และกลับมาทำใหม่ไม่ได้หลังยืนยัน":"ตรวจลำดับอุปกรณ์อีกครั้ง หากยังไม่ถูกต้อง คะแนนที่จะได้ในข้อนี้จะลดลง"}</AlertDialogDescription><AlertDialogFooter><AlertDialogCancel>กลับไปแก้ไข</AlertDialogCancel><button className={pendingAction==="skip"?"lab-confirm-skip":"primary-button"} onClick={()=>{const action=pendingAction;setPendingAction(null);if(action==="skip")void skip();else if(action==="submit")void submit()}}>{pendingAction==="skip"?"ยืนยันข้ามข้อ":"ยืนยันส่งคำตอบ"}</button></AlertDialogFooter></AlertDialogContent></AlertDialog>
  </main></AppShell>
}
