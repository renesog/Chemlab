"use client";
import { LevelResults } from "@/components/level-results";
import { levelResults } from "@/lib/result-summary";
import { AppShell } from "@/components/app-shell";
import { currentStudentFrom, useDemo } from "@/lib/demo-store";
import { finishedLevels } from "@/lib/live-game";
import { CheckCircle2, RotateCcw, SkipForward, Trophy } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Results(){
  const store=useDemo();const router=useRouter();const{room,student}=currentStudentFrom(store);
  if(!store.ready)return <AppShell title="สรุปผล"><main className="empty-state">กำลังโหลดผลการทดลอง…</main></AppShell>;
  if(!room||!student)return <AppShell title="สรุปผล"><main className="empty-state"><h1>ไม่พบผลการทดลอง</h1></main></AppShell>;
  const ids=room.activity.levelIds;
  const passed=ids.filter(id=>student.completed.includes(id));
  const skipped=ids.filter(id=>student.skipped?.includes(id));
  const done=finishedLevels(student,ids);
  const total=levelResults(room,student).reduce((sum,row)=>sum+row.maxScore,0);
  return <AppShell title="สรุปผล"><main className="center-shell"><section className="result-card">
    <div className="result-trophy"><Trophy/></div><p className="eyebrow">{done?"ทำกิจกรรมครบแล้ว":"ความคืบหน้าของฉัน"}</p><h1>ผลการทดลองของ {student.nickname}</h1>
    <p>“{room.activity.title}” ทำแล้ว {passed.length+skipped.length} / {ids.length} ข้อ</p>
    <strong className="big-score">{student.totalScore}<small> / {total} คะแนน</small></strong>
    <div className="result-stats"><span><CheckCircle2/>ผ่าน {passed.length} ข้อ</span><span><SkipForward/>ข้าม {skipped.length} ข้อ</span><span><RotateCcw/>ลองผิด {student.wrongAttempts} ครั้ง</span></div>
    {skipped.length>0&&<p className="result-skipped-list">ข้อที่ข้าม: {skipped.map(id=>ids.indexOf(id)+1).join(", ")} · ได้ 0 คะแนน</p>}
    {room.status==="ENDED"&&!done&&<p>คุณครูจบกิจกรรมแล้ว ผลนี้เป็นคะแนนจากข้อที่ทำเสร็จ</p>}
    <LevelResults room={room} student={student}/>
    {!done&&room.status!=="ENDED"&&<button className="primary-button" onClick={()=>router.push("/student/lab")}>ทำกิจกรรมต่อ</button>}
    <button className={done?"primary-button":"secondary-button"} onClick={()=>router.push("/student/classroom")}>กลับห้องเรียน</button>
  </section></main></AppShell>;
}
