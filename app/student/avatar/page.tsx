"use client";

import { AppShell, LoadingState } from "@/components/app-shell";
import { Avatar, avatarColors } from "@/components/avatar";
import { currentStudentFrom, useDemo } from "@/lib/demo-store";
import type { Avatar as AvatarType, Student } from "@/lib/types";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Check, FlaskConical, LoaderCircle, Shuffle, SlidersHorizontal } from "lucide-react";

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
  if(!store.ready)return <AppShell title="สร้างตัวละคร"><LoadingState/></AppShell>;
  if(!student)return <AppShell title="สร้างตัวละคร"><main className="empty-state"><h1>ต้องเข้าห้องเรียนอีกครั้ง</h1><p>{store.error||"กรุณาสแกน QR หรือเปิดลิงก์ห้องจากคุณครู"}</p><button className="primary-button" onClick={()=>router.push("/join")}>เข้าห้องเรียน</button></main></AppShell>;
  return <CharacterEditor key={student.id} student={student} onSave={store.updateAvatar}/>;
}

function CharacterEditor({student,onSave}:{student:Student;onSave:(value:AvatarType)=>Promise<void>}){
  const router=useRouter();
  const[value,setValue]=useState<AvatarType>(()=>({...student.avatar,gender:student.avatar.gender??"boy",hairColor:student.avatar.hairColor??"black",hat:student.avatar.hat??"none"}));
  const[error,setError]=useState("");
  const[busy,setBusy]=useState(false);
  async function save(){
    if(busy)return;
    setBusy(true);setError("");
    try{await onSave(value);router.push("/student/classroom")}
    catch(cause){setError(cause instanceof Error?cause.message:"บันทึกตัวละครไม่ได้");setBusy(false)}
  }
  function randomize(){
    setValue(current=>{
      const next={...current};
      for(const group of options){
        const id=group.values[Math.floor(Math.random()*group.values.length)][0];
        Object.assign(next,{[group.key]:id});
      }
      return next;
    });
  }
  return <AppShell title="สร้างตัวละคร" back="/join">
    <main className="character-creator">
      <header className="character-heading">
        <p className="eyebrow"><FlaskConical size={16} aria-hidden="true"/>เตรียมพร้อมเข้าห้องทดลอง</p>
        <h1>สร้างตัวละครของคุณ</h1>
        <p>ปรับแต่งตัวละครก่อนเลือกที่นั่งในห้องเรียน</p>
        <ol className="character-steps" aria-label="ขั้นตอนการเข้าห้องเรียน">
          <li className="is-complete"><Check size={14} aria-hidden="true"/>เข้าห้อง</li>
          <li aria-current="step"><span>2</span>สร้างตัวละคร</li>
          <li><span>3</span>เลือกที่นั่ง</li>
        </ol>
      </header>
      <div className="character-layout">
        <section className="character-preview" aria-label="ตัวอย่างตัวละครของคุณ">
          <div className="character-preview-heading"><span>ตัวอย่างตัวละครของคุณ</span><span className="character-preview-badge">พรีวิวทันที</span></div>
          <div className="character-portrait"><Avatar value={value} size={280}/></div>
          <div className="character-identity"><h2>{student.nickname}</h2><p>พร้อมเข้าห้องเรียนแล้ว</p></div>
          <button className="character-random" type="button" disabled={busy} onClick={randomize}><Shuffle size={16} aria-hidden="true"/>สุ่มตัวละคร</button>
          <div className="character-preview-note"><FlaskConical size={16} aria-hidden="true"/>นักทดลองคนใหม่ของห้องเรียน</div>
        </section>
        <form className="character-controls" aria-busy={busy} onSubmit={event=>{event.preventDefault();void save()}}>
          <div className="character-controls-heading"><SlidersHorizontal size={18} aria-hidden="true"/><h2>แต่งให้เป็นตัวคุณ</h2></div>
          {options.map(group=><fieldset key={group.key} disabled={busy}>
            <legend>{group.label}</legend>
            <div className={`character-choices choices-${group.key}`}>
              {group.values.map(([id,label])=>{
                const selected=value[group.key]===id;
                const palette=group.key==="skin"||group.key==="hairColor"||group.key==="shirt"?avatarColors[group.key]:null;
                const color=palette?.[id];
                const thumbnail=group.key==="hair"||group.key==="hat"||group.key==="gender";
                const preview={...value,[group.key]:id,...(group.key==="hair"?{hat:"none" as const}:{})};
                return <button type="button" key={id} aria-pressed={selected} aria-label={`${group.label}: ${label}`} title={label} className={`character-option${selected?" is-selected":""}`} onClick={()=>setValue(current=>({...current,[group.key]:id}))}>
                  {color&&<span className="character-swatch" style={{backgroundColor:color}} aria-hidden="true"/>}
                  {thumbnail&&<span className="character-thumbnail" aria-hidden="true"><Avatar value={preview} size={group.key==="gender"?36:54}/></span>}
                  <span>{label}</span>
                  {selected&&<Check className="character-option-check" size={12} aria-hidden="true"/>}
                </button>;
              })}
            </div>
          </fieldset>)}
          <div className="character-save">
            {error&&<p className="error-box" role="alert">{error}</p>}
            <button className="primary-button" disabled={busy} type="submit">{busy?<><LoaderCircle size={18} className="character-saving" aria-hidden="true"/>กำลังบันทึก…</>:<>บันทึกและไปเลือกที่นั่ง<ArrowRight size={18} aria-hidden="true"/></>}</button>
            <p>ขั้นตอนถัดไป: เลือกโต๊ะในห้องเรียน</p>
          </div>
        </form>
      </div>
    </main>
  </AppShell>;
}
