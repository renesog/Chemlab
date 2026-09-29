import type { Classroom, Student } from "@/lib/types";
import { durationLabel, levelResults } from "@/lib/result-summary";

export function LevelResults({ room, student }: { room: Classroom; student: Student }) {
  return <div className="level-results"><div className="table-wrap" tabIndex={0} role="region" aria-label={`ผลรายด่านของ ${student.nickname}`}><table><caption>ผลการทดลองแต่ละด่าน</caption><thead><tr><th>ด่าน</th><th>สถานะ</th><th>คะแนน</th><th>ส่งคำตอบ</th><th>เวลา</th></tr></thead><tbody>{levelResults(room,student).map(result=><tr key={result.id}><td>{result.number}. {result.title}</td><td>{result.status}</td><td>{result.score??"—"} / {result.maxScore}</td><td>{result.attempts} ครั้ง</td><td>{durationLabel(result.elapsedMs)}</td></tr>)}</tbody></table></div><p>เวลาไม่รวมช่วงพักและนับถอยหลัง · — หมายถึงยังไม่มีข้อมูลที่บันทึกไว้</p></div>;
}
