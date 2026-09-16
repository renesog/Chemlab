export const dynamic = "force-dynamic";
import { getTeacherUser } from "@/lib/auth";
import { json } from "@/db/live-rooms";
import { adminDb } from "@/lib/firebase/admin";
import type { Classroom } from "@/lib/types";

export async function GET() {
  const user = await getTeacherUser();
  if (!user) return json({ error: "กรุณาเข้าสู่ระบบครู" }, 401);
  const snapshot = await adminDb.collection('rooms')
    .where('ownerUserId', '==', user.userId)
    .orderBy('updatedAt', 'desc')
    .limit(100)
    .get();
  const rooms = snapshot.docs.map(doc => JSON.parse(doc.data().snapshot) as Classroom);
  return json({ rooms });
}
