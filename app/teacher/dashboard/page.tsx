"use client";

import { AppShell, LoadingState } from "@/components/app-shell";
import { TeacherProfileBadge } from "@/components/teacher-profile-form";
import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useDemo } from "@/lib/demo-store";
import type { Classroom } from "@/lib/types";
import { BarChart3, ChevronRight, CirclePlus, Clock3, DoorOpen, Trash2, UsersRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Dashboard(){
  const store=useDemo();const router=useRouter();
  const [selected,setSelected]=useState<Classroom|null>(null);
  const [deleting,setDeleting]=useState(false);
  const [deleteError,setDeleteError]=useState("");
  if(!store.ready)return <AppShell title="แดชบอร์ดครู"><LoadingState/></AppShell>;
  const rooms=store.rooms.filter(room=>store.canManage(room.id));
  async function confirmDelete(){
    if(!selected)return;
    setDeleting(true);setDeleteError("");
    try{await store.deleteRoom(selected.id);setSelected(null)}
    catch(cause){setDeleteError(cause instanceof Error?cause.message:"ลบห้องไม่สำเร็จ กรุณาลองอีกครั้ง")}
    finally{setDeleting(false)}
  }
  return <AppShell title="แดชบอร์ดครู"><main className="dashboard-shell">
    <div className="page-heading"><div><p className="eyebrow">ภาพรวมห้องเรียน</p><h1>สวัสดี{store.profile?` ครู${store.profile.nickname}`:"คุณครู"}</h1><p>เลือกห้องเดิมหรือสร้างห้องใหม่เพื่อเริ่มกิจกรรม</p></div><div className="teacher-heading-actions">{store.profile&&<button className="teacher-profile-link" onClick={()=>router.push("/teacher/profile")}><TeacherProfileBadge profile={store.profile}/><span>แก้ไขโปรไฟล์</span></button>}<button className="primary-button compact" onClick={()=>router.push("/teacher/classrooms/new")}><CirclePlus size={20}/>สร้างห้องใหม่</button></div></div>
    <section className="stats-row"><article><span><DoorOpen/></span><div><strong>{rooms.filter(room=>room.status!=="ENDED").length}</strong><small>ห้องที่เปิดอยู่</small></div></article><article><span><UsersRound/></span><div><strong>{rooms.reduce((count,room)=>count+room.students.length,0)}</strong><small>นักเรียนทั้งหมด</small></div></article><article><span><BarChart3/></span><div><strong>{rooms.reduce((total,room)=>total+room.students.reduce((score,student)=>score+student.totalScore,0),0)}</strong><small>คะแนนรวม</small></div></article></section>
    <div className="section-title"><h2>ห้องเรียนของฉัน</h2><span>{rooms.length} ห้อง</span></div>
    <section className="room-list">{rooms.length?rooms.map(room=><article className="room-row room-row-manage" key={room.id}><button className="room-open" onClick={()=>router.push(`/teacher/classrooms/${room.id}`)} aria-label={`เปิดห้อง ${room.name}`}><span className={`status-dot ${room.status.toLowerCase()}`}/><span className="room-main"><strong>{room.name}</strong><small>{room.subject}</small></span><span className="room-meta"><span><UsersRound size={16}/>{room.students.length} คน</span><span><Clock3 size={16}/>{room.status==="OPEN"?"เปิดรับนักเรียน":room.status==="RUNNING"?"กำลังทดลอง":room.status==="PAUSED"?"หยุดชั่วคราว":"จบแล้ว"}</span></span><code>{room.code}</code><ChevronRight/></button><button className="room-delete" onClick={()=>{setDeleteError("");setSelected(room)}} aria-label={`ลบห้อง ${room.name}`} title={`ลบห้อง ${room.name}`}><Trash2 size={20}/></button></article>):<div className="mini-empty"><DoorOpen/><strong>ยังไม่มีห้องเรียน</strong><span>สร้างห้องใหม่เพื่อเริ่มออกโจทย์และแชร์ QR</span></div>}</section>
  </main><AlertDialog open={!!selected} onOpenChange={open=>{if(!open&&!deleting){setSelected(null);setDeleteError("")}}}><AlertDialogContent className="delete-room-dialog"><AlertDialogTitle>ลบห้อง “{selected?.name}”?</AlertDialogTitle><AlertDialogDescription>นักเรียนจะเข้าห้องนี้ไม่ได้อีก และข้อมูลที่นั่ง คะแนน ผลการทดลอง และโจทย์ของห้องนี้จะถูกลบถาวร</AlertDialogDescription>{deleteError&&<p className="error-box" role="alert">{deleteError}</p>}<AlertDialogFooter><AlertDialogCancel disabled={deleting}>ยกเลิก</AlertDialogCancel><button type="button" className="delete-room-confirm" disabled={deleting} onClick={confirmDelete}>{deleting?"กำลังลบ…":"ลบห้องถาวร"}</button></AlertDialogFooter></AlertDialogContent></AlertDialog></AppShell>;
}
