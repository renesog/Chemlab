export type AttemptOutcome = { correct: boolean; feedback: string; score: number; explanation: string };
export type AttemptReceipt = { fingerprint: string; outcome: AttemptOutcome };

export function replayAttempt(receipt: AttemptReceipt | undefined, fingerprint: string) {
  if (!receipt) return null;
  if (receipt.fingerprint !== fingerprint) throw new Error("request_conflict");
  return receipt.outcome;
}
