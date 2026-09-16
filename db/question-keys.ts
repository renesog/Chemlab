import { adminDb } from '@/lib/firebase/admin';
import type { PrivateQuestionKeys } from '@/lib/custom-questions';

export async function findQuestionKeys(roomId: string): Promise<PrivateQuestionKeys> {
  const doc = await adminDb.collection('rooms').doc(roomId).collection('answerKeys').doc(roomId).get();
  if (!doc.exists) return {};
  const data = doc.data()!;
  return (data.answersJson ? JSON.parse(data.answersJson) : {}) as PrivateQuestionKeys;
}
