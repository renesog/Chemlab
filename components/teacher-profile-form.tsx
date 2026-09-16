"use client";

import type { TeacherProfile } from "@/lib/types";
import { Atom, BookOpen, FlaskConical } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

const icons=[{id:"flask",label:"ขวดทดลอง",Icon:FlaskConical},{id:"atom",label:"อะตอม",Icon:Atom},{id:"book",label:"หนังสือ",Icon:BookOpen}] as const;
const colors=[{id:"cyan",label:"ฟ้า"},{id:"navy",label:"กรมท่า"},{id:"gold",label:"ทอง"}] as const;

export function TeacherProfileBadge({profile}:{profile:TeacherProfile}){
  const Icon=icons.find(item=>item.id===profile.avatar)?.Icon??FlaskConical;
  return <span className={`teacher-profile-badge ${profile.color}`}><Icon aria-hidden="true"/></span>;
}

export function TeacherProfileForm({initial,email,submitLabel}:{initial?:TeacherProfile;email:string;submitLabel:string}){
  const router=useRouter();
  const [draft,setDraft]=useState<TeacherProfile>(initial??{nickname:"",avatar:"flask",color:"cyan"});
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState("");
  async function submit(event:FormEvent<HTMLFormElement>){
    event.preventDefault();setBusy(true);setError("");
    try{const response=await fetch("/api/teacher/profile",{method:"PUT",headers:{"content-type":"application/json"},body:JSON.stringify(draft)});const data=await response.json() as {error?:string};if(!response.ok)throw new Error(data.error??"บันทึกโปรไฟล์ไม่สำเร็จ");router.push("/teacher/dashboard");router.refresh()}
    catch(cause){setError(cause instanceof Error?cause.message:"บันทึกโปรไฟล์ไม่สำเร็จ")}finally{setBusy(false)}
  }
  return <form className="form-stack teacher-profile-form" onSubmit={submit}><p className="muted">บัญชี {email}</p><div className="profile-preview"><TeacherProfileBadge profile={draft}/><div><strong>{draft.nickname.trim()||"ชื่อเล่นของคุณครู"}</strong><small>โปรไฟล์ที่นักเรียนจะเห็น</small></div></div><label>ชื่อเล่นครู<input value={draft.nickname} onChange={event=>setDraft({...draft,nickname:event.target.value})} minLength={2} maxLength={32} required placeholder="เช่น ครูจูเลีย"/></label><fieldset><legend>ไอคอนโปรไฟล์</legend><div className="profile-choices">{icons.map(({id,label,Icon})=><button type="button" key={id} aria-pressed={draft.avatar===id} className={draft.avatar===id?"active":""} onClick={()=>setDraft({...draft,avatar:id})}><Icon aria-hidden="true"/>{label}</button>)}</div></fieldset><fieldset><legend>สีโปรไฟล์</legend><div className="profile-colors">{colors.map(({id,label})=><button type="button" key={id} aria-pressed={draft.color===id} className={`profile-color ${id} ${draft.color===id?"active":""}`} onClick={()=>setDraft({...draft,color:id})}>{label}</button>)}</div></fieldset>{error&&<p className="error-box" role="alert">{error}</p>}<button className="primary-button" type="submit" disabled={busy}>{busy?"กำลังบันทึก…":submitLabel}</button></form>;
}
