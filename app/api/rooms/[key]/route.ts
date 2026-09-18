export const dynamic = "force-dynamic";
import { findRoom, json, mutateRoom, parseRoom, rateAllowed } from "@/db/live-rooms";
import { adminDb } from "@/lib/firebase/admin";
import type { ActivityConfig, Avatar, Classroom, Student } from "@/lib/types";
import { explanationFor, scoreForAttempts, scoreForCustomAttempts, validateSequence } from "@/lib/game";
import { getTeacherUser } from "@/lib/auth";
import { findQuestionKeys } from "@/db/question-keys";

type Body = { action: string; token?: string; nickname?: string; avatar?: Avatar; deskId?: string; studentId?: string; status?: Classroom["status"]; activity?: ActivityConfig; locked?: boolean; levelId?: number; steps?: string[] };
const defaultAvatar: Avatar = { gender: "boy", skin: "medium", hair: "short", hairColor: "black", shirt: "cyan", hat: "none" };

export async function GET(_: Request, { params }: { params: Promise<{ key: string }> }) {
  const { key } = await params;
  const row = await findRoom(key);
  return row ? json({ room: parseRoom(row) }) : json({ error: "ไม่พบห้องเรียน" }, 404);
}

export async function PATCH(request: Request, { params }: { params: Promise<{ key: string }> }) {
  const { key } = await params;
  let body: Body;
  try { body = await request.json(); } catch { return json({ error: "ข้อมูลไม่ถูกต้อง" }, 400); }
  const row = await findRoom(key);
  if (!row) return json({ error: "ไม่พบห้องเรียน หรือห้องถูกปิดแล้ว" }, 404);

  if (body.action === "join") {
    const address = request.headers.get("x-forwarded-for")?.split(',')[0]?.trim() ?? "local";
    if (!(await rateAllowed(`join:${row.id}:${address}`, 30))) return json({ error: "เข้าห้องถี่เกินไป กรุณารอสักครู่" }, 429);
    const nickname = body.nickname?.trim();
    if (!nickname || nickname.length < 2 || nickname.length > 24) return json({ error: "ชื่อเล่นต้องมี 2–24 ตัวอักษร" }, 400);
    const student: Student = { id: crypto.randomUUID(), nickname, avatar: defaultAvatar, handRaised: false, currentLevel: parseRoom(row).activity.levelIds[0] ?? 1, totalScore: 0, wrongAttempts: 0, completed: [], skipped: [] };
    const token = crypto.randomUUID() + crypto.randomUUID();
    const room = await mutateRoom(row.id, current => { if (current.status === "ENDED") throw new Error("room_ended"); return { ...current, students: [...current.students, student] }; });
    try {
      await adminDb.collection('rooms').doc(row.id).collection('studentTokens').doc(token).set({ studentId: student.id, createdAt: Date.now() });
    } catch {}
    return json({ room, student, token });
  }

  // Verify student session via Firestore subcollection
  let session: { student_id: string } | null = null;
  if (body.token) {
    try {
      const tokenDoc = await adminDb.collection('rooms').doc(row.id).collection('studentTokens').doc(body.token).get();
      if (tokenDoc.exists) {
        session = { student_id: tokenDoc.data()!.studentId };
      }
    } catch {}
  }
  const user = session ? null : await getTeacherUser();
  const teacher = !session && (row.ownerUserId ? user?.userId === row.ownerUserId : body.token === row.teacherToken);
  if (!teacher && !session) return json({ error: "เซสชันหมดอายุ กรุณาสแกน QR อีกครั้ง" }, 401);

  if (body.action === "resume" && session) {
    const current = parseRoom(row);
    return current.students.some(student => student.id === session!.student_id) ? json({ room: current }) : json({ error: "ไม่พบนักเรียนในห้องนี้ กรุณาเข้าห้องอีกครั้ง" }, 401);
  }

  if (body.action === "hint" && !teacher) {
    if (!session || !Number.isInteger(body.levelId)) return json({ error: "ข้อมูลคำใบ้ไม่ถูกต้อง" }, 400);
    if (!(await rateAllowed(`hint:${row.id}:${session.student_id}`, 15))) return json({ error: "ขอคำใบ้ถี่เกินไป" }, 429);
    const current = parseRoom(row);
    const student = current.students.find(item => item.id === session!.student_id);
    if (!current.activity.hintsEnabled || current.status !== "RUNNING" || !student || student.currentLevel !== body.levelId || student.completed.includes(body.levelId!) || student.skipped?.includes(body.levelId!)) return json({ error: "คำใบ้ยังไม่พร้อม" }, 403);
    const hint = current.activity.mode === "QUESTIONS" ? (await findQuestionKeys(row.id))[String(body.levelId)]?.hint : presetHint(body.levelId!);
    return hint ? json({ hint }) : json({ error: "ข้อสอบนี้ไม่มีคำใบ้" }, 404);
  }

  if (session && (body.action === "hand" || body.action === "attempt") && !(await rateAllowed(`${body.action}:${row.id}:${session.student_id}`, body.action === "hand" ? 12 : 30))) return json({ error: "ทำรายการถี่เกินไป กรุณารอสักครู่" }, 429);

  try {
    if (body.action === "skip" && !teacher) {
      if (!session || !Number.isInteger(body.levelId)) return json({ error: "ข้อมูลข้อที่ข้ามไม่ถูกต้อง" }, 400);
      if (!(await rateAllowed(`skip:${row.id}:${session.student_id}`, 12))) return json({ error: "ข้ามข้อถี่เกินไป กรุณารอสักครู่" }, 429);
      const room = await mutateRoom(row.id, current => {
        const student = current.students.find(item => item.id === session!.student_id);
        const levelId = body.levelId!;
        if (current.status !== "RUNNING" || Date.now() < (current.gameStartsAt ?? 0) || !student?.deskId || student.currentLevel !== levelId || !current.activity.levelIds.includes(levelId) || student.completed.includes(levelId) || student.skipped?.includes(levelId)) throw new Error("activity_unavailable");
        if ((student.attemptsByLevel?.[levelId] ?? 0) < 1) throw new Error("skip_requires_attempt");
        const index = current.activity.levelIds.indexOf(levelId);
        return { ...current, students: current.students.map(item => item.id === student.id ? { ...item, skipped: [...(item.skipped ?? []), levelId], currentLevel: current.activity.levelIds[index + 1] ?? levelId } : item) };
      });
      return json({ room });
    }
    if (body.action === "attempt" && !teacher) {
      if (!session || !Number.isInteger(body.levelId) || !Array.isArray(body.steps) || body.steps.length > 12 || body.steps.some(step => typeof step !== "string" || step.length > 50)) return json({ error: "คำตอบไม่ถูกต้อง" }, 400);
      const answerKeys = parseRoom(row).activity.mode === "QUESTIONS" ? await findQuestionKeys(row.id) : {};
      let outcome = { correct: false, feedback: "", score: 1, explanation: "" };
      const room = await mutateRoom(row.id, current => {
        const student = current.students.find(s => s.id === session!.student_id);
        const levelId = body.levelId!;
        if (current.status !== "RUNNING" || Date.now() < (current.gameStartsAt ?? 0) || !student?.deskId || student.currentLevel !== levelId || !current.activity.levelIds.includes(levelId) || student.completed.includes(levelId) || student.skipped?.includes(levelId)) throw new Error("activity_unavailable");
        const custom = current.activity.mode === "QUESTIONS" ? current.activity.customQuestions?.find(question => question.id === levelId) : undefined;
        const key = custom ? answerKeys[String(levelId)] : undefined;
        if (custom && !key) throw new Error("missing_answer_key");
        const correct = custom ? key!.steps.length === body.steps!.length && key!.steps.every((step, index) => step === body.steps![index]) : validateSequence(levelId, body.steps!, current.catalogVersion === 2 ? 2 : 1);
        const attempts = (student.attemptsByLevel?.[levelId] ?? 0) + (correct ? 0 : 1);
        const score = custom ? scoreForCustomAttempts(attempts, custom.correctPoints, custom.wrongPenalty, custom.maxPoints) : scoreForAttempts(attempts, current.activity.pointsByLevel[levelId] ?? 5);
        const index = current.activity.levelIds.indexOf(levelId);
        outcome = { correct, score, feedback: correct ? `แยกสารสำเร็จ ได้ ${score} คะแนนในข้อนี้` : `แผนยังไม่ถูกต้อง คะแนนที่ยังได้ ${score} — ลองปรับอุปกรณ์หรือลำดับแล้วทดลองใหม่`, explanation: correct ? (custom ? key!.explanation : explanationFor(levelId, current.catalogVersion === 2 ? 2 : 1)) : "" };
        return { ...current, students: current.students.map(s => s.id === student.id ? { ...s, wrongAttempts: s.wrongAttempts + (correct ? 0 : 1), attemptsByLevel: { ...s.attemptsByLevel, [levelId]: attempts }, totalScore: s.totalScore + (correct ? score : 0), completed: correct ? [...s.completed, levelId] : s.completed, currentLevel: correct ? current.activity.levelIds[index + 1] ?? levelId : s.currentLevel } : s) };
      });
      return json({ room, ...outcome });
    }
    const room = await mutateRoom(row.id, current => applyAction(current, body, teacher, session?.student_id));
    return json({ room });
  } catch (error) {
    const message = error instanceof Error ? error.message : "update_failed";
    return json({ error: message === "desk_unavailable" ? "โต๊ะนี้ไม่ว่าง กรุณาเลือกโต๊ะอื่น" : message === "desk_locked" ? "ครูล็อกโต๊ะนี้แล้ว จึงยังย้ายไม่ได้" : message === "skip_requires_attempt" ? "ลองส่งคำตอบอย่างน้อยหนึ่งครั้งก่อนข้ามข้อนี้" : "อัปเดตห้องไม่สำเร็จ กรุณาลองอีกครั้ง" }, 409);
  }
}

function applyAction(room: Classroom, body: Body, teacher: boolean, studentId?: string) {
  if (teacher) {
    if (body.action === "status" && body.status && ["OPEN", "RUNNING", "PAUSED", "ENDED"].includes(body.status) && room.status !== "ENDED") return { ...room, status: body.status, gameStartsAt: body.status === "RUNNING" && room.status !== "RUNNING" ? Date.now() + 6000 : room.gameStartsAt };
    if (body.action === "activity" && body.activity && room.status === "OPEN" && typeof body.activity.title === "string" && body.activity.title.trim().length >= 2 && body.activity.title.length <= 60 && ["PRESET", "CUSTOM"].includes(body.activity.mode) && Array.isArray(body.activity.levelIds) && body.activity.levelIds.length > 0 && body.activity.levelIds.length <= 8 && new Set(body.activity.levelIds).size === body.activity.levelIds.length && body.activity.levelIds.every(id => Number.isInteger(id) && id >= 1 && id <= 8 && Number.isInteger(body.activity!.pointsByLevel[id]) && body.activity!.pointsByLevel[id] >= 1 && body.activity!.pointsByLevel[id] <= 20)) return { ...room, activity: { mode: body.activity.mode, title: body.activity.title, levelIds: body.activity.levelIds, pointsByLevel: body.activity.pointsByLevel, hintsEnabled: body.activity.hintsEnabled === true }, students: room.students.map(s => ({ ...s, currentLevel: body.activity!.levelIds[0], totalScore: 0, wrongAttempts: 0, attemptsByLevel: {}, completed: [], skipped: [] })) };
    if (body.action === "deskLock" && body.deskId && typeof body.locked === "boolean") return { ...room, desks: room.desks.map(d => d.id === body.deskId ? { ...d, locked: body.locked! } : d) };
    if (body.action === "allLocks" && typeof body.locked === "boolean") return { ...room, desks: room.desks.map(d => ({ ...d, locked: body.locked! })) };
    if (body.action === "moveStudent" && body.studentId && body.deskId) { const student = room.students.find(s => s.id === body.studentId); const target = room.desks.find(d => d.id === body.deskId); if (!student || !target || target.occupantId && target.occupantId !== student.id) throw new Error("desk_unavailable"); return { ...room, desks: room.desks.map(d => d.id === target.id ? { ...d, occupantId: student.id } : d.occupantId === student.id ? { ...d, occupantId: undefined } : d), students: room.students.map(s => s.id === student.id ? { ...s, deskId: target.id } : s) }; }
    throw new Error("invalid_teacher_action");
  }
  if (!studentId) throw new Error("unauthorized");
  if (body.action === "avatar" && body.avatar && ["boy", "girl"].includes(body.avatar.gender) && ["none", "cap", "lab"].includes(body.avatar.hat)) return { ...room, students: room.students.map(s => s.id === studentId ? { ...s, avatar: body.avatar! } : s) };
  if (body.action === "hand") return { ...room, students: room.students.map(s => s.id === studentId ? { ...s, handRaised: !s.handRaised } : s) };
  if (body.action === "desk" && body.deskId) { const student = room.students.find(s => s.id === studentId); const current = room.desks.find(d => d.occupantId === studentId); const target = room.desks.find(d => d.id === body.deskId); if (!student || !target || target.locked || target.occupantId && target.occupantId !== studentId) throw new Error("desk_unavailable"); if (current?.locked) throw new Error("desk_locked"); return { ...room, desks: room.desks.map(d => d.id === target.id ? { ...d, occupantId: studentId } : d.occupantId === studentId ? { ...d, occupantId: undefined } : d), students: room.students.map(s => s.id === studentId ? { ...s, deskId: target.id } : s) }; }
  throw new Error("invalid_student_action");
}

function presetHint(levelId: number) {
  const hints: Record<number, string> = { 1: "ลองนึกว่าสารชนิดใดถูกแม่เหล็กดูด", 2: "ลองเลือกวิธีใดวิธีหนึ่งให้ครบก่อน: ใช้ความต่างของการละลาย หรือการระเหิด", 3: "สารใดละลายน้ำ และสารใดลอยอยู่", 4: "สังเกตขนาดอนุภาคของสารทั้งสอง", 5: "คิดถึงสิ่งที่ผ่านกระดาษกรองได้", 6: "หากน้ำหายไป จะเหลือสารใด", 7: "ของเหลวสองชนิดแยกเป็นกี่ชั้น", 8: "เริ่มจากแยกสารที่ตอบสนองต่อแม่เหล็ก" };
  return hints[levelId] ?? "สังเกตสมบัติที่ต่างกันของสารก่อนเลือกวิธีแยก";
}
