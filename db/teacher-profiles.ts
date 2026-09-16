import { clientDb } from '@/lib/firebase/config';
import { doc, getDoc } from 'firebase/firestore';
import type { TeacherProfile } from '@/lib/types';

export async function findTeacherProfile(userId: string): Promise<TeacherProfile | null> {
  try {
    const snap = await getDoc(doc(clientDb, 'teacherProfiles', userId));
    if (!snap.exists()) return null;
    const data = snap.data()!;
    return {
      nickname: data.nickname,
      avatar: data.avatar as TeacherProfile['avatar'],
      color: data.color as TeacherProfile['color'],
    };
  } catch (err) {
    console.error("findTeacherProfile error:", err);
    return null;
  }
}

export function validTeacherProfile(value: unknown): value is TeacherProfile {
  if (!value || typeof value !== 'object') return false;
  const profile = value as Record<string, unknown>;
  return (
    typeof profile.nickname === 'string' &&
    profile.nickname.trim().length >= 2 &&
    profile.nickname.trim().length <= 32 &&
    ['flask', 'atom', 'book'].includes(String(profile.avatar)) &&
    ['cyan', 'navy', 'gold'].includes(String(profile.color))
  );
}
