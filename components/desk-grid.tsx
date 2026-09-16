"use client";

import { LockKeyhole, Unlock } from "lucide-react";
import { Avatar } from "@/components/avatar";
import type { Classroom, Desk } from "@/lib/types";
import { deskState } from "@/lib/desk";

const labels={AVAILABLE:"ว่าง · เลือกได้",OCCUPIED:"มีคนนั่ง",LOCKED_EMPTY:"ล็อก · ว่าง",LOCKED_OCCUPIED:"ล็อก · มีคนนั่ง"};

function DeskContent({desk,room}:{desk:Desk;room:Classroom}){
  const state=deskState(desk);
  const student=room.students.find(s=>s.id===desk.occupantId);
  return <><span className="desk-top"><strong>{desk.label}</strong>{desk.locked?<LockKeyhole size={15}/>:<Unlock size={15}/>}</span><span className="desk-person">{student?<><Avatar value={student.avatar} size={32}/><span><b>{student.nickname}</b>{student.handRaised&&<small>ยกมืออยู่</small>}</span></>:labels[state]}</span></>;
}

export function DeskGrid({room,onSelect,onLock,selectedId}:{room:Classroom;onSelect?:(id:string)=>void;onLock?:(id:string,locked:boolean)=>void;selectedId?:string}){
  return <div className={`desk-grid layout-${room.layout.toLowerCase()}`}>
    {room.desks.map(d=>{
      const state=deskState(d);
      const selected=selectedId===d.id;
      const className=`desk ${state.toLowerCase()} ${selected?"selected":""}`;
      if(onLock)return <article key={d.id} className={className} aria-label={`โต๊ะ ${d.label} ${labels[state]}`}><DeskContent desk={d} room={room}/><button className="desk-lock-action" onClick={()=>onLock(d.id,!d.locked)}>{d.locked?<><Unlock/>ปลดล็อก</>:<><LockKeyhole/>ล็อกโต๊ะ</>}</button></article>;
      return <button key={d.id} className={className} onClick={()=>onSelect?.(d.id)} disabled={d.locked||!!d.occupantId&&!selected} aria-pressed={selected} aria-label={`โต๊ะ ${d.label} ${labels[state]}`}><DeskContent desk={d} room={room}/>{selected&&<span className="selected-label">ที่นั่งของฉัน</span>}</button>;
    })}
  </div>;
}
