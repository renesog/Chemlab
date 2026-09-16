"use client";

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { defaultActivity } from "@/lib/demo-store";
import { LEVELS } from "@/lib/levels";
import { LEGACY_LEVELS } from "@/lib/legacy-levels";
import type { ActivityConfig } from "@/lib/types";
import { Check, Copy, Download, Link2, QrCode, Share2, SlidersHorizontal } from "lucide-react";
import QRCode from "qrcode";
import Image from "next/image";
import { useEffect, useState } from "react";

export function RoomQrDialog({open,onOpenChange,roomCode,joinUrl}:{open:boolean;onOpenChange:(open:boolean)=>void;roomCode:string;joinUrl:string}){
  const [image,setImage]=useState("");
  const [message,setMessage]=useState("");
  useEffect(()=>{if(!open||!joinUrl)return;let cancelled=false;QRCode.toDataURL(joinUrl,{width:320,margin:2,errorCorrectionLevel:"M",color:{dark:"#0a2540",light:"#ffffff"}}).then(data=>{if(!cancelled)setImage(data)}).catch(()=>{if(!cancelled)setMessage("สร้าง QR ไม่สำเร็จ กรุณาใช้ปุ่มคัดลอกลิงก์")});return()=>{cancelled=true}},[open,joinUrl]);
  async function copyLink(){await navigator.clipboard.writeText(joinUrl);setMessage("คัดลอกลิงก์เข้าห้องแล้ว");}
  async function share(){if(navigator.share){await navigator.share({title:`เข้าห้อง ChemClass Lab ${roomCode}`,text:`เข้าห้องเรียนด้วยรหัส ${roomCode}`,url:joinUrl});return;}await copyLink();}
  return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent className="qr-dialog"><DialogHeader><div className="dialog-icon"><QrCode/></div><DialogTitle>ให้นักเรียนสแกนเพื่อเข้าห้อง</DialogTitle><DialogDescription>สแกนแล้วระบบจะใส่รหัสห้อง {roomCode} ให้อัตโนมัติ นักเรียนเพียงตั้งชื่อและสร้างตัวละคร</DialogDescription></DialogHeader><div className="qr-preview">{image?<Image unoptimized width={320} height={320} src={image} alt={`QR Code สำหรับเข้าห้อง ${roomCode}`}/>:<div className="qr-loading">กำลังสร้าง QR…</div>}<strong>{roomCode}</strong></div><div className="share-link"><Link2/><span>{joinUrl}</span><button onClick={copyLink} aria-label="คัดลอกลิงก์"><Copy/></button></div>{message&&<p className="success-box" role="status"><Check/> {message}</p>}<DialogFooter><button className="secondary-button" onClick={share}><Share2/>แชร์ลิงก์</button>{image&&<a className="primary-button" href={image} download={`chemclass-${roomCode}.png`}><Download/>บันทึก QR</a>}</DialogFooter></DialogContent></Dialog>;
}

export function ActivityConfigDialog({open,onOpenChange,value,onSave,catalogVersion}:{open:boolean;onOpenChange:(open:boolean)=>void;value:ActivityConfig;onSave:(value:ActivityConfig)=>void;catalogVersion?:2}){
  const [draft,setDraft]=useState<ActivityConfig>(value.mode==="QUESTIONS"?structuredClone(defaultActivity):value);
  function chooseMode(mode:ActivityConfig["mode"]){setDraft(mode==="PRESET"?structuredClone(defaultActivity):{...draft,mode:"CUSTOM"});}
  function toggleLevel(id:number){setDraft(current=>{const active=current.levelIds.includes(id);const next=active?current.levelIds.filter(x=>x!==id):[...current.levelIds,id].sort((a,b)=>a-b);return {...current,mode:"CUSTOM",levelIds:next.length?next:current.levelIds};});}
  function save(){onSave({...draft,title:draft.title.trim()||"กิจกรรมการแยกสาร"});onOpenChange(false);}
  const total=draft.levelIds.reduce((sum,id)=>sum+(draft.pointsByLevel[id]??5),0);
  return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent className="activity-dialog"><DialogHeader><div className="dialog-icon"><SlidersHorizontal/></div><DialogTitle>ตั้งค่าเกมก่อนเริ่ม</DialogTitle><DialogDescription>ใช้ชุดมาตรฐานเดิม หรือเลือกด่านและคะแนนให้เหมาะกับชั้นเรียนนี้</DialogDescription></DialogHeader><div className="config-mode"><button className={draft.mode==="PRESET"?"active":""} onClick={()=>chooseMode("PRESET")}><strong>ชุดมาตรฐาน</strong><span>8 ด่าน ด่านละ 5 คะแนน</span></button><button className={draft.mode==="CUSTOM"?"active":""} onClick={()=>chooseMode("CUSTOM")}><strong>กำหนดเอง</strong><span>เลือกด่านและคะแนนได้</span></button></div><label className="config-title">ชื่อกิจกรรม<input value={draft.title} maxLength={60} onChange={e=>setDraft({...draft,mode:"CUSTOM",title:e.target.value})}/></label><div className="config-summary"><span>เลือก {draft.levelIds.length} ด่าน</span><strong>คะแนนเต็ม {total}</strong></div><label className="hint-toggle"><input type="checkbox" checked={draft.hintsEnabled===true} onChange={event=>setDraft({...draft,hintsEnabled:event.target.checked})}/>เปิดคำใบ้ให้นักเรียนในเกมนี้</label><div className="level-config-list">{(catalogVersion===2?LEVELS:LEGACY_LEVELS).map(level=>{const active=draft.levelIds.includes(level.id);return <article key={level.id} className={active?"active":""}><button className="level-toggle" aria-pressed={active} onClick={()=>toggleLevel(level.id)}><span>{active&&<Check/>}</span><b>ด่าน {level.id}</b><small>{level.mixture}</small></button><label>คะแนน<input type="number" min={1} max={20} disabled={!active} value={draft.pointsByLevel[level.id]??5} onChange={e=>setDraft(current=>({...current,mode:"CUSTOM",pointsByLevel:{...current.pointsByLevel,[level.id]:Math.min(20,Math.max(1,Number(e.target.value)||1))}}))}/></label></article>})}</div><DialogFooter><button className="secondary-button" onClick={()=>onOpenChange(false)}>ยกเลิก</button><button className="primary-button" onClick={save}>บันทึกการตั้งค่า</button></DialogFooter></DialogContent></Dialog>;
}
