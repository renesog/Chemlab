export const dynamic = "force-dynamic";

import { getTeacherUser } from "@/lib/auth";
import { json } from "@/db/live-rooms";
import { adminDb } from "@/lib/firebase/admin";
import type { Classroom } from "@/lib/types";

export async function GET() {
  try {
    const user = await getTeacherUser();
    if (!user) return json({ error: "กรุณาเข้าสู่ระบบครู" }, 401);
    const q = adminDb.collection('rooms').where('ownerUserId', '==', user.userId).limit(100);
    const snapshot = await q.get();
    const rooms = snapshot.docs.map(item => JSON.parse(item.data().snapshot) as Classroom);
    return json({ rooms });
  } catch (err: unknown) {
    console.error("GET /api/teacher/rooms error:", err);
    return json({ rooms: [] });
  }
}
