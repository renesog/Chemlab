export const dynamic = "force-dynamic";
import { feedbackFor, scoreForAttempts, validateSequence } from "@/lib/game";

const buckets = new Map<string, { count: number; reset: number }>();
export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(',')[0]?.trim() ?? "local";
  const now = Date.now();
  const bucket = buckets.get(ip);
  if (bucket && bucket.reset > now && bucket.count >= 20) return Response.json({ error: "ส่งคำตอบถี่เกินไป กรุณารอสักครู่" }, { status: 429 });
  buckets.set(ip, { count: bucket && bucket.reset > now ? bucket.count + 1 : 1, reset: bucket && bucket.reset > now ? bucket.reset : now + 60_000 });
  let body: unknown;
  try { body = await request.json(); } catch { return Response.json({ error: "ข้อมูลไม่ถูกต้อง" }, { status: 400 }); }
  if (!body || typeof body !== "object") return Response.json({ error: "ข้อมูลไม่ถูกต้อง" }, { status: 400 });
  const { levelId, steps, previousAttempts, maxPoints } = body as { levelId?: unknown; steps?: unknown; previousAttempts?: unknown; maxPoints?: unknown };
  if (!Number.isInteger(levelId) || !Array.isArray(steps) || steps.some(s => typeof s !== "string") || !Number.isInteger(previousAttempts) || !Number.isInteger(maxPoints) || (maxPoints as number) < 1 || (maxPoints as number) > 20) return Response.json({ error: "รูปแบบคำตอบไม่ถูกต้อง" }, { status: 400 });
  const correct = validateSequence(levelId as number, steps as string[]);
  const attempts = (previousAttempts as number) + (correct ? 0 : 1);
  return Response.json({ correct, score: scoreForAttempts(attempts, maxPoints as number), feedback: correct ? "เยี่ยมมาก! ลำดับนี้แยกสารได้สำเร็จ" : feedbackFor(levelId as number, steps as string[]) });
}
