import { adminDb } from '@/lib/firebase/admin';

export function getDb() {
  return adminDb;
}

export { adminDb };
