export const dynamic = "force-dynamic";

import { getTeacherUser } from "@/lib/auth";
import { json } from "@/db/live-rooms";
import { clientDb } from "@/lib/firebase/config";
import { collection, getDocs, query, where, limit } from "firebase/firestore";
import type { Classroom } from "@/lib/types";

export async function GET() {
  try {
    const user = await getTeacherUser();
    if (!user) return json({ error: "กรุณาเข้าสู่ระบบครู" }, 401);
    const q = query(
      collection(clientDb, 'rooms'),
      where('ownerUserId', '==', user.userId),
      limit(100)
    );
    const snapshot = await getDocs(q);
    const rooms = snapshot.docs.map(doc => JSON.parse(doc.data().snapshot) as Classroom);
    return json({ rooms });
  } catch (err: unknown) {
    console.error("GET /api/teacher/rooms error:", err);
    return json({ rooms: [] });
  }
}
