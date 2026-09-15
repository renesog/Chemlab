"use client";
import { JoinForm } from "../page";
import { useParams } from "next/navigation";

export default function JoinByCode(){const {code}=useParams<{code:string}>();return <JoinForm initialCode={code}/>}
