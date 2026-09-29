"use client";

import { LevelResults } from "@/components/level-results";
import { resultsCsv } from "@/lib/result-summary";
import { AppShell } from "@/components/app-shell";
import { useDemo } from "@/lib/demo-store";
import { finishedLevels } from "@/lib/live-game";
import { Download } from "lucide-react";
import { useParams } from "next/navigation";

export default function Report(){
  const{id}=useParams<{id:string}>();
  const{rooms}=useDemo();
  const room=rooms.find(r=>r.id===id);
  const levelNumber=(levelId:number)=>room?Math.max(1,room.activity.levelIds.indexOf(levelId)+1):1;
  function csv(){
    if(!room)return;
    const rows=[["nickname","desk","level","score","wrong_attempts","passed","skipped","skipped_questions","finished"],...room.students.map(s=>[s.nickname,room.desks.find(d=>d.id===s.deskId)?.label??"",levelNumber(s.currentLevel),s.totalScore,s.wrongAttempts,s.completed.length,s.skipped?.length??0,(s.skipped??[]).map(levelNumber).join(";"),finishedLevels(s,room.activity.levelIds)])];
    const blob=new Blob(["\uFEFF"+rows.map(r=>r.map(v=>`"${String(v).replaceAll('"','""')}"`).join(",")).join("\n")],{type:"text/csv;charset=utf-8"});
    const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=`chemclass-${room.code}.csv`;a.click();URL.revokeObjectURL(a.href);
  }
  function detailedCsv(){
    if(!room)return;
    const blob=new Blob([resultsCsv(room)],{type:"text/csv;charset=utf-8"});
    const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="chemclass-"+room.code+"-levels.csv";a.click();URL.revokeObjectURL(a.href);
  }
  if(!room)return <AppShell title="รายงาน"><main className="empty-state"><h1>ไม่พบห้องเรียน</h1></main></AppShell>;
  return <AppShell title="รายงานผล" back={`/teacher/classrooms/${id}`}><main className="dashboard-shell"><div className="page-heading"><div><p className="eyebrow">รายงานผล</p><h1>{room.name}</h1><p>คะแนนและความก้าวหน้าล่าสุดของนักเรียน</p></div><button className="primary-button compact" onClick={csv}><Download/>ดาวน์โหลด CSV</button></div><section className="panel table-wrap"><table><thead><tr><th>นักเรียน</th><th>โต๊ะ</th><th>ด่านปัจจุบัน</th><th>คะแนน</th><th>ตอบผิด</th><th>ผ่านแล้ว</th><th>ข้าม</th><th>สถานะ</th></tr></thead><tbody>{room.students.length?room.students.map(s=><tr key={s.id}><td><strong>{s.nickname}</strong></td><td>{room.desks.find(d=>d.id===s.deskId)?.label??"—"}</td><td>{levelNumber(s.currentLevel)}/{room.activity.levelIds.length}</td><td>{s.totalScore}</td><td>{s.wrongAttempts}</td><td>{s.completed.length} ด่าน</td><td>{s.skipped?.length??0} ข้อ</td><td>{finishedLevels(s,room.activity.levelIds)?"ทำครบแล้ว":"ยังไม่ครบ"}</td></tr>):<tr><td colSpan={8} className="table-empty">ยังไม่มีผลการทดลอง</td></tr>}</tbody></table></section><section className="panel level-report"><div className="section-title"><h2>รายละเอียดรายด่าน</h2><button onClick={detailedCsv}><Download/>CSV รายด่าน</button></div>{room.students.map(student=><details key={student.id}><summary>{student.nickname} · {student.totalScore} คะแนน</summary><LevelResults room={room} student={student}/></details>)}</section></main></AppShell>;
}
