"use client";

import { LockKeyhole, Unlock, UserRound } from "lucide-react";
import type { Classroom } from "@/lib/types";
import { deskState } from "@/lib/desk";

const labels={AVAILABLE:"ว่าง",OCCUPIED:"มีคนนั่ง",LOCKED_EMPTY:"ล็อก · ว่าง",LOCKED_OCCUPIED:"ล็อก · มีคนนั่ง"};
export function DeskGrid({room,onSelect,onLock,selectedId}:{room:Classroom;onSelect?:(id:string)=>void;onLock?:(id:string,locked:boolean)=>void;selectedId?:string}){
  return <div className={`desk-grid layout-${room.layout.toLowerCase()}`}>
    {room.desks.map(d=>{const state=deskState(d);const student=room.students.find(s=>s.id===d.occupantId);return <button key={d.id} className={`desk ${state.toLowerCase()} ${selectedId===d.id?"selected":""}`} onClick={()=>onSelect?.(d.id)} disabled={!!onSelect&&(d.locked||!!d.occupantId&&selectedId!==d.id)} aria-label={`โต๊ะ ${d.label} ${labels[state]}`}>
      <span className="desk-top"><strong>{d.label}</strong>{d.locked?<LockKeyhole size={15}/>:<Unlock size={15}/>}</span>
      <span className="desk-person">{student?<><UserRound size={17}/>{student.nickname}</>:labels[state]}</span>
      {onLock&&<span role="button" tabIndex={0} className="desk-lock-action" onClick={e=>{e.stopPropagation();onLock(d.id,!d.locked)}}>{d.locked?"ปลดล็อก":"ล็อกโต๊ะ"}</span>}
    </button>})}
  </div>;
}
