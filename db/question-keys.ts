import { clientDb } from '@/lib/firebase/config';
import { doc, getDoc } from 'firebase/firestore';
import type { PrivateQuestionKeys } from '@/lib/custom-questions';

export async function findQuestionKeys(roomId: string): Promise<PrivateQuestionKeys> {
  try {
    const snap = await getDoc(doc(clientDb, 'rooms', roomId, 'answerKeys', roomId));
    if (!snap.exists()) return {};
    const data = snap.data()!;
    return (data.answersJson ? JSON.parse(data.answersJson) : {}) as PrivateQuestionKeys;
  } catch (err) {
    console.error("findQuestionKeys error:", err);
    return {};
  }
}
