import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

export type TeacherUser = {
  userId: string;
  email: string;
  displayName: string;
};

export async function getTeacherUser(): Promise<TeacherUser | null> {
  const requestHeaders = await headers();
  
  // 1. Direct persistent teacher ID header (no login required)
  const teacherId = requestHeaders.get('x-teacher-id');
  if (teacherId && teacherId.trim().length >= 6) {
    return {
      userId: teacherId.trim(),
      email: 'teacher@local',
      displayName: 'ครูผู้สอน',
    };
  }

  // 2. Authorization Bearer token header
  const authorization = requestHeaders.get('authorization');
  if (authorization?.startsWith('Bearer ')) {
    const token = authorization.slice(7).trim();
    if (token.length >= 6) {
      return {
        userId: token,
        email: 'teacher@local',
        displayName: 'ครูผู้สอน',
      };
    }
  }

  return null;
}

export async function requireTeacherUser(returnTo: string): Promise<TeacherUser> {
  const user = await getTeacherUser();
  if (user) return user;
  redirect('/teacher/login');
}
