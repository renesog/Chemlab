"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { ActivityConfig, Avatar, Classroom, Student } from "./types";
import { WebMcpTools } from "./webmcp";

const KEY = "chemclass-demo-v1";
const SESSION = "chemclass-student-session";
const defaultAvatar: Avatar = { gender: "boy", skin: "medium", hair: "short", hairColor: "black", shirt: "cyan", hat: "none" };
export const defaultActivity: ActivityConfig = { mode: "PRESET", title: "ภารกิจการแยกสาร", levelIds: [1,2,3,4,5,6,7,8], pointsByLevel: {1:5,2:5,3:5,4:5,5:5,6:5,7:5,8:5} };

function desks(count = 12) { return Array.from({length: count}, (_, i) => ({ id: `desk-${i+1}`, label: `${i+1}`, locked: false, x: i % 4, y: Math.floor(i / 4) })); }
const seed: Classroom[] = [{ id: "demo-room", code: "CHEM82", name: "ห้องทดลอง ม.2/1", subject: "วิทยาศาสตร์ — การแยกสาร", layout: "ROWS", status: "OPEN", desks: desks(), students: [], activity: defaultActivity, createdAt: new Date().toISOString() }];

function normalizeRooms(value: Classroom[]) {
  return value.map(room=>({...room,activity:room.activity??defaultActivity,students:room.students.map(student=>({...student,avatar:{...defaultAvatar,...student.avatar}}))}));
}

type Store = {
  ready: boolean; rooms: Classroom[]; currentStudent?: {roomId:string; studentId:string};
  createRoom(input:{name:string;subject:string;count:number;layout:Classroom["layout"]}): Classroom;
  join(code:string,nickname:string): {room:Classroom;student:Student}|null;
  updateAvatar(avatar:Avatar): void; selectDesk(deskId:string): {ok:boolean;message:string};
  toggleHand():void; setRoomStatus(roomId:string,status:Classroom["status"]):void;
  configureActivity(roomId:string,activity:ActivityConfig):void;
  setDeskLock(roomId:string,deskId:string,locked:boolean):void; setAllLocks(roomId:string,locked:boolean):void;
  moveStudent(roomId:string,studentId:string,deskId:string):void;
  recordAttempt(levelId:number,correct:boolean,score:number):void;
};
const Context = createContext<Store | null>(null);

export function DemoProvider({children}:{children:React.ReactNode}) {
  const [rooms,setRooms] = useState<Classroom[]>(seed);
  const [currentStudent,setCurrentStudent] = useState<{roomId:string;studentId:string}|undefined>();
  const [ready,setReady] = useState(false);
  useEffect(() => { try { const saved=localStorage.getItem(KEY); if(saved) setRooms(normalizeRooms(JSON.parse(saved))); const session=localStorage.getItem(SESSION); if(session) setCurrentStudent(JSON.parse(session)); } finally { setReady(true); } }, []);
  useEffect(() => { if(ready) localStorage.setItem(KEY,JSON.stringify(rooms)); },[rooms,ready]);
  useEffect(() => { const sync=(event:StorageEvent)=>{if(event.key===KEY&&event.newValue)setRooms(normalizeRooms(JSON.parse(event.newValue)));}; addEventListener("storage",sync); return()=>removeEventListener("storage",sync); },[]);
  const mutate = useCallback((fn:(rooms:Classroom[])=>Classroom[])=>setRooms(old=>fn(structuredClone(old))),[]);
  const createRoom:Store["createRoom"] = input => { const room:Classroom={id:crypto.randomUUID(),code:Math.random().toString(36).slice(2,8).toUpperCase(),name:input.name,subject:input.subject,layout:input.layout,status:"OPEN",desks:desks(input.count),students:[],activity:defaultActivity,createdAt:new Date().toISOString()}; setRooms(r=>[room,...r]); return room; };
  const join:Store["join"] = (code,nickname) => { const room=rooms.find(r=>r.code===code.toUpperCase()&&r.status!=="ENDED"); if(!room)return null; const student:Student={id:crypto.randomUUID(),nickname,avatar:defaultAvatar,handRaised:false,currentLevel:1,totalScore:0,wrongAttempts:0,completed:[]}; mutate(rs=>rs.map(r=>r.id===room.id?{...r,students:[...r.students,student]}:r)); const session={roomId:room.id,studentId:student.id}; setCurrentStudent(session); localStorage.setItem(SESSION,JSON.stringify(session)); return {room,student}; };
  const updateAvatar=(avatar:Avatar)=>currentStudent&&mutate(rs=>rs.map(r=>r.id===currentStudent.roomId?{...r,students:r.students.map(s=>s.id===currentStudent.studentId?{...s,avatar}:s)}:r));
  const selectDesk=(deskId:string)=>{if(!currentStudent)return{ok:false,message:"ไม่พบเซสชันนักเรียน"}; let result={ok:false,message:"ไม่สามารถเลือกโต๊ะได้"}; mutate(rs=>rs.map(r=>{if(r.id!==currentStudent.roomId)return r; const student=r.students.find(s=>s.id===currentStudent.studentId); const target=r.desks.find(d=>d.id===deskId); const current=r.desks.find(d=>d.occupantId===currentStudent.studentId); if(!student||!target)return r; if(current?.locked){result={ok:false,message:"ครูล็อกโต๊ะปัจจุบันแล้ว จึงยังย้ายไม่ได้"};return r;} if(target.locked||target.occupantId){result={ok:false,message:"โต๊ะนี้ไม่ว่าง กรุณาเลือกโต๊ะอื่น"};return r;} result={ok:true,message:"เลือกที่นั่งเรียบร้อย (โต๊ะยังไม่ถูกล็อก)"}; return {...r,desks:r.desks.map(d=>d.id===deskId?{...d,occupantId:student.id}:d.occupantId===student.id?{...d,occupantId:undefined}:d),students:r.students.map(s=>s.id===student.id?{...s,deskId}:s)};})); return result;};
  const toggleHand=()=>currentStudent&&mutate(rs=>rs.map(r=>r.id===currentStudent.roomId?{...r,students:r.students.map(s=>s.id===currentStudent.studentId?{...s,handRaised:!s.handRaised}:s)}:r));
  const setRoomStatus=(roomId:string,status:Classroom["status"])=>mutate(rs=>rs.map(r=>r.id===roomId?{...r,status}:r));
  const configureActivity=(roomId:string,activity:ActivityConfig)=>mutate(rs=>rs.map(r=>r.id===roomId?{...r,activity,students:r.students.map(s=>({...s,currentLevel:activity.levelIds[0]??1}))}:r));
  const setDeskLock=(roomId:string,deskId:string,locked:boolean)=>mutate(rs=>rs.map(r=>r.id===roomId?{...r,desks:r.desks.map(d=>d.id===deskId?{...d,locked}:d)}:r));
  const setAllLocks=(roomId:string,locked:boolean)=>mutate(rs=>rs.map(r=>r.id===roomId?{...r,desks:r.desks.map(d=>({...d,locked}))}:r));
  const moveStudent=(roomId:string,studentId:string,deskId:string)=>mutate(rs=>rs.map(r=>r.id===roomId?{...r,desks:r.desks.map(d=>d.id===deskId?{...d,occupantId:studentId}:d.occupantId===studentId?{...d,occupantId:undefined}:d),students:r.students.map(s=>s.id===studentId?{...s,deskId}:s)}:r));
  const recordAttempt=(levelId:number,correct:boolean,score:number)=>currentStudent&&mutate(rs=>rs.map(r=>{if(r.id!==currentStudent.roomId)return r;const index=r.activity.levelIds.indexOf(levelId);const next=r.activity.levelIds[index+1]??levelId;return {...r,students:r.students.map(s=>s.id===currentStudent.studentId?{...s,wrongAttempts:s.wrongAttempts+(correct?0:1),totalScore:s.totalScore+(correct&&!s.completed.includes(levelId)?score:0),completed:correct?[...new Set([...s.completed,levelId])]:s.completed,currentLevel:correct?next:s.currentLevel}:s)}}));
  const value={ready,rooms,currentStudent,createRoom,join,updateAvatar,selectDesk,toggleHand,setRoomStatus,configureActivity,setDeskLock,setAllLocks,moveStudent,recordAttempt};
  return <Context.Provider value={value}><WebMcpTools/>{children}</Context.Provider>;
}
export function useDemo(){const value=useContext(Context);if(!value)throw new Error("DemoProvider missing");return value;}
export function currentStudentFrom(store:Pick<Store,"rooms"|"currentStudent">){const room=store.rooms.find(r=>r.id===store.currentStudent?.roomId);return{room,student:room?.students.find(s=>s.id===store.currentStudent?.studentId)};}
