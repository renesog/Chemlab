export const dynamic = "force-dynamic";

import { getTeacherUser } from "@/lib/auth";
import { findRoom, json } from "@/db/live-rooms";
import { adminDb } from "@/lib/firebase/admin";
import { teacherCanDeleteRoom } from "@/lib/teacher-room-access";

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const room = await findRoom(id);
    if (!room || room.id !== id) return json({ error: "ไม่พบห้องเรียน" }, 404);
    const user = await getTeacherUser();
    const legacy = !room.ownerUserId && teacherCanDeleteRoom({
      userId: user?.userId,
      ownerUserId: room.ownerUserId,
      suppliedTeacherToken: request.headers.get("x-teacher-token"),
      roomTeacherToken: room.teacherToken,
    });
    const owned = !!room.ownerUserId && teacherCanDeleteRoom({
      userId: user?.userId,
      ownerUserId: room.ownerUserId,
    });
    if (!user && !legacy) return json({ error: "กรุณาเข้าสู่ระบบครู" }, 401);
    if (!owned && !legacy) return json({ error: "คุณไม่มีสิทธิ์ลบห้องนี้" }, 403);
    
    await adminDb.collection('rooms').doc(id).delete();
    return json({ deleted: true });
  } catch (err: unknown) {
    console.error("DELETE /api/teacher/rooms/[id] error:", err);
    return json({ error: "ลบห้องไม่สำเร็จ" }, 500);
  }
}
