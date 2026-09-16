"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import type { ActivityConfig, Avatar, Classroom, Student, TeacherProfile } from "./types";
import { WebMcpTools } from "./webmcp";

const KEY="chemclass-demo-v1";
const SESSION="chemclass-student-session";
const TEACHERS="chemclass-teacher-tokens";
const defaultAvatar:Avatar={gender:"boy",skin:"medium",hair:"short",hairColor:"black",shirt:"cyan",hat:"none"};
export const defaultActivity:ActivityConfig={mode:"PRESET",title:"ภารกิจการแยกสาร",levelIds:[1,2,3,4,5,6,7,8],pointsByLevel:{1:5,2:5,3:5,4:5,5:5,6:5,7:5,8:5},hintsEnabled:true};
function desks(count=12){return Array.from({length:count},(_,i)=>({id:`desk-${i+1}`,label:`${i+1}`,locked:false,x:i%4,y:Math.floor(i/4)}))}
const seed:Classroom[]=[];
function normalizeRooms(value:Classroom[]){return value.map(room=>({...room,activity:room.activity??defaultActivity,students:room.students.map(student=>({...student,avatar:{...defaultAvatar,...student.avatar}}))}))}
type Session={roomId:string;studentId:string;token?:string};
type Store={ready:boolean;rooms:Classroom[];profile:TeacherProfile|null;currentStudent?:Session;error:string;canManage(roomId:string):boolean;teacherToken(roomId:string):string|undefined;createRoom(input:{name:string;subject:string;count:number;layout:Classroom["layout"]}):Promise<Classroom>;deleteRoom(roomId:string):Promise<void>;join(code:string,nickname:string):Promise<{room:Classroom;student:Student}|null>;updateAvatar(avatar:Avatar):Promise<void>;selectDesk(deskId:string):Promise<{ok:boolean;message:string}>;toggleHand():Promise<void>;getHint(levelId:number):Promise<string>;setRoomStatus(roomId:string,status:Classroom["status"]):Promise<void>;configureActivity(roomId:string,activity:ActivityConfig):Promise<void>;setDeskLock(roomId:string,deskId:string,locked:boolean):Promise<void>;setAllLocks(roomId:string,locked:boolean):Promise<void>;moveStudent(roomId:string,studentId:string,deskId:string):Promise<void>;submitAttempt(levelId:number,steps:string[]):Promise<{correct:boolean;feedback:string;score:number;explanation:string}>};
const Context=createContext<Store|null>(null);
class RequestFailure extends Error{constructor(message:string,readonly status:number){super(message)}}
async function request<T>(path:string,method="GET",body?:unknown,signal?:AbortSignal):Promise<T>{const response=await fetch(path,{method,headers:{"content-type":"application/json"},body:body?JSON.stringify(body):undefined,cache:"no-store",signal});const data=await response.json() as {error?:string};if(!response.ok)throw new RequestFailure(data.error??"เชื่อมต่อห้องเรียนไม่ได้",response.status);return data as T}

export function DemoProvider({children}:{children:React.ReactNode}){
  const pathname=usePathname();
  const [rooms,setRooms]=useState<Classroom[]>(seed);
  const [currentStudent,setCurrentStudent]=useState<Session|undefined>();
  const [tokens,setTokens]=useState<Record<string,string>>({});
  const [ownedRoomIds,setOwnedRoomIds]=useState<string[]>([]);
  const [profile,setProfile]=useState<TeacherProfile|null>(null);
  const [ready,setReady]=useState(false);
  const [error,setError]=useState("");
  const putRoom=useCallback((room:Classroom)=>setRooms(previous=>{const current=previous.find(item=>item.id===room.id);if(current&&JSON.stringify(current)===JSON.stringify(room))return previous;return[room,...previous.filter(item=>item.id!==room.id)]}),[]);
  useEffect(()=>{let cancelled=false;void(async()=>{
    let session:Session|undefined;
    try{
      const saved=localStorage.getItem(KEY);if(saved)setRooms(normalizeRooms(JSON.parse(saved)));
      const teacher=localStorage.getItem(TEACHERS);if(teacher)setTokens(JSON.parse(teacher));
      const storedSession=localStorage.getItem(SESSION);if(storedSession)session=JSON.parse(storedSession) as Session;
      if(session?.roomId&&session.studentId&&session.token){
        const data=await request<{room:Classroom}>(`/api/rooms/${encodeURIComponent(session.roomId)}`,"PATCH",{action:"resume",token:session.token});
        if(!data.room.students.some(student=>student.id===session!.studentId))throw new RequestFailure("ไม่พบนักเรียนในห้องนี้",401);
        if(!cancelled){putRoom(data.room);setCurrentStudent(session)}
      }else if(session)throw new RequestFailure("เซสชันเก่าหมดอายุ",401);
    }catch(cause){
      if(!cancelled&&session&&cause instanceof RequestFailure&&[401,404].includes(cause.status)){
        localStorage.removeItem(SESSION);
        setRooms(current=>current.filter(room=>room.id!==session!.roomId));
        setError("ห้องเรียนหรือเซสชันเดิมหมดอายุ กรุณาสแกน QR หรือเปิดลิงก์ห้องล่าสุดอีกครั้ง");
      }else if(!cancelled&&session)setError("ตรวจสอบห้องเรียนไม่ได้ กรุณาเชื่อมต่ออินเทอร์เน็ตแล้วโหลดหน้านี้ใหม่");
    }finally{if(!cancelled)setReady(true)}
  })();return()=>{cancelled=true}},[putRoom]);
  useEffect(()=>{if(!ready)return;const timer=setTimeout(()=>localStorage.setItem(KEY,JSON.stringify(rooms)),600);return()=>clearTimeout(timer)},[rooms,ready]);
  useEffect(()=>{if(ready)localStorage.setItem(TEACHERS,JSON.stringify(tokens))},[tokens,ready]);
  useEffect(()=>{if(!ready)return;const sync=(event:StorageEvent)=>{if(event.key===KEY&&event.newValue)setRooms(normalizeRooms(JSON.parse(event.newValue)))};addEventListener("storage",sync);return()=>removeEventListener("storage",sync)},[ready]);
  useEffect(()=>{
    if(!ready||!pathname?.startsWith("/teacher/")||pathname==="/teacher/login")return;
    let cancelled=false;
    void Promise.all([request<{profile:TeacherProfile|null}>("/api/teacher/profile"),request<{rooms:Classroom[]}>("/api/teacher/rooms")]).then(([account,owned])=>{if(cancelled)return;setProfile(account.profile);setOwnedRoomIds(owned.rooms.map(room=>room.id));owned.rooms.forEach(putRoom)}).catch(()=>{});
    return()=>{cancelled=true};
  },[ready,pathname,putRoom]);
  const roomIds=rooms.map(r=>r.id).sort().join(",");
  const activeTeacherRoom=pathname?.match(/^\/teacher\/classrooms\/([^/]+)/)?.[1];
  const isDashboard=pathname==="/teacher/dashboard";
  const watchKey=isDashboard?roomIds:activeTeacherRoom&&activeTeacherRoom!=="new"?activeTeacherRoom:pathname?.startsWith("/student/")?currentStudent?.roomId??"":"";
  useEffect(()=>{
    if(!ready||!watchKey)return;
    let cancelled=false;
    let inFlight=false;
    const controller=new AbortController();
    const refresh=async()=>{
      if(inFlight||document.visibilityState==="hidden")return;
      inFlight=true;
      await Promise.all(watchKey.split(",").filter(Boolean).map(async id=>{
        try{const data=await request<{room:Classroom}>(`/api/rooms/${encodeURIComponent(id)}`,"GET",undefined,controller.signal);if(!cancelled)putRoom(data.room)}catch(cause){if(!cancelled&&cause instanceof RequestFailure&&cause.status===404){setRooms(current=>current.filter(room=>room.id!==id));setOwnedRoomIds(current=>current.filter(roomId=>roomId!==id))}}
      }));
      inFlight=false;
    };
    const resume=()=>{if(document.visibilityState==="visible")void refresh()};
    void refresh();
    const interval=setInterval(()=>void refresh(),isDashboard?15000:2500);
    document.addEventListener("visibilitychange",resume);
    return()=>{cancelled=true;controller.abort();clearInterval(interval);document.removeEventListener("visibilitychange",resume)};
  },[ready,watchKey,isDashboard,putRoom]);
  const createRoom:Store["createRoom"]=async input=>{const room:Classroom={id:crypto.randomUUID(),code:Array.from(crypto.getRandomValues(new Uint8Array(6)),n=>"ABCDEFGHJKLMNPQRSTUVWXYZ23456789"[n%32]).join(""),name:input.name,subject:input.subject,layout:input.layout,status:"OPEN",catalogVersion:2,desks:desks(input.count),students:[],activity:defaultActivity,createdAt:new Date().toISOString()};try{const data=await request<{room:Classroom;teacherToken:string}>("/api/rooms","POST",{room});putRoom(data.room);setOwnedRoomIds(old=>old.includes(room.id)?old:[...old,room.id]);setTokens(old=>({...old,[room.id]:data.teacherToken}));return data.room}catch(e){setError(e instanceof Error?e.message:"สร้างห้องไม่สำเร็จ");throw e}};
  const deleteRoom:Store["deleteRoom"]=async roomId=>{
    if(!tokens[roomId]&&!ownedRoomIds.includes(roomId))throw new Error("คุณไม่มีสิทธิ์ลบห้องนี้");
    const response=await fetch(`/api/teacher/rooms/${encodeURIComponent(roomId)}`,{method:"DELETE",headers:tokens[roomId]?{"x-teacher-token":tokens[roomId]}:{},cache:"no-store"});
    const data=await response.json() as {error?:string};
    if(!response.ok)throw new Error(data.error??"ลบห้องไม่สำเร็จ กรุณาลองอีกครั้ง");
    setRooms(current=>current.filter(room=>room.id!==roomId));
    setOwnedRoomIds(current=>current.filter(id=>id!==roomId));
    setTokens(current=>{const next={...current};delete next[roomId];return next});
    if(currentStudent?.roomId===roomId){setCurrentStudent(undefined);localStorage.removeItem(SESSION)}
  };
  const join:Store["join"]=async(code,nickname)=>{try{setError("");const data=await request<{room:Classroom;student:Student;token:string}>(`/api/rooms/${encodeURIComponent(code.toUpperCase())}`,"PATCH",{action:"join",nickname});putRoom(data.room);const session={roomId:data.room.id,studentId:data.student.id,token:data.token};setCurrentStudent(session);localStorage.setItem(SESSION,JSON.stringify(session));return data}catch(e){setError(e instanceof Error?e.message:"เข้าห้องไม่ได้");return null}};
  const studentAction=async(action:string,details:Record<string,unknown>={})=>{if(!currentStudent?.token)throw new Error("กรุณาสแกน QR เข้าห้องอีกครั้ง");const data=await request<{room:Classroom}>(`/api/rooms/${currentStudent.roomId}`,"PATCH",{action,token:currentStudent.token,...details});putRoom(data.room)};
  const teacherAction=async(roomId:string,action:string,details:Record<string,unknown>={})=>{const token=tokens[roomId];if(!token&&!ownedRoomIds.includes(roomId))throw new Error("คุณไม่มีสิทธิ์จัดการห้องนี้");const data=await request<{room:Classroom}>(`/api/rooms/${roomId}`,"PATCH",{action,token,...details});putRoom(data.room)};
  const updateAvatar:Store["updateAvatar"]=avatar=>studentAction("avatar",{avatar});
  const selectDesk:Store["selectDesk"]=async deskId=>{try{await studentAction("desk",{deskId});return{ok:true,message:"เลือกที่นั่งเรียบร้อย (โต๊ะยังไม่ถูกล็อก)"}}catch(e){return{ok:false,message:e instanceof Error?e.message:"เลือกโต๊ะไม่ได้"}}};
  const toggleHand=()=>studentAction("hand");
  const getHint:Store["getHint"]=async levelId=>{if(!currentStudent?.token)throw new Error("กรุณาสแกน QR เข้าห้องอีกครั้ง");const data=await request<{hint:string}>(`/api/rooms/${currentStudent.roomId}`,"PATCH",{action:"hint",token:currentStudent.token,levelId});return data.hint};
  const setRoomStatus=(roomId:string,status:Classroom["status"])=>teacherAction(roomId,"status",{status});
  const configureActivity=(roomId:string,activity:ActivityConfig)=>teacherAction(roomId,"activity",{activity});
  const setDeskLock=(roomId:string,deskId:string,locked:boolean)=>teacherAction(roomId,"deskLock",{deskId,locked});
  const setAllLocks=(roomId:string,locked:boolean)=>teacherAction(roomId,"allLocks",{locked});
  const moveStudent=(roomId:string,studentId:string,deskId:string)=>teacherAction(roomId,"moveStudent",{studentId,deskId});
  const submitAttempt:Store["submitAttempt"]=async(levelId,steps)=>{if(!currentStudent?.token)throw new Error("กรุณาสแกน QR เข้าห้องอีกครั้ง");const data=await request<{room:Classroom;correct:boolean;feedback:string;score:number;explanation:string}>(`/api/rooms/${currentStudent.roomId}`,"PATCH",{action:"attempt",token:currentStudent.token,levelId,steps});putRoom(data.room);return data};
  const value={ready,rooms,profile,currentStudent,error,canManage:(roomId:string)=>!!tokens[roomId]||ownedRoomIds.includes(roomId),teacherToken:(roomId:string)=>tokens[roomId],createRoom,deleteRoom,join,updateAvatar,selectDesk,toggleHand,getHint,setRoomStatus,configureActivity,setDeskLock,setAllLocks,moveStudent,submitAttempt};
  return <Context.Provider value={value}><WebMcpTools/>{children}</Context.Provider>;
}
export function useDemo(){const value=useContext(Context);if(!value)throw new Error("DemoProvider missing");return value}
export function currentStudentFrom(store:Pick<Store,"rooms"|"currentStudent">){const room=store.rooms.find(r=>r.id===store.currentStudent?.roomId);return{room,student:room?.students.find(s=>s.id===store.currentStudent?.studentId)}}
