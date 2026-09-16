export const dynamic = "force-dynamic";
import { getTeacherUser } from "@/lib/auth";
import { json, rateAllowed } from "@/db/live-rooms";
import { adminDb } from "@/lib/firebase/admin";
import { findTeacherProfile, validTeacherProfile } from "@/db/teacher-profiles";

export async function GET() {
  const user = await getTeacherUser();
  if (!user) return json({ error: "กรุณาเข้าสู่ระบบครู" }, 401);
  return json({ profile: await findTeacherProfile(user.userId), email: user.email });
}

export async function PUT(request: Request) {
  const user = await getTeacherUser();
  if (!user) return json({ error: "กรุณาเข้าสู่ระบบครู" }, 401);
  if (!(await rateAllowed(`profile:${user.userId}`, 20))) return json({ error: "บันทึกถี่เกินไป กรุณารอสักครู่" }, 429);
  let body: unknown;
  try { body = await request.json(); } catch { return json({ error: "ข้อมูลโปรไฟล์ไม่ถูกต้อง" }, 400); }
  if (!validTeacherProfile(body)) return json({ error: "ชื่อเล่นต้องมี 2–32 ตัวอักษร และเลือกโปรไฟล์จากรายการ" }, 400);
  const profile = { ...body, nickname: body.nickname.trim() };
  const now = Date.now();
  await adminDb.collection('teacherProfiles').doc(user.userId).set(
    { nickname: profile.nickname, avatar: profile.avatar, color: profile.color, updatedAt: now, createdAt: now },
    { merge: true }
  );
  return json({ profile });
}
