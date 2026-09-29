import type { Classroom, LevelResult } from "./types";
import type { PrivateQuestionKeys } from "./custom-questions";
import { elapsedLevelMs } from "./level-clock.ts";
import { reasoningFeedback, explanationFor, scoreForAttempts, scoreForCustomAttempts, validateSequence } from "./game.ts";

export function evaluateAttempt(current: Classroom, studentId: string, levelId: number, steps: string[], answerKeys: PrivateQuestionKeys = {}, now = Date.now()) {
  const student = current.students.find(s => s.id === studentId);
  if (current.status !== "RUNNING" || now < (current.gameStartsAt ?? 0) || !student?.deskId || student.currentLevel !== levelId || !current.activity.levelIds.includes(levelId) || student.completed.includes(levelId) || student.skipped?.includes(levelId)) throw new Error("activity_unavailable");
  const custom = current.activity.mode === "QUESTIONS" ? current.activity.customQuestions?.find(question => question.id === levelId) : undefined;
  const key = custom ? answerKeys[String(levelId)] : undefined;
  if (custom && !key) throw new Error("missing_answer_key");
  const correct = custom ? key!.steps.length === steps.length && key!.steps.every((step, index) => step === steps[index]) : validateSequence(levelId, steps, current.catalogVersion === 2 ? 2 : 1);
  const attempts = (student.attemptsByLevel?.[levelId] ?? 0) + (correct ? 0 : 1);
  const score = custom ? scoreForCustomAttempts(attempts, custom.correctPoints, custom.wrongPenalty, custom.maxPoints) : scoreForAttempts(attempts, current.activity.pointsByLevel[levelId] ?? 5);
  const index = current.activity.levelIds.indexOf(levelId);
  const outcome = { correct, score, feedback: correct ? `แยกสารสำเร็จ ได้ ${score} คะแนนในข้อนี้` : (custom ? "ลองทบทวนสมบัติของสารและลำดับการใช้อุปกรณ์" : reasoningFeedback(levelId, steps, current.catalogVersion === 2 ? 2 : 1, attempts)) + ` · คะแนนที่ยังได้ ${score}`, explanation: correct ? (custom ? key!.explanation : explanationFor(levelId, current.catalogVersion === 2 ? 2 : 1)) : "" };
  const elapsedMs = elapsedLevelMs(student, levelId, now);
  const result: LevelResult = { status: "passed", score, attempts: attempts + 1, wrongAttempts: attempts, elapsedMs, finishedAt: now };
  const room = { ...current, students: current.students.map(s => s.id === student.id ? { ...s, ...(correct ? { resultsByLevel: { ...s.resultsByLevel, [levelId]: result }, ...(s.levelClock ? { levelClock: { ...s.levelClock, elapsedMs: elapsedMs ?? 0, runningSince: null } } : {}) } : {}), wrongAttempts: s.wrongAttempts + (correct ? 0 : 1), attemptsByLevel: { ...s.attemptsByLevel, [levelId]: attempts }, totalScore: s.totalScore + (correct ? score : 0), completed: correct ? [...s.completed, levelId] : s.completed, currentLevel: correct ? current.activity.levelIds[index + 1] ?? levelId : s.currentLevel } : s) };
  return { room, outcome };
}

export function skipChallenge(current: Classroom, studentId: string, levelId: number, now = Date.now()): Classroom {
  const student = current.students.find(item => item.id === studentId);
  if (current.status !== "RUNNING" || now < (current.gameStartsAt ?? 0) || !student?.deskId || student.currentLevel !== levelId || !current.activity.levelIds.includes(levelId) || student.completed.includes(levelId) || student.skipped?.includes(levelId)) throw new Error("activity_unavailable");
  if ((student.attemptsByLevel?.[levelId] ?? 0) < 1) throw new Error("skip_requires_attempt");
  const index = current.activity.levelIds.indexOf(levelId);
  const elapsedMs = elapsedLevelMs(student, levelId, now);
  const result: LevelResult = { status: "skipped", score: 0, attempts: student.attemptsByLevel?.[levelId] ?? 0, wrongAttempts: student.attemptsByLevel?.[levelId] ?? 0, elapsedMs, finishedAt: now };
  return { ...current, students: current.students.map(item => item.id === student.id ? { ...item, resultsByLevel: { ...item.resultsByLevel, [levelId]: result }, ...(item.levelClock ? { levelClock: { ...item.levelClock, elapsedMs: elapsedMs ?? 0, runningSince: null } } : {}), skipped: [...(item.skipped ?? []), levelId], currentLevel: current.activity.levelIds[index + 1] ?? levelId } : item) };
}
