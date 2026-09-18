"use client";

import { AppShell, LoadingState } from "@/components/app-shell";
import { Avatar } from "@/components/avatar";
import { ActivityConfigDialog, RoomQrDialog } from "@/components/classroom-dialogs";
import { DeskGrid } from "@/components/desk-grid";
import { GameStartCountdown, useGameClock } from "@/components/game-start-countdown";
import { useDemo } from "@/lib/demo-store";
import { rankedStudents } from "@/lib/live-game";
import { CirclePause, CirclePlay, CirclePlus, Copy, Download, Hand, LockKeyhole, QrCode, Settings2, Share2, Square, Unlock } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";

export default function TeacherRoom(){
  const {id}=useParams<{id:string}>();
  const store=useDemo();
  const router=useRouter();
  const [notice,setNotice]=useState("");
  const [qrOpen,setQrOpen]=useState(false);
  const [configOpen,setConfigOpen]=useState(false);
  const room=store.rooms.find(r=>r.id===id);
  const now=useGameClock(room);
  if(!store.ready)return <AppShell title="ห้องเรียนสด"><LoadingState/></AppShell>;
  if(!room)return <AppShell title="ห้องเรียนสด"><main className="empty-state"><h1>ไม่พบห้องเรียน</h1><button className="primary-button" onClick={()=>router.push("/teacher/dashboard")}>กลับแดชบอร์ด</button></main></AppShell>;
  const joinUrl=`${typeof location!=="undefined"?location.origin:""}/join/${room.code}`;
  async function copy(value:string,message:string){await navigator.clipboard.writeText(value);setNotice(message);}
  async function share(){if(!room)return;if(navigator.share){await navigator.share({title:`เข้าห้อง ${room.name}`,text:`เข้าห้อง ChemClass Lab รหัส ${room.code}`,url:joinUrl});return;}await copy(joinUrl,"คัดลอกลิงก์เข้าห้องแล้ว");}
  function manage(action:Promise<void>){void action.catch(e=>setNotice(e instanceof Error?e.message:"บันทึกไม่สำเร็จ"))}
  function end(){if(room&&confirm("ยืนยันจบห้อง? นักเรียนจะส่งคำตอบเพิ่มไม่ได้"))manage(store.setRoomStatus(room.id,"ENDED"))}
  const maxScore=room.activity.levelIds.reduce((sum,levelId)=>sum+(room.activity.pointsByLevel[levelId]??5),0);
  const shared=store.canManage(room.id);
  const ranked=rankedStudents(room.students);
  const totalLevels=room.activity.levelIds.length;
  const finished=room.students.filter(student=>student.completed.length>=totalLevels).length;
  const average=room.students.length?Math.round(room.students.reduce((sum,student)=>sum+student.totalScore,0)/room.students.length):0;
  const showBoard=room.status!=="OPEN";

  return <AppShell title="ห้องเรียนสด" back="/teacher/dashboard"><main className="classroom-shell">
    <section className="room-top"><div><p className="eyebrow">ห้องเรียนสด</p><h1>{room.name}</h1><p>{room.subject}</p></div><div className="room-code-card"><span>รหัสห้อง</span><strong>{room.code}</strong><button disabled={!shared} onClick={()=>copy(room.code,"คัดลอกรหัสห้องแล้ว")} aria-label="คัดลอกรหัส"><Copy size={18}/></button><button className="share-button" disabled={!shared} onClick={share} aria-label="แชร์ลิงก์"><Share2 size={18}/></button><button className="qr-button" disabled={!shared} onClick={()=>setQrOpen(true)}><QrCode size={19}/>แสดง QR</button></div></section>
    {!shared&&<div className="error-box" role="alert">ห้องนี้สร้างด้วยระบบเก่าที่เก็บเฉพาะเครื่องครู มือถือจะเข้าไม่ได้ กรุณา <Link href="/teacher/classrooms/new">สร้างห้องใหม่</Link> แล้วแชร์ QR ใหม่</div>}{store.error&&<div className="error-box" role="alert">เผยแพร่ห้องไม่สำเร็จ: {store.error}</div>}{notice&&<div className="success-box" role="status">{notice}</div>}
    <section className="activity-plan panel"><div><span className="activity-kicker">เกมที่เลือก</span><strong>{room.activity.title}</strong><small>{room.activity.mode==="PRESET"?"ชุดมาตรฐาน":room.activity.mode==="QUESTIONS"?"โจทย์ที่ครูสร้าง":"เลือกด่านเอง"} · {room.activity.levelIds.length} ข้อ · {maxScore} คะแนน · {room.activity.hintsEnabled?"มีคำใบ้":"ปิดคำใบ้"}</small></div><div className="activity-plan-actions"><button className="secondary-button" disabled={!shared||room.status!=="OPEN"} onClick={()=>setConfigOpen(true)}><Settings2/>เลือกชุดด่าน</button><button className="primary-button compact" disabled={!shared||room.status!=="OPEN"} onClick={()=>router.push(`/teacher/classrooms/${room.id}/questions`)}><CirclePlus/>สร้างโจทย์เอง</button></div></section>
    <section className="control-bar"><div className="activity-state"><span className={`status-dot ${room.status.toLowerCase()}`}/><div><small>สถานะกิจกรรม</small><strong>{room.status==="RUNNING"?"กำลังทดลอง":room.status==="PAUSED"?"หยุดชั่วคราว":room.status==="ENDED"?"จบแล้ว":"นักเรียนกำลังรอเริ่ม"}</strong></div></div><div className="control-actions">{room.status!=="RUNNING"&&room.status!=="ENDED"&&<button className="primary-button compact" onClick={()=>manage(store.setRoomStatus(room.id,"RUNNING"))}><CirclePlay/>{room.status==="PAUSED"?"ทำต่อ":"เริ่มเกม"}</button>}{room.status==="RUNNING"&&<button className="secondary-button" onClick={()=>manage(store.setRoomStatus(room.id,"PAUSED"))}><CirclePause/>หยุดชั่วคราว</button>}<button className="danger-button" onClick={end} disabled={room.status==="ENDED"}><Square/>จบห้อง</button></div></section>
    {showBoard&&<section className="live-board panel" aria-label="คะแนนสดและอันดับนักเรียน"><div className="section-title"><div><p className="eyebrow">ผลการแข่งขันสด</p><h2>กระดานคะแนน</h2><span>อัปเดตคะแนนและความคืบหน้าอัตโนมัติ</span></div><button onClick={()=>router.push(`/teacher/classrooms/${room.id}/report`)}><Download/>สรุปผล / CSV</button></div><div className="live-summary"><div><strong>{room.students.length}</strong><span>ผู้เข้าร่วม</span></div><div><strong>{finished}</strong><span>จบทุกด่าน</span></div><div><strong>{average}</strong><span>คะแนนเฉลี่ย</span></div><div><strong>{maxScore}</strong><span>คะแนนเต็ม</span></div></div>{ranked.length?<ol className="leaderboard">{ranked.map((student,index)=><li key={student.id}><span className="rank-number">{index+1}</span><Avatar value={student.avatar} size={40}/><div className="leader-name"><strong>{student.nickname}</strong><small>โต๊ะ {room.desks.find(d=>d.id===student.deskId)?.label??"ยังไม่เลือก"} · {student.completed.length}/{totalLevels} ด่าน {student.completed.length===totalLevels?"· จบแล้ว":"· กำลังเล่น"}</small></div>{student.handRaised&&<span className="hand-badge"><Hand/>ยกมือ</span>}<strong className="leader-score">{student.totalScore}<small>คะแนน</small></strong></li>)}</ol>:<div className="mini-empty"><QrCode/><strong>ยังไม่มีนักเรียน</strong><span>แชร์ QR เพื่อให้นักเรียนเข้าร่วม</span></div>}</section>}
    <div className="teacher-layout"><section className="panel room-map"><div className="section-title"><div><h2>ผังห้องเรียน</h2><span>เห็นตัวละคร ตำแหน่งที่นั่ง และนักเรียนที่ยกมือได้ทันที (คลิกนักเรียนเพื่อย้ายโต๊ะ)</span></div><div className="inline-actions"><button onClick={()=>manage(store.setAllLocks(room.id,true))}><LockKeyhole/>ล็อกทั้งหมด</button><button onClick={()=>manage(store.setAllLocks(room.id,false))}><Unlock/>ปลดทั้งหมด</button></div></div><DeskGrid room={room} onLock={(deskId,locked)=>manage(store.setDeskLock(room.id,deskId,locked))} onMoveStudent={(studentId,toDeskId)=>manage(store.moveStudent(room.id,studentId,toDeskId).then(()=>setNotice("ย้ายโต๊ะนักเรียนเรียบร้อยแล้ว")))}/><div className="legend"><span><i className="available"/>ว่าง</span><span><i className="occupied"/>มีคนนั่ง</span><span><i className="locked"/>ล็อกแล้ว</span></div></section><aside className="panel student-panel"><div className="section-title"><h2>นักเรียน ({room.students.length})</h2><button onClick={()=>router.push(`/teacher/classrooms/${room.id}/report`)}><Download/>รายงาน</button></div>{room.students.length===0?<div className="mini-empty"><QrCode/><strong>ยังไม่มีนักเรียน</strong><span>กด “แสดง QR” แล้วให้นักเรียนสแกน</span></div>:<div className="student-list">{room.students.map(s=><article key={s.id}><div className="student-name"><Avatar value={s.avatar} size={38}/><div><strong>{s.nickname}</strong><small>โต๊ะ {room.desks.find(d=>d.id===s.deskId)?.label??"ยังไม่เลือก"} · {s.totalScore} คะแนน</small></div></div>{s.handRaised&&<span className="hand-badge"><Hand/>ยกมือ</span>}<span>ข้อ {room.activity.levelIds.indexOf(s.currentLevel)+1}</span></article>)}</div>}</aside></div>
    <GameStartCountdown room={room} now={now}/>
    <RoomQrDialog open={qrOpen} onOpenChange={setQrOpen} roomCode={room.code} joinUrl={joinUrl}/>
    {configOpen&&<ActivityConfigDialog open={configOpen} onOpenChange={setConfigOpen} value={room.activity} catalogVersion={room.catalogVersion} onSave={activity=>manage(store.configureActivity(room.id,activity).then(()=>setNotice("บันทึกการตั้งค่าเกมแล้ว")))}/>}
  </main></AppShell>;
}
