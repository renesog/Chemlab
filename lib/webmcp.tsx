"use client";
import { useEffect } from "react";

declare global { interface Document { modelContext?: { registerTool:(tool:{name:string;title:string;description:string;inputSchema:object;execute:(input:unknown)=>unknown;annotations:object},options?:{signal:AbortSignal})=>void|Promise<void> } } }
export function WebMcpTools(){useEffect(()=>{const context=document.modelContext;if(!context?.registerTool)return;const controller=new AbortController();void Promise.resolve(context.registerTool({name:"start_student_join",title:"เริ่มเข้าห้องเรียน",description:"เปิดหน้าสำหรับนักเรียนเพื่อกรอกรหัสห้องและชื่อเล่น",inputSchema:{type:"object",properties:{},additionalProperties:false},annotations:{readOnlyHint:false,untrustedContentHint:false},execute:()=>{location.assign("/join");return{status:"join_form_opened"}}},{signal:controller.signal})).catch(()=>{});return()=>controller.abort()},[]);return null}
