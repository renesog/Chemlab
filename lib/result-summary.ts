import type { Classroom, Student } from "./types";
import { LEVELS } from "./levels.ts";
import { LEGACY_LEVELS } from "./legacy-levels.ts";

export function levelResults(room: Classroom, student: Student) {
  const catalog = room.activity.mode === "QUESTIONS" ? room.activity.customQuestions ?? [] : room.catalogVersion === 2 ? LEVELS : LEGACY_LEVELS;
  return room.activity.levelIds.map((id,index) => {
    const saved = student.resultsByLevel?.[id];
    const status = student.completed.includes(id) ? "ผ่าน" : student.skipped?.includes(id) ? "ข้าม" : "ยังไม่จบ";
    const custom = room.activity.customQuestions?.find(item => item.id === id);
    return { id, number:index+1, title:catalog.find(item=>item.id===id)?.title??`ด่าน ${index+1}`, status,
      score:saved?.score??(status==="ข้าม"?0:null), maxScore:custom?.maxPoints??room.activity.pointsByLevel[id]??5,
      attempts:saved?.attempts??(student.attemptsByLevel?.[id]??0)+(status==="ผ่าน"?1:0),
      wrongAttempts:saved?.wrongAttempts??student.attemptsByLevel?.[id]??0,
      elapsedMs:saved?.elapsedMs??null };
  });
}

export function durationLabel(ms: number | null) {
  if(ms===null)return "—";
  const seconds=Math.floor(ms/1000);
  return `${Math.floor(seconds/60)}:${String(seconds%60).padStart(2,"0")}`;
}

export function resultsCsv(room: Classroom) {
  const rows: unknown[][] = [["nickname","question","title","status","score","max_score","attempts","wrong_attempts","elapsed_seconds"]];
  for(const student of room.students) for(const result of levelResults(room,student)) {
    rows.push([student.nickname,result.number,result.title,result.status,result.score??"",result.maxScore,result.attempts,result.wrongAttempts,result.elapsedMs===null?"":Math.floor(result.elapsedMs/1000)]);
  }
  const escape=(value:unknown)=>{
    const text=String(value);
    const safe=/^[\s]*[=+@-]/.test(text)?"'"+text:text;
    return '"'+safe.replaceAll('"','""')+'"';
  };
  return "\uFEFF"+rows.map(row=>row.map(escape).join(",")).join("\r\n");
}
