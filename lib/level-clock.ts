import type { Classroom, RoomStatus, Student } from "./types";

export function elapsedLevelMs(student: Student, levelId: number, now: number): number | null {
  const clock = student.levelClock;
  if (!clock || clock.levelId !== levelId) return null;
  return clock.elapsedMs + (clock.runningSince === null ? 0 : Math.max(0, now - clock.runningSince));
}

export function beginLevel(room: Classroom, studentId: string, levelId: number, now = Date.now()): Classroom {
  const student = room.students.find(s => s.id === studentId);
  if (room.status !== "RUNNING" || now < (room.gameStartsAt ?? 0) || !student?.deskId || student.currentLevel !== levelId || !room.activity.levelIds.includes(levelId) || student.completed.includes(levelId) || student.skipped?.includes(levelId)) throw new Error("activity_unavailable");
  if (student.levelClock?.levelId === levelId) return room;
  return { ...room, students: room.students.map(s => s.id === studentId ? { ...s, levelClock: { levelId, elapsedMs: 0, runningSince: now } } : s) };
}

export function transitionActivity(room: Classroom, status: RoomStatus, now = Date.now()): Classroom {
  if (room.status === "ENDED") throw new Error("activity_unavailable");
  const gameStartsAt = status === "RUNNING" && room.status !== "RUNNING" ? now + 6000 : room.gameStartsAt;
  return { ...room, status, gameStartsAt, students: room.students.map(student => {
    const clock = student.levelClock;
    if (!clock) return student;
    const elapsedMs = elapsedLevelMs(student, clock.levelId, now)!;
    const finished = student.completed.includes(clock.levelId) || student.skipped?.includes(clock.levelId);
    return { ...student, levelClock: { ...clock, elapsedMs,
      runningSince: status === "RUNNING" && !finished ? Math.max(now, gameStartsAt ?? now) : null } };
  }) };
}
