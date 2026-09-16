"use client";

import { useEffect, useState } from "react";
import type { Classroom } from "@/lib/types";
import { countdownSeconds, gameIsLive } from "@/lib/live-game";

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
  if(!now||room.status!=="RUNNING"||gameIsLive(room,now))return null;
  const seconds=countdownSeconds(room,now);
  const preparing=(room.gameStartsAt??0)-now>3000;
  return <div className="game-countdown" role="status" aria-live="polite" aria-atomic="true">
    <span>{preparing?"เตรียมตัวให้พร้อม":"เกมกำลังเริ่ม"}</span>
    <strong>{preparing?"พร้อม":seconds}</strong>
    <small>ทุกคนจะเข้าสู่เกมพร้อมกันอัตโนมัติ</small>
  </div>;
}
