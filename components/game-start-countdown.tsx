"use client";

import { useEffect, useState } from "react";
import type { Classroom } from "@/lib/types";
import { countdownSeconds, gameIsLive } from "@/lib/live-game";
import { FlaskConical, Users, Zap } from "lucide-react";

export function useGameClock(room?:Pick<Classroom,"status"|"gameStartsAt">){
  const [now,setNow]=useState(0);
  const status=room?.status;
  const startsAt=room?.gameStartsAt;
  useEffect(()=>{
    const tick=()=>setNow(Date.now());
    const first=setTimeout(tick,0);
    if(status!=="RUNNING"||!startsAt)return()=>clearTimeout(first);
    const timer=setInterval(()=>{tick();if(Date.now()>=startsAt)clearInterval(timer)},200);
    return()=>{clearTimeout(first);clearInterval(timer)};
  },[status,startsAt]);
  return now;
}

export function GameStartCountdown({room,now}:{room:Classroom;now:number}){
  const active=!!now&&room.status==="RUNNING"&&!gameIsLive(room,now);
  useEffect(()=>{
    if(!active)return;
    const previous=document.body.style.overflow;
    document.body.style.overflow="hidden";
    return()=>{document.body.style.overflow=previous};
  },[active]);
  if(!active)return null;
  const seconds=countdownSeconds(room,now);
  const preparing=(room.gameStartsAt??0)-now>3000;
  const remaining=Math.min(1,Math.max(0,((room.gameStartsAt??now)-now)/3000));
  return <div className={`game-countdown ${preparing?"is-preparing":"is-counting"}`}>
    <div className="countdown-decor" aria-hidden="true"><i/><i/><i/><i/><i/><i/></div>
    <header className="countdown-brand"><FlaskConical size={20}/><span>ChemClass Lab</span><span className="countdown-live">ห้องเรียนสด</span></header>
    <div className="countdown-stage">
      <div className="countdown-kicker"><Zap size={16} aria-hidden="true"/>{preparing?"เตรียมตัวให้พร้อม":"เกมกำลังเริ่ม"}</div>
      <h2 className="countdown-title">{room.activity.title}</h2>
      <div className="countdown-dial" role="status" aria-live="polite" aria-atomic="true" aria-label={preparing?"เตรียมตัวให้พร้อม":`เกมเริ่มใน ${seconds} วินาที`}>
        <svg viewBox="0 0 240 240" aria-hidden="true"><circle className="countdown-track" cx="120" cy="120" r="108"/><circle className="countdown-ring" cx="120" cy="120" r="108" pathLength="100" strokeDasharray="100" strokeDashoffset={preparing?0:100*(1-remaining)}/></svg>
        <div className="countdown-dial-copy" key={preparing?"ready":seconds} aria-hidden="true"><strong>{preparing?"พร้อม!":seconds}</strong><span>{preparing?"แล้วพบกันในห้องทดลอง":"ไปทดลองกัน"}</span></div>
      </div>
      <div className="countdown-steps" aria-hidden="true">{[3,2,1].map(step=><span className={!preparing&&seconds<=step?"is-active":""} key={step}>{step}</span>)}</div>
      <p className="countdown-caption">ทุกคนจะเข้าสู่เกมพร้อมกันอัตโนมัติ</p>
      <div className="countdown-info"><span><Users size={17} aria-hidden="true"/>{room.students.length} ผู้เข้าร่วม</span><i aria-hidden="true"/><span>{room.activity.levelIds.length} ภารกิจ</span></div>
    </div>
    <footer className="countdown-room">ห้อง <strong>{room.code}</strong><span>เตรียมแผนให้ดี แล้วลงมือทดลอง</span></footer>
  </div>;
}
