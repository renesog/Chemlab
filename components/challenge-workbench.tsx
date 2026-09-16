"use client";

import type { PublicLevel } from "@/lib/levels";
import { Droplets, Flame, FlaskConical, Magnet, ScanSearch } from "lucide-react";
import type { DragEvent } from "react";

export function ToolIcon({id}:{id:string}){
  const Icon=id.includes("magnet")?Magnet:/water|pour|stir|dissolve|drain|settle/.test(id)?Droplets:/heat|evaporate|sublime|dish/.test(id)?Flame:ScanSearch;
  return <Icon aria-hidden="true"/>;
}

export function ChallengeWorkbench({level,selected,onAdd}:{level:PublicLevel;selected:string[];onAdd:(id:string)=>void}){
  const materials=level.mixture.split(/\s*\+\s*/);
  function drop(event:DragEvent<HTMLDivElement>){event.preventDefault();const id=event.dataTransfer.getData("text/plain");if(level.equipment.some(item=>item.id===id))onAdd(id)}
  return <section className="challenge-workbench panel" aria-label="โต๊ะทดลอง">
    <div className="workbench-heading"><span className="workbench-label"><FlaskConical aria-hidden="true"/>โต๊ะทดลอง</span><small>ลากอุปกรณ์มาวาง หรือแตะจากรายการด้านล่าง</small></div>
    <div className="workbench-drop" onDragOver={event=>event.preventDefault()} onDrop={drop}>
      <div className="sample-vessel"><FlaskConical size={54} strokeWidth={1.5} aria-hidden="true"/><span>ตัวอย่างสารผสม</span></div>
      <div className="sample-materials">{materials.map((name,index)=><span key={`${index}-${name}`}>{name.trim()}</span>)}</div>
      <div className="workbench-divider" aria-hidden="true"/>
      <div className="workbench-next"><small>{selected.length?`เตรียมไว้ ${selected.length} ขั้นตอน`:"ยังไม่ได้เริ่มทดลอง"}</small><strong>{selected.length?level.equipment.find(item=>item.id===selected[selected.length-1])?.label:"เลือกเครื่องมือเพื่อวางแผนแยกสาร"}</strong></div>
    </div>
    <p className="workbench-note">ทดลองส่งลำดับเมื่อพร้อม ระบบจะตรวจผลและอธิบายหลักการหลังทำสำเร็จ</p>
  </section>;
}
