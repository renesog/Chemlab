"use client";
import { AppShell } from "@/components/app-shell";
import { currentStudentFrom, useDemo } from "@/lib/demo-store";
import { CheckCircle2, RotateCcw, Trophy } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Results(){const store=useDemo();const router=useRouter();const{student}=currentStudentFrom(store);if(!student)return <AppShell title="สรุปผล"><main className="empty-state"><h1>ไม่พบผลการทดลอง</h1></main></AppShell>;return <AppShell title="สรุปผล"><main className="center-shell"><section className="result-card"><div className="result-trophy"><Trophy/></div><p className="eyebrow">ภารกิจเสร็จสมบูรณ์</p><h1>เก่งมาก {student.nickname}!</h1><p>คุณผ่านการทดลองแยกสารครบทั้ง 8 ด่านแล้ว</p><strong className="big-score">{student.totalScore}<small> / 40 คะแนน</small></strong><div className="result-stats"><span><CheckCircle2/>ผ่าน {student.completed.length} ด่าน</span><span><RotateCcw/>ลองผิด {student.wrongAttempts} ครั้ง</span></div><button className="primary-button" onClick={()=>router.push("/student/classroom")}>กลับห้องเรียน</button></section></main></AppShell>}
