export const dynamic = "force-dynamic";

import { findRoom, json, parseRoom, rateAllowed } from "@/db/live-rooms";
import { adminDb } from "@/lib/firebase/admin";
import type { Classroom } from "@/lib/types";
import { getTeacherUser } from "@/lib/auth";
import { findTeacherProfile } from "@/db/teacher-profiles";

export async function POST(request: Request) {
  try {
    const user = await getTeacherUser();
    if (!user) return json({ error: "กรุณาเข้าสู่ระบบครูก่อนสร้างห้อง" }, 401);
    
    let body: { room?: Classroom; teacherToken?: string };
    try { body = await request.json(); } catch { return json({ error: "ข้อมูลห้องไม่ถูกต้อง" }, 400); }
    const room = body.room;
    if (
      !room || typeof room.id !== "string" || room.id.length > 80 ||
      !/^[A-Z0-9]{6}$/.test(room.code) ||
      typeof room.name !== "string" || room.name.trim().length < 2 || room.name.length > 60 ||
      !Array.isArray(room.desks) || room.desks.length < 1 || room.desks.length > 40 ||
      !Array.isArray(room.students) || room.students.length !== 0 ||
      typeof room.subject !== "string" || room.subject.length > 80
    ) return json({ error: "ข้อมูลห้องไม่ถูกต้อง" }, 400);

    const existing = await findRoom(room.id);
    if (existing) {
      if (existing.ownerUserId && existing.ownerUserId !== user.userId) return json({ error: "ห้องนี้ไม่ใช่ของคุณ" }, 403);
      return json({ room: parseRoom(existing), teacherToken: existing.teacherToken, published: true });
    }
    const teacherToken = crypto.randomUUID() + crypto.randomUUID();
    await adminDb.collection('rooms').doc(room.id).set({
      id: room.id,
      code: room.code,
      snapshot: JSON.stringify(room),
      teacherToken,
      ownerUserId: user.userId,
      version: 1,
      updatedAt: Date.now(),
    });
    return json({ room, teacherToken, published: true }, 201);
  } catch (err: unknown) {
    console.error("POST /api/rooms error:", err);
    return json({ error: err instanceof Error ? err.message : "สร้างห้องไม่สำเร็จ" }, 500);
  }
}
