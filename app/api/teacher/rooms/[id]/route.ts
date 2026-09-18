export const dynamic = "force-dynamic";

import { getTeacherUser } from "@/lib/auth";
import { findRoom, json } from "@/db/live-rooms";
import { adminDb } from "@/lib/firebase/admin";

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getTeacherUser();
    if (!user) return json({ error: "กรุณาเข้าสู่ระบบครู" }, 401);
    const { id } = await params;
    const room = await findRoom(id);
    if (!room || room.id !== id) return json({ error: "ไม่พบห้องเรียน" }, 404);
    const owned = room.ownerUserId === user.userId;
    const legacy = !room.ownerUserId && request.headers.get("x-teacher-token") === room.teacherToken;
    if (!owned && !legacy) return json({ error: "คุณไม่มีสิทธิ์ลบห้องนี้" }, 403);
    
    await adminDb.collection('rooms').doc(id).delete();
    return json({ deleted: true });
  } catch (err: unknown) {
    console.error("DELETE /api/teacher/rooms/[id] error:", err);
    return json({ error: "ลบห้องไม่สำเร็จ" }, 500);
  }
}
