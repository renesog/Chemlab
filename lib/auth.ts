import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { adminAuth } from './firebase/admin';

export type TeacherUser = {
  userId: string;
  email: string;
  displayName: string;
};

export async function getTeacherUser(): Promise<TeacherUser | null> {
  const requestHeaders = await headers();
  const authorization = requestHeaders.get('authorization');
  if (!authorization?.startsWith('Bearer ')) return null;

  const idToken = authorization.slice(7);
  try {
    const decoded = await adminAuth.verifyIdToken(idToken);
    return {
      userId: decoded.uid,
      email: decoded.email ?? '',
      displayName: decoded.name ?? decoded.email ?? '',
    };
  } catch {
    return null;
  }
}

export async function requireTeacherUser(returnTo: string): Promise<TeacherUser> {
  const user = await getTeacherUser();
  if (user) return user;
  redirect('/teacher/login');
}
