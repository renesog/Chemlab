"use client";

import dynamic from "next/dynamic";
import type { PublicLevel } from "@/lib/levels";
import { ArrowDown, ArrowUp, Beaker, Droplets, FileText, Flame, FlaskConical, Magnet, Package, ScanSearch, Snowflake, Trash2, X } from "lucide-react";

const LabScene3D = dynamic(() => import("./lab-scene-3d"), { ssr: false, loading: () => <div className="virtual-lab-loading" role="status">กำลังเปิดห้องแล็บ 3 มิติ…</div> });

export function ToolIcon({ id, size = 22 }: { id: string; size?: number }) {
  const Icon = id.includes("magnet") ? Magnet : /sieve/.test(id) ? ScanSearch : /paper|filter/.test(id) ? FileText : /receiver|beaker/.test(id) ? Beaker : /water|pour|stir|dissolve|drain|settle/.test(id) ? Droplets : /heat|evaporate|sublime|dish/.test(id) ? Flame : /collect/.test(id) ? Package : /cool/.test(id) ? Snowflake : /remove/.test(id) ? Trash2 : FlaskConical;
  return <Icon size={size} aria-hidden="true"/>;
}

type BenchProps = { level: PublicLevel; selected: string[]; onAdd: (id: string) => void; onRemove: (id: string) => void; onReorder: (from: number, to: number) => void; busy?: boolean };

export function ChallengeWorkbench({ level, selected, onAdd, onRemove, onReorder, busy = false }: BenchProps) {
  return <div className="lab-workspace-3d">
    <LabScene3D key={level.id} equipment={level.equipment} selected={selected} onAdd={onAdd} busy={busy}/>
    <section className="lab-sequence" aria-label="ลำดับแผนทดลอง" onDragOver={event => event.preventDefault()} onDrop={event => { event.preventDefault(); if (busy) return; const id = event.dataTransfer.getData("equipment-id"); if (level.equipment.some(item => item.id === id)) onAdd(id); }}>
      <div className="lab-sequence-heading"><h2>แผนทดลองบนโต๊ะ</h2><span>{selected.length} ขั้นตอน · เรียงตามลำดับที่จะทำ</span></div>
      {selected.length ? <ol>{selected.map((id, index) => {
        const item = level.equipment.find(item => item.id === id); if (!item) return null;
        return <li key={id} draggable={!busy} onDragStart={event => { event.dataTransfer.setData("reorder-index", String(index)); event.dataTransfer.effectAllowed = "move"; }} onDragOver={event => event.preventDefault()} onDrop={event => { const source = event.dataTransfer.getData("reorder-index"); if (source !== "") { event.preventDefault(); event.stopPropagation(); const from = Number(source); if (!busy && Number.isInteger(from) && from >= 0 && from < selected.length) onReorder(from, index); } }}>
          <b className="lab-step-number">{index + 1}</b><ToolIcon id={id}/><span>{item.label}</span><div className="lab-step-actions"><button type="button" disabled={busy || index === 0} onClick={() => onReorder(index, index - 1)} aria-label={`เลื่อน ${item.label} ขึ้น`}><ArrowUp size={17}/></button><button type="button" disabled={busy || index === selected.length - 1} onClick={() => onReorder(index, index + 1)} aria-label={`เลื่อน ${item.label} ลง`}><ArrowDown size={17}/></button><button type="button" disabled={busy} onClick={() => onRemove(id)} aria-label={`นำ ${item.label} ออกจากโต๊ะ`}><X size={17}/></button></div>
        </li>;
      })}</ol> : <p className="lab-sequence-empty">เลือกอุปกรณ์จากห้อง 3 มิติหรือชั้นวางด้านล่าง แล้วจัดลำดับการแยกสาร</p>}
    </section>
  </div>;
}
