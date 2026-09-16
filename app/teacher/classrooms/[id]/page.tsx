"use client";

import { AppShell, LoadingState } from "@/components/app-shell";
import { Avatar } from "@/components/avatar";
import { ActivityConfigDialog, RoomQrDialog } from "@/components/classroom-dialogs";
import { DeskGrid } from "@/components/desk-grid";
import { useDemo } from "@/lib/demo-store";
import { CirclePause, CirclePlay, Copy, Download, Hand, LockKeyhole, QrCode, Settings2, Share2, Square, Unlock } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

export default function TeacherRoom(){
  const {id}=useParams<{id:string}>();
  const store=useDemo();
  const router=useRouter();
  const [notice,setNotice]=useState("");
  const [qrOpen,setQrOpen]=useState(false);
  const [configOpen,setConfigOpen]=useState(false);
  const room=store.rooms.find(r=>r.id===id);
  if(!store.ready)return <AppShell title="ห้องเรียนสด"><LoadingState/></AppShell>;
  if(!room)return <AppShell title="ห้องเรียนสด"><main className="empty-state"><h1>ไม่พบห้องเรียน</h1><button className="primary-button" onClick={()=>router.push("/teacher/dashboard")}>กลับแดชบอร์ด</button></main></AppShell>;
  const joinUrl=`${typeof location!=="undefined"?location.origin:""}/join/${room.code}`;
  async function copy(value:string,message:string){await navigator.clipboard.writeText(value);setNotice(message);}
  async function share(){if(navigator.share){await navigator.share({title:`เข้าห้อง ${room.name}`,text:`เข้าห้อง ChemClass Lab รหัส ${room.code}`,url:joinUrl});return;}await copy(joinUrl,"คัดลอกลิงก์เข้าห้องแล้ว");}
  function end(){if(confirm("ยืนยันจบห้อง? นักเรียนจะส่งคำตอบเพิ่มไม่ได้"))store.setRoomStatus(room.id,"ENDED")}
  const maxScore=room.activity.levelIds.reduce((sum,levelId)=>sum+(room.activity.pointsByLevel[levelId]??5),0);

  return <AppShell title="ห้องเรียนสด" back="/teacher/dashboard"><main className="classroom-shell">
    <section className="room-top"><div><p className="eyebrow">ห้องเรียนสด</p><h1>{room.name}</h1><p>{room.subject}</p></div><div className="room-code-card"><span>รหัสห้อง</span><strong>{room.code}</strong><button onClick={()=>copy(room.code,"คัดลอกรหัสห้องแล้ว")} aria-label="คัดลอกรหัส"><Copy size={18}/></button><button className="share-button" onClick={share} aria-label="แชร์ลิงก์"><Share2 size={18}/></button><button className="qr-button" onClick={()=>setQrOpen(true)}><QrCode size={19}/>แสดง QR</button></div></section>
    {notice&&<div className="success-box" role="status">{notice}</div>}
    <section className="activity-plan panel"><div><span className="activity-kicker">เกมที่เลือก</span><strong>{room.activity.title}</strong><small>{room.activity.mode==="PRESET"?"ชุดมาตรฐาน":"กำหนดเอง"} · {room.activity.levelIds.length} ด่าน · {maxScore} คะแนน</small></div><button className="secondary-button" disabled={room.status==="RUNNING"||room.status==="ENDED"} onClick={()=>setConfigOpen(true)}><Settings2/>ตั้งค่าเกม</button></section>
    <section className="control-bar"><div className="activity-state"><span className={`status-dot ${room.status.toLowerCase()}`}/><div><small>สถานะกิจกรรม</small><strong>{room.status==="RUNNING"?"กำลังทดลอง":room.status==="PAUSED"?"หยุดชั่วคราว":room.status==="ENDED"?"จบแล้ว":"นักเรียนกำลังรอเริ่ม"}</strong></div></div><div className="control-actions">{room.status!=="RUNNING"&&room.status!=="ENDED"&&<button className="primary-button compact" onClick={()=>store.setRoomStatus(room.id,"RUNNING")}><CirclePlay/>{room.status==="PAUSED"?"ทำต่อ":"เริ่มเกม"}</button>}{room.status==="RUNNING"&&<button className="secondary-button" onClick={()=>store.setRoomStatus(room.id,"PAUSED")}><CirclePause/>หยุดชั่วคราว</button>}<button className="danger-button" onClick={end} disabled={room.status==="ENDED"}><Square/>จบห้อง</button></div></section>
    <div className="teacher-layout"><section className="panel room-map"><div className="section-title"><div><h2>ผังห้องเรียน</h2><span>เห็นตัวละคร ตำแหน่งที่นั่ง และนักเรียนที่ยกมือได้ทันที</span></div><div className="inline-actions"><button onClick={()=>store.setAllLocks(room.id,true)}><LockKeyhole/>ล็อกทั้งหมด</button><button onClick={()=>store.setAllLocks(room.id,false)}><Unlock/>ปลดทั้งหมด</button></div></div><DeskGrid room={room} onLock={(deskId,locked)=>store.setDeskLock(room.id,deskId,locked)}/><div className="legend"><span><i className="available"/>ว่าง</span><span><i className="occupied"/>มีคนนั่ง</span><span><i className="locked"/>ล็อกแล้ว</span></div></section><aside className="panel student-panel"><div className="section-title"><h2>นักเรียน ({room.students.length})</h2><button onClick={()=>router.push(`/teacher/classrooms/${room.id}/report`)}><Download/>รายงาน</button></div>{room.students.length===0?<div className="mini-empty"><QrCode/><strong>ยังไม่มีนักเรียน</strong><span>กด “แสดง QR” แล้วให้นักเรียนสแกน</span></div>:<div className="student-list">{room.students.map(s=><article key={s.id}><div className="student-name"><Avatar value={s.avatar} size={38}/><div><strong>{s.nickname}</strong><small>โต๊ะ {room.desks.find(d=>d.id===s.deskId)?.label??"ยังไม่เลือก"} · {s.totalScore} คะแนน</small></div></div>{s.handRaised&&<span className="hand-badge"><Hand/>ยกมือ</span>}<span>ด่าน {s.currentLevel}</span></article>)}</div>}</aside></div>
    <RoomQrDialog open={qrOpen} onOpenChange={setQrOpen} roomCode={room.code} joinUrl={joinUrl}/>
    <ActivityConfigDialog open={configOpen} onOpenChange={setConfigOpen} value={room.activity} onSave={activity=>{store.configureActivity(room.id,activity);setNotice("บันทึกการตั้งค่าเกมแล้ว")}}/>
  </main></AppShell>;
}
