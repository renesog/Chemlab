"use client";

import { AppShell } from "@/components/app-shell";
import { ChallengeWorkbench } from "@/components/challenge-workbench";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useGameClock } from "@/components/game-start-countdown";
import { currentStudentFrom, useDemo } from "@/lib/demo-store";
import { labPhase, draftKey } from "@/lib/lab-session";
import { useLabDraft } from "@/components/use-lab-draft";
import { LEVELS } from "@/lib/levels";
import { LEGACY_LEVELS } from "@/lib/legacy-levels";
import { ArrowRight, CheckCircle2, CircleHelp, Lightbulb, Send, SkipForward, Trophy } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

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
  const {selected,setSelected,clear:clearDraft,draftReady,warning}=useLabDraft(draftKey(room?.id??"",student?.id??"",level.id),level.equipment.map(item=>item.id));
  const [feedback,setFeedback]=useState<{ok:boolean;text:string}|null>(null);
  const [hint,setHint]=useState("");
  const [busy,setBusy]=useState(false);
  const [pendingAction,setPendingAction]=useState<"submit"|"skip"|"reset"|null>(null);
  const customQuestion=room?.activity.mode==="QUESTIONS"?room.activity.customQuestions?.find(question=>question.id===level.id):undefined;
  const maxPoints=customQuestion?.maxPoints??room?.activity.pointsByLevel[level.id]??5;
  const mistakes=student?.attemptsByLevel?.[level.id]??0;
  const score=customQuestion?Math.max(1,Math.min(maxPoints,customQuestion.correctPoints)-mistakes*customQuestion.wrongPenalty):Math.max(1,maxPoints-mistakes);

  const beginLevel=store.beginLevel;
  const shouldStartClock=store.ready&&!!room&&!!student&&labPhase(room,student,now)==="playing"&&!success&&!busy;
  useEffect(()=>{
    if(!shouldStartClock)return;
    const start=()=>{void beginLevel(level.id).catch(()=>{});};
    start();window.addEventListener("online",start);
    return()=>window.removeEventListener("online",start);
  },[beginLevel,level.id,shouldStartClock]);

  if(!store.ready)return <AppShell title="ห้องทดลอง"><main className="empty-state" role="status">กำลังโหลดเกมที่บันทึกไว้…</main></AppShell>;
  if((!room||!student)&&store.currentStudent&&store.error)return <AppShell title="ห้องทดลอง"><main className="empty-state"><h1>ยังโหลดเกมไม่ได้</h1><p>{store.error}</p><button className="primary-button" onClick={()=>window.location.reload()}>ลองเชื่อมต่ออีกครั้ง</button></main></AppShell>;
  if(!room||!student)return <AppShell title="ห้องทดลอง"><main className="empty-state"><h1>กรุณาเข้าห้องก่อน</h1><button className="primary-button" onClick={()=>router.push("/join")}>ใส่รหัสห้อง</button></main></AppShell>;
  if(labPhase(room,student,now)==="finished"&&!success)return <AppShell title="ห้องทดลอง"><main className="empty-state"><h1>ทำกิจกรรมครบแล้ว</h1><p>ดูคะแนน ข้อที่ผ่าน และข้อที่ข้ามได้ในหน้าสรุปผล</p><button className="primary-button" onClick={()=>router.push("/student/results")}>ดูสรุปผล</button></main></AppShell>;
  const phase=labPhase(room,student,now);
  if(phase!=="playing"&&!success)return <AppShell title="ห้องทดลอง"><main className="empty-state"><h1>{phase==="ended"?"คุณครูจบกิจกรรมแล้ว":phase==="paused"?"พักการทดลองชั่วคราว":phase==="seat"?"เลือกที่นั่งก่อนเริ่มทดลอง":phase==="countdown"?"เตรียมเริ่มการทดลอง":"กำลังรอคุณครูเริ่มเกม"}</h1><p>{phase==="ended"?"คะแนนที่ทำไว้ยังอยู่ ดูสรุปผลได้เลย":phase==="paused"?"แผนทดลองของคุณยังอยู่ เมื่อครูเริ่มต่อจะกลับมาเล่นได้":"กลับห้องเรียนเพื่อดูสถานะกิจกรรม"}</p><button className="primary-button" onClick={()=>router.push(phase==="ended"?"/student/results":"/student/classroom")}>{phase==="ended"?"ดูสรุปผล":"กลับห้องเรียน"}</button></main></AppShell>;
  if(!draftReady)return <AppShell title="ห้องทดลอง"><main className="empty-state" role="status">กำลังกู้คืนแผนทดลอง…</main></AppShell>;

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

  function nextChallenge(){if(levelIndex===activeLevels.length-1){router.push("/student/results");return}setFeedback(null);setHint("");setSuccess(null)}

  async function submit(){
    if(!selected.length){setFeedback({ok:false,text:"เลือกขั้นตอนอย่างน้อย 1 ขั้นตอนก่อนส่งคำตอบ"});return;}
    setBusy(true);
    try{
      const data=await store.submitAttempt(level.id,selected);
      setFeedback({ok:data.correct,text:data.feedback});
      if(data.correct){clearDraft();setSuccess({levelId:level.id,score:data.score,explanation:data.explanation});}
    }catch(error){setFeedback({ok:false,text:error instanceof Error&&!(error instanceof TypeError)&&error.name!=="TimeoutError"&&error.name!=="AbortError"?error.message:"ยังไม่ได้รับผล กรุณาส่งแผนเดิมอีกครั้ง ระบบจะไม่คิดคะแนนซ้ำ"})}
    finally{setBusy(false)}
  }
  async function skip(){
    setBusy(true);setFeedback(null);
    try{await store.skipLevel(level.id);clearDraft();setHint("");if(levelIndex===activeLevels.length-1)router.push("/student/results")}
    catch(error){setFeedback({ok:false,text:error instanceof Error?error.message:"ข้ามข้อไม่ได้ กรุณาลองอีกครั้ง"})}
    finally{setBusy(false)}
  }

  return <AppShell title="ห้องทดลอง" back="/student/classroom"><main className="lab-shell guided-lab">
    {warning&&<p className="error-box" role="status">{warning}</p>}
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
      key={level.id}
      level={level}
      selected={selected}
      onAdd={addStep}
      onRemove={removeStep}
      onReorder={reorderStep}
      onReset={()=>setPendingAction("reset")}
      busy={busy||!!success||!!pendingAction}
    />

    {/* ── Feedback ── */}
    {feedback&&!feedback.ok&&<div className="feedback error" role="status"><CircleHelp/><span><strong>ยังไม่สำเร็จ ลองปรับแผน</strong>{feedback.text}</span></div>}

    {/* ── Hint ── */}
    {room.activity.hintsEnabled&&<div className="challenge-hint"><button onClick={async()=>{try{setHint(await store.getHint(level.id))}catch(error){setHint(error instanceof Error?error.message:"เปิดคำใบ้ไม่ได้")}}}><Lightbulb/>ขอคำใบ้</button>{hint&&<p role="status">{hint}</p>}</div>}

    {/* ── Action Bar ── */}
    <div className="lab-action-bar">
      <div className="lab-submit-summary"><strong>{selected.length?`แผนของคุณมี ${selected.length} ขั้นตอน`:"เพิ่มอุปกรณ์ในถาดเพื่อเริ่มทดลอง"}</strong><span className="action-bar-note">ตอบผิดลดคะแนนที่จะได้ครั้งละ {customQuestion?.wrongPenalty??1} · ต่ำสุด 1</span><small>กดทดลองเพื่อยืนยันส่งแผนและรับผลการแยกสาร</small></div>
      <div className="action-bar-buttons">
        {mistakes>0&&<button className="secondary-button lab-skip" onClick={()=>setPendingAction("skip")} disabled={busy||!!success}><SkipForward size={18}/>ข้ามข้อนี้</button>}
        <button className="primary-button submit-answer" onClick={()=>setPendingAction("submit")} disabled={busy||!!success||selected.length===0}>{busy?"กำลังทดลอง…":<><Send size={18}/>ทดลองแยกสาร</>}</button>
      </div>
    </div>

    {/* ── Success Dialog ── */}
    {success&&<Dialog open onOpenChange={()=>{}}><DialogContent className="challenge-success" showCloseButton={false}><div className="challenge-success-icon"><CheckCircle2 size={46}/></div><p className="eyebrow">ชาเลนจ์ {levelIndex+1} สำเร็จ</p><DialogTitle id="challenge-success-title">แยกสารได้แล้ว!</DialogTitle><strong className="challenge-earned">+{success.score} คะแนน</strong><DialogDescription>{success.explanation}</DialogDescription><div className="separated-materials"><span>สารที่แยกได้</span><div>{level.mixture.split(/\s*\+\s*/).map((name,index)=><strong key={`${index}-${name}`}>{name.trim()}</strong>)}</div></div><button className="primary-button" onClick={nextChallenge}>{levelIndex===activeLevels.length-1?"ดูสรุปผล":"ไปชาเลนจ์ถัดไป"}<ArrowRight/></button></DialogContent></Dialog>}

    {/* ── Confirm Dialog ── */}
    <AlertDialog open={!!pendingAction} onOpenChange={open=>{if(!open)setPendingAction(null)}}><AlertDialogContent className="lab-confirm-dialog"><AlertDialogTitle>{pendingAction==="reset"?"ล้างรายการในถาดทดลอง?":pendingAction==="skip"?`ข้ามชาเลนจ์ ${levelIndex+1}?`:`ส่งแผนทดลองชาเลนจ์ ${levelIndex+1}?`}</AlertDialogTitle><AlertDialogDescription>{pendingAction==="reset"?"อุปกรณ์และลำดับที่จัดไว้จะถูกนำออกจากถาด คะแนนและจำนวนครั้งที่ส่งคำตอบจะยังคงเดิม":pendingAction==="skip"?"ข้อนี้จะได้ 0 คะแนน และกลับมาทำใหม่ไม่ได้หลังยืนยัน":"ตรวจลำดับอุปกรณ์อีกครั้ง หากยังไม่ถูกต้อง คะแนนที่จะได้ในข้อนี้จะลดลง"}</AlertDialogDescription><AlertDialogFooter><AlertDialogCancel>กลับไปแก้ไข</AlertDialogCancel><button className={pendingAction==="skip"||pendingAction==="reset"?"lab-confirm-skip":"primary-button"} onClick={()=>{const action=pendingAction;setPendingAction(null);if(action==="reset"){setSelected([]);setFeedback(null)}else if(action==="skip")void skip();else if(action==="submit")void submit()}}>{pendingAction==="reset"?"ยืนยันล้างรายการ":pendingAction==="skip"?"ยืนยันข้ามข้อ":"ยืนยันส่งคำตอบ"}</button></AlertDialogFooter></AlertDialogContent></AlertDialog>
  </main></AppShell>
}
