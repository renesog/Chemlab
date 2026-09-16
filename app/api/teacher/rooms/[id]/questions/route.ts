export const dynamic = "force-dynamic";
import { getTeacherUser } from "@/lib/auth";
import { findRoom, json, parseRoom } from "@/db/live-rooms";
import { findQuestionKeys } from "@/db/question-keys";
import { customQuestionError, type PrivateQuestionKeys } from "@/lib/custom-questions";
import type { ActivityConfig } from "@/lib/types";
import { adminDb } from "@/lib/firebase/admin";

async function ownedRoom(id: string, request: Request) {
  const user = await getTeacherUser();
  if (!user) return null;
  const room = await findRoom(id);
  return room && (room.ownerUserId === user.userId || !room.ownerUserId && request.headers.get("x-teacher-token") === room.teacherToken) ? room : null;
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const room = await ownedRoom(id, request);
  if (!room) return json({ error: "ไม่มีสิทธิ์ดูโจทย์ห้องนี้" }, 403);
  return json({ answerKeys: await findQuestionKeys(id) });
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const room = await ownedRoom(id, request);
  if (!room) return json({ error: "ไม่มีสิทธิ์แก้โจทย์ห้องนี้" }, 403);
  let body: { activity?: ActivityConfig; answerKeys?: PrivateQuestionKeys };
  try { body = await request.json(); } catch { return json({ error: "ข้อมูลโจทย์ไม่ถูกต้อง" }, 400); }
  if (!body.activity || !body.answerKeys) return json({ error: "ข้อมูลโจทย์ไม่ครบ" }, 400);
  const issue = customQuestionError(body.activity, body.answerKeys);
  if (issue) return json({ error: issue }, 400);
  const current = parseRoom(room);
  if (current.status !== "OPEN") return json({ error: "แก้โจทย์ได้ก่อนเริ่มเกมเท่านั้น" }, 409);
  const now = Date.now();
  const updated = { ...current, activity: body.activity, students: current.students.map(student => ({ ...student, currentLevel: body.activity!.levelIds[0], totalScore: 0, wrongAttempts: 0, attemptsByLevel: {}, completed: [], skipped: [] })) };
  const snapshot = JSON.stringify(updated);
  try {
    await adminDb.runTransaction(async (tx) => {
      const roomRef = adminDb.collection('rooms').doc(id);
      const roomSnap = await tx.get(roomRef);
      if (!roomSnap.exists || roomSnap.data()!.version !== room.version) throw new Error('version_conflict');
      tx.update(roomRef, { snapshot, version: room.version + 1, updatedAt: now });
      const keyRef = adminDb.collection('rooms').doc(id).collection('answerKeys').doc(id);
      tx.set(keyRef, { answersJson: JSON.stringify(body.answerKeys), updatedAt: now });
    });
    return json({ room: updated });
  } catch {
    return json({ error: "ห้องเปลี่ยนสถานะแล้ว กรุณาโหลดใหม่" }, 409);
  }
}
