"use client";

import { AppShell, LoadingState, StepIndicator } from "@/components/app-shell";
import { Avatar } from "@/components/avatar";
import { currentStudentFrom, useDemo } from "@/lib/demo-store";
import type { Avatar as AvatarType } from "@/lib/types";
import { useState } from "react";
import { useRouter } from "next/navigation";

const options=[
  {key:"gender",label:"ตัวละคร",values:[["boy","ผู้ชาย"],["girl","ผู้หญิง"]]},
  {key:"skin",label:"สีผิว",values:[["light","สว่าง"],["medium","กลาง"],["deep","เข้ม"]]},
  {key:"hair",label:"ทรงผม",values:[["short","สั้น"],["wave","ลอน"],["spike","ตั้ง"]]},
  {key:"hairColor",label:"สีผม",values:[["black","ดำ"],["brown","น้ำตาล"],["blue","น้ำเงิน"]]},
  {key:"shirt",label:"สีเสื้อ",values:[["cyan","ฟ้า"],["navy","กรม"],["yellow","เหลือง"],["coral","ส้ม"]]},
  {key:"hat",label:"หมวก",values:[["none","ไม่ใส่"],["cap","หมวกแก๊ป"],["lab","หมวกแล็บ"]]},
] as const;

export default function AvatarCreator(){
  const store=useDemo();const router=useRouter();const{student}=currentStudentFrom(store);
  const[value,setValue]=useState<AvatarType>(student?.avatar??{gender:"boy",skin:"medium",hair:"short",hairColor:"black",shirt:"cyan",hat:"none"});
  const[error,setError]=useState("");const[busy,setBusy]=useState(false);
  if(!store.ready)return <AppShell title="สร้างตัวละคร"><LoadingState/></AppShell>;
  if(!student)return <AppShell title="สร้างตัวละคร"><main className="empty-state"><h1>ต้องเข้าห้องเรียนอีกครั้ง</h1><p>{store.error||"กรุณาสแกน QR หรือเปิดลิงก์ห้องจากคุณครู"}</p><button className="primary-button" onClick={()=>router.push("/join")}>เข้าห้องเรียน</button></main></AppShell>;
  async function save(){setBusy(true);setError("");try{await store.updateAvatar(value);router.push("/student/classroom")}catch(cause){setError(cause instanceof Error?cause.message:"บันทึกตัวละครไม่ได้")}finally{setBusy(false)}}
  return <AppShell title="สร้างตัวละคร" back="/join"><main className="narrow-shell"><StepIndicator current={2} items={["เข้าห้อง","สร้างตัวละคร","เลือกที่นั่ง"]}/><div className="page-heading"><div><p className="eyebrow">สร้างตัวละคร</p><h1>แต่งตัวละครของ {student.nickname}</h1><p>เลือกเพศ สีผิว ทรงผม เสื้อ และหมวกให้เป็นตัวคุณ</p></div></div><section className="avatar-builder panel"><div className="avatar-stage"><Avatar value={value} size={180}/><strong>{student.nickname}</strong><small>ตัวอย่างตัวละครของคุณ</small></div><div className="avatar-options">{options.map(group=><fieldset key={group.key}><legend>{group.label}</legend><div className="chip-row">{group.values.map(([id,label])=><button type="button" key={id} aria-pressed={value[group.key]===id} className={value[group.key]===id?"active":""} onClick={()=>setValue(current=>({...current,[group.key]:id}))}>{label}</button>)}</div></fieldset>)}{error&&<p className="error-box" role="alert">{error}</p>}<button className="primary-button" disabled={busy} onClick={save}>{busy?"กำลังบันทึก…":"บันทึกและไปเลือกที่นั่ง"}</button></div></section></main></AppShell>;
}
