"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { ActivityConfig, Avatar, Classroom, Student } from "./types";
import { WebMcpTools } from "./webmcp";

const KEY="chemclass-demo-v1";
const SESSION="chemclass-student-session";
const TEACHERS="chemclass-teacher-tokens";
const defaultAvatar:Avatar={gender:"boy",skin:"medium",hair:"short",hairColor:"black",shirt:"cyan",hat:"none"};
export const defaultActivity:ActivityConfig={mode:"PRESET",title:"ภารกิจการแยกสาร",levelIds:[1,2,3,4,5,6,7,8],pointsByLevel:{1:5,2:5,3:5,4:5,5:5,6:5,7:5,8:5}};
function desks(count=12){return Array.from({length:count},(_,i)=>({id:`desk-${i+1}`,label:`${i+1}`,locked:false,x:i%4,y:Math.floor(i/4)}))}
const seed:Classroom[]=[];
function normalizeRooms(value:Classroom[]){return value.map(room=>({...room,activity:room.activity??defaultActivity,students:room.students.map(student=>({...student,avatar:{...defaultAvatar,...student.avatar}}))}))}
type Session={roomId:string;studentId:string;token?:string};
type Store={ready:boolean;rooms:Classroom[];currentStudent?:Session;error:string;canManage(roomId:string):boolean;createRoom(input:{name:string;subject:string;count:number;layout:Classroom["layout"]}):Promise<Classroom>;join(code:string,nickname:string):Promise<{room:Classroom;student:Student}|null>;updateAvatar(avatar:Avatar):Promise<void>;selectDesk(deskId:string):Promise<{ok:boolean;message:string}>;toggleHand():Promise<void>;setRoomStatus(roomId:string,status:Classroom["status"]):Promise<void>;configureActivity(roomId:string,activity:ActivityConfig):Promise<void>;setDeskLock(roomId:string,deskId:string,locked:boolean):Promise<void>;setAllLocks(roomId:string,locked:boolean):Promise<void>;moveStudent(roomId:string,studentId:string,deskId:string):Promise<void>;submitAttempt(levelId:number,steps:string[]):Promise<{correct:boolean;feedback:string;score:number}>};
const Context=createContext<Store|null>(null);
async function request<T>(path:string,method="GET",body?:unknown):Promise<T>{const response=await fetch(path,{method,headers:{"content-type":"application/json"},body:body?JSON.stringify(body):undefined,cache:"no-store"});const data=await response.json() as {error?:string};if(!response.ok)throw new Error(data.error??"เชื่อมต่อห้องเรียนไม่ได้");return data as T}

export function DemoProvider({children}:{children:React.ReactNode}){
  const [rooms,setRooms]=useState<Classroom[]>(seed);
  const [currentStudent,setCurrentStudent]=useState<Session|undefined>();
  const [tokens,setTokens]=useState<Record<string,string>>({});
  const [ready,setReady]=useState(false);
  const [error,setError]=useState("");
  const putRoom=useCallback((room:Classroom)=>setRooms(previous=>{const current=previous.find(item=>item.id===room.id);if(current&&JSON.stringify(current)===JSON.stringify(room))return previous;return[room,...previous.filter(item=>item.id!==room.id)]}),[]);
  useEffect(()=>{try{const saved=localStorage.getItem(KEY);if(saved)setRooms(normalizeRooms(JSON.parse(saved)));const session=localStorage.getItem(SESSION);if(session)setCurrentStudent(JSON.parse(session));const teacher=localStorage.getItem(TEACHERS);if(teacher)setTokens(JSON.parse(teacher))}finally{setReady(true)}},[]);
  useEffect(()=>{if(ready)localStorage.setItem(KEY,JSON.stringify(rooms))},[rooms,ready]);
  useEffect(()=>{if(ready)localStorage.setItem(TEACHERS,JSON.stringify(tokens))},[tokens,ready]);
  useEffect(()=>{if(!ready)return;const sync=(event:StorageEvent)=>{if(event.key===KEY&&event.newValue)setRooms(normalizeRooms(JSON.parse(event.newValue)))};addEventListener("storage",sync);return()=>removeEventListener("storage",sync)},[ready]);
  const roomIds=rooms.map(r=>r.id).join(",");const studentRoomId=currentStudent?.roomId;
  useEffect(()=>{if(!ready)return;let cancelled=false;const refresh=async()=>{const known=new Set(roomIds?roomIds.split(","):[]);if(studentRoomId)known.add(studentRoomId);for(const id of known){try{const data=await request<{room:Classroom}>(`/api/rooms/${encodeURIComponent(id)}`);if(!cancelled)putRoom(data.room)}catch{/* A local room may not yet be published. */}}};void refresh();const interval=setInterval(refresh,2500);return()=>{cancelled=true;clearInterval(interval)}},[ready,studentRoomId,roomIds,putRoom]);
  const createRoom:Store["createRoom"]=async input=>{const room:Classroom={id:crypto.randomUUID(),code:Array.from(crypto.getRandomValues(new Uint8Array(6)),n=>"ABCDEFGHJKLMNPQRSTUVWXYZ23456789"[n%32]).join(""),name:input.name,subject:input.subject,layout:input.layout,status:"OPEN",desks:desks(input.count),students:[],activity:defaultActivity,createdAt:new Date().toISOString()};try{const data=await request<{room:Classroom;teacherToken:string}>("/api/rooms","POST",{room});putRoom(data.room);setTokens(old=>({...old,[room.id]:data.teacherToken}));return data.room}catch(e){setError(e instanceof Error?e.message:"สร้างห้องไม่สำเร็จ");throw e}};
  const join:Store["join"]=async(code,nickname)=>{try{setError("");const data=await request<{room:Classroom;student:Student;token:string}>(`/api/rooms/${encodeURIComponent(code.toUpperCase())}`,"PATCH",{action:"join",nickname});putRoom(data.room);const session={roomId:data.room.id,studentId:data.student.id,token:data.token};setCurrentStudent(session);localStorage.setItem(SESSION,JSON.stringify(session));return data}catch(e){setError(e instanceof Error?e.message:"เข้าห้องไม่ได้");return null}};
  const studentAction=async(action:string,details:Record<string,unknown>={})=>{if(!currentStudent?.token)throw new Error("กรุณาสแกน QR เข้าห้องอีกครั้ง");const data=await request<{room:Classroom}>(`/api/rooms/${currentStudent.roomId}`,"PATCH",{action,token:currentStudent.token,...details});putRoom(data.room)};
  const teacherAction=async(roomId:string,action:string,details:Record<string,unknown>={})=>{const token=tokens[roomId];if(!token)throw new Error("ห้องเก่ายังไม่ได้แชร์ข้ามเครื่อง กรุณาสร้างห้องใหม่");const data=await request<{room:Classroom}>(`/api/rooms/${roomId}`,"PATCH",{action,token,...details});putRoom(data.room)};
  const updateAvatar:Store["updateAvatar"]=avatar=>studentAction("avatar",{avatar});
  const selectDesk:Store["selectDesk"]=async deskId=>{try{await studentAction("desk",{deskId});return{ok:true,message:"เลือกที่นั่งเรียบร้อย (โต๊ะยังไม่ถูกล็อก)"}}catch(e){return{ok:false,message:e instanceof Error?e.message:"เลือกโต๊ะไม่ได้"}}};
  const toggleHand=()=>studentAction("hand");
  const setRoomStatus=(roomId:string,status:Classroom["status"])=>teacherAction(roomId,"status",{status});
  const configureActivity=(roomId:string,activity:ActivityConfig)=>teacherAction(roomId,"activity",{activity});
  const setDeskLock=(roomId:string,deskId:string,locked:boolean)=>teacherAction(roomId,"deskLock",{deskId,locked});
  const setAllLocks=(roomId:string,locked:boolean)=>teacherAction(roomId,"allLocks",{locked});
  const moveStudent=(roomId:string,studentId:string,deskId:string)=>teacherAction(roomId,"moveStudent",{studentId,deskId});
  const submitAttempt:Store["submitAttempt"]=async(levelId,steps)=>{if(!currentStudent?.token)throw new Error("กรุณาสแกน QR เข้าห้องอีกครั้ง");const data=await request<{room:Classroom;correct:boolean;feedback:string;score:number}>(`/api/rooms/${currentStudent.roomId}`,"PATCH",{action:"attempt",token:currentStudent.token,levelId,steps});putRoom(data.room);return data};
  const value={ready,rooms,currentStudent,error,canManage:(roomId:string)=>!!tokens[roomId],createRoom,join,updateAvatar,selectDesk,toggleHand,setRoomStatus,configureActivity,setDeskLock,setAllLocks,moveStudent,submitAttempt};
  return <Context.Provider value={value}><WebMcpTools/>{children}</Context.Provider>;
}
export function useDemo(){const value=useContext(Context);if(!value)throw new Error("DemoProvider missing");return value}
export function currentStudentFrom(store:Pick<Store,"rooms"|"currentStudent">){const room=store.rooms.find(r=>r.id===store.currentStudent?.roomId);return{room,student:room?.students.find(s=>s.id===store.currentStudent?.studentId)}}
