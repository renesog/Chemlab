import type { Classroom, Student } from "./types";

export function labPhase(room: Classroom, student: Student, now: number) {
  if (room.activity.levelIds.every(id => student.completed.includes(id) || student.skipped?.includes(id))) return "finished";
  if (room.status === "ENDED") return "ended";
  if (!student.deskId) return "seat";
  if (room.status === "PAUSED") return "paused";
  if (room.status === "OPEN") return "waiting";
  if (now < (room.gameStartsAt ?? 0)) return "countdown";
  return "playing";
}

export function readDraft(raw: string | null, allowedIds: string[]) {
  try {
    const value: unknown = JSON.parse(raw ?? "[]");
    if (!Array.isArray(value)) return [];
    return [...new Set(value.filter((id): id is string => typeof id === "string" && allowedIds.includes(id)))].slice(0, 12);
  } catch { return []; }
}

export function draftKey(roomId: string, studentId: string, levelId: number) {
  return `chemclass-plan:${roomId}:${studentId}:${levelId}`;
}
