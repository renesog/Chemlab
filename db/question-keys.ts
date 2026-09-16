import { database } from "./live-rooms";
import type { PrivateQuestionKeys } from "@/lib/custom-questions";

export async function findQuestionKeys(roomId:string):Promise<PrivateQuestionKeys>{
  const row=await database().prepare("select answers_json from live_room_answer_keys where room_id=?1").bind(roomId).first<{answers_json:string}>();
  return row?JSON.parse(row.answers_json) as PrivateQuestionKeys:{};
}
