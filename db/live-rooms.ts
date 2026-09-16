import { env } from "cloudflare:workers";
import type { Classroom } from "@/lib/types";

type RoomRow={id:string;code:string;snapshot:string;teacher_token:string;owner_user_id:string|null;version:number};
export function database(){if(!env.DB)throw new Error("D1 binding DB is unavailable");return env.DB;}
export async function findRoom(key:string){return database().prepare("select id,code,snapshot,teacher_token,owner_user_id,version from live_rooms where id=?1 or code=?2 limit 1").bind(key,key.toUpperCase()).first<RoomRow>();}
export function parseRoom(row:RoomRow){return JSON.parse(row.snapshot) as Classroom;}
export async function mutateRoom(key:string,mutate:(room:Classroom,row:RoomRow)=>Promise<Classroom>|Classroom){
  for(let attempt=0;attempt<4;attempt++){
    const row=await findRoom(key);if(!row)return null;
    const room=await mutate(parseRoom(row),row);
    const result=await database().prepare("update live_rooms set snapshot=?1,version=version+1,updated_at=?2 where id=?3 and version=?4").bind(JSON.stringify(room),Date.now(),row.id,row.version).run();
    if(result.meta.changes===1)return room;
  }
  throw new Error("room_update_conflict");
}
export function json(data:unknown,status=200){return Response.json(data,{status,headers:{"cache-control":"no-store"}})}
export async function rateAllowed(key:string,limit:number){const now=Date.now();await database().prepare("insert into live_rate_limits(key,count,reset_at) values(?1,1,?2) on conflict(key) do update set count=case when reset_at<=?3 then 1 else count+1 end,reset_at=case when reset_at<=?3 then ?2 else reset_at end").bind(key,now+60_000,now).run();const state=await database().prepare("select count from live_rate_limits where key=?1").bind(key).first<{count:number}>();return(state?.count??0)<=limit}
