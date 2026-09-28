"use client";
import { JoinForm } from "@/components/join-form";
import { useParams } from "next/navigation";

export default function JoinByCode(){const {code}=useParams<{code:string}>();return <JoinForm initialCode={code}/>}
