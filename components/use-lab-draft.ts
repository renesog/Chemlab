"use client";
import { useEffect, useState, type SetStateAction } from "react";
import { readDraft } from "@/lib/lab-session";

export function useLabDraft(key: string, allowedIds: string[]) {
  const [draft, setDraft] = useState<{ key: string; steps: string[]; storageWarning?: string }>({ key: "", steps: [] });
  const [warning, setWarning] = useState("");
  const allowed = JSON.stringify(allowedIds);
  useEffect(() => {
    let steps: string[] = [];
    let storageWarning = "";
    try { steps = readDraft(localStorage.getItem(key), JSON.parse(allowed)); }
    catch { storageWarning = "อุปกรณ์นี้บันทึกแผนไม่ได้ กรุณาอย่าปิดหน้าระหว่างทำด่าน"; }
    // Hydrate the current level from browser storage, never write a previous level into this key.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDraft({ key, steps, storageWarning });
  }, [key, allowed]);
  function update(action: SetStateAction<string[]>) {
    const previous = draft.key === key ? draft.steps : [];
    const steps = typeof action === "function" ? action(previous) : action;
    try { localStorage.setItem(key, JSON.stringify(steps)); }
    catch { setWarning("บันทึกแผนไม่สำเร็จ กรุณาอย่าปิดหน้าระหว่างทำด่าน"); }
    setDraft({ key, steps });
  }
  function clear() { try { localStorage.removeItem(key); } catch {} }
  return { selected: draft.key === key ? draft.steps : [], setSelected: update, clear, draftReady: draft.key === key, warning: warning || draft.storageWarning };
}
