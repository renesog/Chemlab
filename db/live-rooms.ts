import { adminDb } from '@/lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';
import type { Classroom } from '@/lib/types';

const roomsCol = () => adminDb.collection('rooms');
const rateLimitsCol = () => adminDb.collection('rateLimits');

type RoomDoc = {
  id: string;
  code: string;
  snapshot: string;
  teacherToken: string;
  ownerUserId: string | null;
  version: number;
  updatedAt: number;
};

export async function findRoom(key: string): Promise<(RoomDoc & { _ref: FirebaseFirestore.DocumentReference }) | null> {
  // Try by ID first
  const byId = await roomsCol().doc(key).get();
  if (byId.exists) {
    const data = byId.data() as RoomDoc;
    return { ...data, _ref: byId.ref };
  }

  // Try by code
  const byCode = await roomsCol().where('code', '==', key.toUpperCase()).limit(1).get();
  if (!byCode.empty) {
    const doc = byCode.docs[0];
    const data = doc.data() as RoomDoc;
    return { ...data, _ref: doc.ref };
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

export async function rateAllowed(key: string, limit: number): Promise<boolean> {
  const now = Date.now();
  const ref = rateLimitsCol().doc(key.replace(/\//g, '_'));

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

  return result <= limit;
}

export function database() {
  return adminDb;
}
