import { adminDb } from '@/lib/firebase/admin';
import { FieldValue, type DocumentReference } from 'firebase-admin/firestore';
import type { Classroom } from '@/lib/types';

type RoomDoc = {
  id: string;
  code: string;
  snapshot: string;
  teacherToken: string;
  ownerUserId: string | null;
  version: number;
  updatedAt: number;
};

export async function findRoom(key: string): Promise<(RoomDoc & { _ref: DocumentReference }) | null> {
  try {
    const docRef = adminDb.collection('rooms').doc(key);
    const byId = await docRef.get();
    if (byId.exists) {
      return { ...(byId.data() as RoomDoc), _ref: byId.ref };
    }

    const q = adminDb.collection('rooms').where('code', '==', key.toUpperCase()).limit(1);
    const snap = await q.get();
    if (!snap.empty) {
      const d = snap.docs[0];
      return { ...(d.data() as RoomDoc), _ref: d.ref };
    }
  } catch (err) {
    console.error("findRoom error:", err);
  }

  return null;
}

export function parseRoom(row: RoomDoc): Classroom {
  return JSON.parse(row.snapshot) as Classroom;
}

export async function mutateRoom(
  key: string,
  mutate: (room: Classroom, row: RoomDoc) => Promise<Classroom> | Classroom,
): Promise<Classroom | null> {
  const found = await findRoom(key);
  if (!found) return null;

  const result = await adminDb.runTransaction(async (tx) => {
    const freshSnap = await tx.get(found._ref);
    if (!freshSnap.exists) throw new Error('room_not_found');
    const row = freshSnap.data() as RoomDoc;
    const room = await mutate(parseRoom(row), row);
    tx.update(found._ref, {
      snapshot: JSON.stringify(room),
      version: FieldValue.increment(1),
      updatedAt: Date.now(),
    });
    return room;
  });

  return result;
}

export function json(data: unknown, status = 200) {
  return Response.json(data, { status, headers: { 'cache-control': 'no-store' } });
}

export async function rateAllowed(key: string, limitCount: number): Promise<boolean> {
  const now = Date.now();
  const ref = adminDb.collection('rateLimits').doc(key.replace(/\//g, '_'));

  try {
    const result = await adminDb.runTransaction(async (tx) => {
      const snap = await tx.get(ref);
      if (!snap.exists || (snap.data()?.resetAt ?? 0) <= now) {
        tx.set(ref, { count: 1, resetAt: now + 60_000 });
        return 1;
      }
      const current = snap.data()!;
      const newCount = (current.count ?? 0) + 1;
      tx.update(ref, { count: newCount });
      return newCount;
    });
    return result <= limitCount;
  } catch {
    return true; // Don't block requests if rate limits collection is transiently unavailable
  }
}

export function database() {
  return adminDb;
}
