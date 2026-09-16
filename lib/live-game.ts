import type { Classroom, Student } from "./types";

export function finishedLevels(student:Student,levelIds:number[]){return levelIds.every(id=>student.completed.includes(id)||student.skipped?.includes(id))}

export function countdownSeconds(room:Pick<Classroom,"status"|"gameStartsAt">,now:number){
  if(room.status!=="RUNNING"||!room.gameStartsAt)return 0;
  return Math.max(0,Math.min(3,Math.ceil((room.gameStartsAt-now)/1000)));
}
export function gameIsLive(room:Pick<Classroom,"status"|"gameStartsAt">,now:number){
  return room.status==="RUNNING"&&now>=(room.gameStartsAt??0);
}
export function rankedStudents(students:Student[]){
  return [...students].sort((a,b)=>b.totalScore-a.totalScore||b.completed.length-a.completed.length||a.wrongAttempts-b.wrongAttempts||a.nickname.localeCompare(b.nickname,"th"));
}
