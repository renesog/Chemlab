import { adminDb } from '@/lib/firebase/admin';
import type { TeacherProfile } from '@/lib/types';

const profilesCol = () => adminDb.collection('teacherProfiles');

export async function findTeacherProfile(userId: string): Promise<TeacherProfile | null> {
  const doc = await profilesCol().doc(userId).get();
  if (!doc.exists) return null;
  const data = doc.data()!;
  return {
    nickname: data.nickname,
    avatar: data.avatar as TeacherProfile['avatar'],
    color: data.color as TeacherProfile['color'],
  };
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
