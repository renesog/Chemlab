import { adminDb } from '@/lib/firebase/admin';
import type { PrivateQuestionKeys } from '@/lib/custom-questions';

export async function findQuestionKeys(roomId: string): Promise<PrivateQuestionKeys> {
  try {
    const snap = await adminDb.collection('rooms').doc(roomId).collection('answerKeys').doc(roomId).get();
    if (!snap.exists) return {};
    const data = snap.data()!;
    return (data.answersJson ? JSON.parse(data.answersJson) : {}) as PrivateQuestionKeys;
  } catch (err) {
    console.error("findQuestionKeys error:", err);
    return {};
  }
}
