"use client";

import dynamic from "next/dynamic";
import type { PublicLevel } from "@/lib/levels";
import { ArrowDown, ArrowUp, Beaker, Check, CircleHelp, Droplets, FileText, Flame, FlaskConical, Magnet, Package, Plus, ScanSearch, Snowflake, Trash2, X } from "lucide-react";
import { useState } from "react";
import { labToolDescription } from "@/lib/lab-equipment";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";

const LabScene3D = dynamic(() => import("./lab-scene-3d"), { ssr: false, loading: () => <div className="virtual-lab-loading" role="status">กำลังเปิดห้องแล็บ 3 มิติ…</div> });

export function ToolIcon({ id, size = 22 }: { id: string; size?: number }) {
  const Icon = id.includes("magnet") ? Magnet : /sieve/.test(id) ? ScanSearch : /paper|filter/.test(id) ? FileText : /receiver|beaker/.test(id) ? Beaker : /water|pour|stir|dissolve|drain|settle/.test(id) ? Droplets : /heat|evaporate|sublime|dish/.test(id) ? Flame : /collect/.test(id) ? Package : /cool/.test(id) ? Snowflake : /remove/.test(id) ? Trash2 : FlaskConical;
  return <Icon size={size} aria-hidden="true"/>;
}

type BenchProps = { level: PublicLevel; selected: string[]; onAdd: (id: string) => void; onRemove: (id: string) => void; onReorder: (from: number, to: number) => void; onReset: () => void; busy?: boolean };

export function ChallengeWorkbench({ level, selected, onAdd, onRemove, onReorder, onReset, busy = false }: BenchProps) {
  const [focusedId,setFocusedId]=useState<string|null>(null);
  const [helpOpen,setHelpOpen]=useState(false);
  const [notice,setNotice]=useState("");
  const focused=level.equipment.find(item=>item.id===focusedId);
  function add(id:string){
    if(busy)return;
    const item=level.equipment.find(item=>item.id===id);
    if(!item)return;
    if(selected.includes(id)){setNotice(`${item.label} อยู่ในถาดแล้ว`);return;}
    onAdd(id);setNotice(`เพิ่ม ${item.label} ในถาดแล้ว`);
  }
  return <div className="lab-workspace-3d">
    <div className="lab-guide-bar"><ol aria-label="วิธีทดลอง"><li><b>1</b>เลือกอุปกรณ์</li><li><b>2</b>จัดลำดับในถาด</li><li><b>3</b>ทดลองและดูผล</li></ol><button type="button" onClick={()=>setHelpOpen(true)}><CircleHelp size={18}/>วิธีเล่น</button></div>
    <div className="lab-interaction-grid">
      <LabScene3D equipment={level.equipment} selected={selected} focusedId={focusedId} onInspect={setFocusedId} onAdd={add} busy={busy}/>
      <aside className="lab-inventory" aria-label="เลือกอุปกรณ์และขั้นตอน">
        <header><span className="eyebrow">เลือกแล้วเพิ่มลงถาด</span><h2>อุปกรณ์และวิธีทดลอง</h2><p>ลากอุปกรณ์ในฉากมาวางบนโต๊ะเพื่อเพิ่มขั้นตอน หรือแตะรายการแล้วกดเพิ่มลงถาด</p></header>
        <div className="lab-inventory-list">{level.equipment.map((item,index)=><button type="button" key={item.id} className={focusedId===item.id?"is-focused":""} aria-pressed={focusedId===item.id} disabled={busy} draggable={!busy} onDragStart={event=>{event.dataTransfer.setData("equipment-id",item.id);event.dataTransfer.effectAllowed="copy"}} onClick={()=>setFocusedId(item.id)}><span className="inventory-tool"><ToolIcon id={item.id}/><small>{index+1}</small></span><span>{item.label}</span>{selected.includes(item.id)&&<span className="inventory-added"><Check size={14}/>ในถาด</span>}</button>)}</div>
        <div className="lab-object-info" aria-live="polite">{focused?<><div className="lab-object-title"><ToolIcon id={focused.id}/><h3>{focused.label}</h3></div><p>{labToolDescription(focused.id,focused.label)}</p><button className="primary-button" type="button" disabled={busy||selected.includes(focused.id)} onClick={()=>add(focused.id)}>{selected.includes(focused.id)?<><Check size={17}/>อยู่ในถาดแล้ว</>:<><Plus size={17}/>เพิ่มไปยังถาดทดลอง</>}</button></>:<><FlaskConical size={24}/><h3>เริ่มจากเลือกอุปกรณ์สักชิ้น</h3><p>ชื่อและวิธีใช้จะแสดงตรงนี้ ก่อนเพิ่มไปยังถาดทดลอง</p></>}</div>
      </aside>
    </div>
    <section className="lab-sequence" aria-label="ลำดับแผนทดลอง" onDragOver={event => event.preventDefault()} onDrop={event => { event.preventDefault(); if (busy) return; const id = event.dataTransfer.getData("equipment-id"); if (level.equipment.some(item => item.id === id)) add(id); }}>
      <div className="lab-sequence-heading"><div><h2>ถาดการทดลอง</h2><span>{selected.length} ขั้นตอน · เรียงตามลำดับที่จะทำ</span></div><button className="secondary-button" type="button" disabled={busy||!selected.length} onClick={onReset}><Trash2 size={16}/>ล้างรายการ</button></div>
      <div className="lab-tray-mixture"><Beaker size={18}/><span>สารผสมตั้งต้น: <strong>{level.mixture}</strong></span></div>
      {selected.length ? <ol>{selected.map((id, index) => {
        const item = level.equipment.find(item => item.id === id); if (!item) return null;
        return <li key={id} draggable={!busy} onDragStart={event => { event.dataTransfer.setData("reorder-index", String(index)); event.dataTransfer.effectAllowed = "move"; }} onDragOver={event => event.preventDefault()} onDrop={event => { const source = event.dataTransfer.getData("reorder-index"); if (source !== "") { event.preventDefault(); event.stopPropagation(); const from = Number(source); if (!busy && Number.isInteger(from) && from >= 0 && from < selected.length) onReorder(from, index); } }}>
          <b className="lab-step-number">{index + 1}</b><ToolIcon id={id}/><span>{item.label}</span><div className="lab-step-actions"><button type="button" disabled={busy || index === 0} onClick={() => onReorder(index, index - 1)} aria-label={`เลื่อน ${item.label} ขึ้น`}><ArrowUp size={17}/></button><button type="button" disabled={busy || index === selected.length - 1} onClick={() => onReorder(index, index + 1)} aria-label={`เลื่อน ${item.label} ลง`}><ArrowDown size={17}/></button><button type="button" disabled={busy} onClick={() => {onRemove(id);setNotice(`นำ ${item.label} ออกจากถาดแล้ว`)}} aria-label={`นำ ${item.label} ออกจากโต๊ะ`}><X size={17}/></button></div>
        </li>;
      })}</ol> : <div className="lab-sequence-empty"><Plus size={24}/><strong>ถาดยังว่างอยู่</strong><span>เลือกอุปกรณ์ แล้วกด “เพิ่มไปยังถาดทดลอง”</span><small>เลือกเฉพาะขั้นตอนที่คิดว่าจำเป็น ไม่จำเป็นต้องใช้ทุกชิ้น</small></div>}
      <p className="lab-tray-notice" role="status">{notice}</p>
    </section>
    <Dialog open={helpOpen} onOpenChange={setHelpOpen}><DialogContent className="lab-help-dialog"><DialogTitle>ทดลองแยกสารอย่างไร?</DialogTitle><DialogDescription>อ่านเป้าหมายของด่าน แล้ววางแผนตามสมบัติของสาร</DialogDescription><ol><li>แตะอุปกรณ์ในฉากหรือในรายการ เพื่ออ่านรายละเอียด</li><li>กด “เพิ่มไปยังถาดทดลอง” แล้วใช้ลูกศรเรียงขั้นตอน หรือลากรายการ</li><li>ตรวจแผน แล้วกด “ทดลองแยกสาร” และยืนยันส่งคำตอบ</li><li>อ่านผลจากการทดลอง หากยังไม่สำเร็จให้ปรับแผนแล้วลองอีกครั้ง การส่งคำตอบผิดมีผลต่อคะแนน</li></ol><button type="button" className="primary-button" onClick={()=>setHelpOpen(false)}>เข้าใจแล้ว เริ่มวางแผน</button></DialogContent></Dialog>
  </div>;
}
