"use client";

import type { PublicLevel } from "@/lib/levels";
import {
  ArrowDown, ArrowRight, ArrowUp, Beaker, Droplets, FileText, Flame,
  FlaskConical, GripVertical, Magnet, Package, ScanSearch, Snowflake,
  Trash2, X, ShieldCheck, Atom,
} from "lucide-react";
import { type DragEvent, useCallback, useRef, useState } from "react";

/* ── Icon resolver ─────────────────────────────────────────── */

export function ToolIcon({ id, size = 22 }: { id: string; size?: number }) {
  const Icon = id.includes("magnet")
    ? Magnet
    : /sieve/.test(id)
    ? ScanSearch
    : /paper|filter/.test(id)
    ? FileText
    : /receiver|beaker/.test(id)
    ? Beaker
    : /water|pour|stir|dissolve|drain|settle/.test(id)
    ? Droplets
    : /heat|evaporate|sublime|dish/.test(id)
    ? Flame
    : /collect/.test(id)
    ? Package
    : /cool/.test(id)
    ? Snowflake
    : /remove/.test(id)
    ? Trash2
    : FlaskConical;
  return <Icon size={size} aria-hidden="true" />;
}

/* ── Lab Room ──────────────────────────────────────────────── */

interface BenchProps {
  level: PublicLevel;
  selected: string[];
  onAdd: (id: string) => void;
  onRemove: (id: string) => void;
  onReorder: (from: number, to: number) => void;
}

export function ChallengeWorkbench({ level, selected, onAdd, onRemove, onReorder }: BenchProps) {
  const materials = level.mixture.split(/\s*\+\s*/);
  const [dragOverSlot, setDragOverSlot] = useState<number | null>(null);
  const [reorderFrom, setReorderFrom] = useState<number | null>(null);

  /* Drop from shelf → add to bench end */
  const handleDrop = useCallback(
    (event: DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      setDragOverSlot(null);
      const id = event.dataTransfer.getData("equipment-id");
      if (id && level.equipment.some((item) => item.id === id)) {
        onAdd(id);
      }
    },
    [level.equipment, onAdd],
  );

  /* Drop for reorder within bench */
  const handleSlotDrop = useCallback(
    (event: DragEvent<HTMLDivElement>, targetIndex: number) => {
      event.preventDefault();
      event.stopPropagation();
      setDragOverSlot(null);

      const equipId = event.dataTransfer.getData("equipment-id");
      const reorderIdx = event.dataTransfer.getData("reorder-index");

      if (reorderIdx !== "") {
        const fromIdx = parseInt(reorderIdx, 10);
        if (fromIdx !== targetIndex) onReorder(fromIdx, targetIndex);
      } else if (equipId && level.equipment.some((item) => item.id === equipId)) {
        onAdd(equipId);
      }
    },
    [level.equipment, onAdd, onReorder],
  );

  return (
    <div className="lab-room" aria-label="ห้องทดลอง">
      {/* ── Lab wall decorations ── */}
      <div className="lab-wall">
        <div className="wall-decor wall-decor-left">
          <Atom size={16} />
          <span>Lab</span>
        </div>
        <div className="wall-decor wall-decor-right">
          <ShieldCheck size={14} />
          <span>Safety First</span>
        </div>
        <div className="lab-window">
          <div className="window-glass" />
          <div className="window-glass" />
        </div>
      </div>

      {/* ── Lab bench (table) ── */}
      <div className="lab-table">
        <div className="table-edge-back" />
        <div
          className="table-surface"
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
        >
          {/* Sample flask */}
          <div className="table-item sample-flask">
            <div className="flask-visual">
              <FlaskConical size={40} strokeWidth={1.5} />
            </div>
            <span className="flask-label">สารผสม</span>
            <div className="flask-tags">
              {materials.map((name, i) => (
                <span key={`${i}-${name}`}>{name.trim()}</span>
              ))}
            </div>
          </div>

          {/* Steps placed on bench */}
          {selected.map((id, index) => {
            const item = level.equipment.find((e) => e.id === id);
            if (!item) return null;
            return (
              <div key={`step-${id}`} className="table-step-group">
                <div className="table-arrow" aria-hidden="true">
                  <ArrowRight className="arrow-h" size={20} />
                  <ArrowDown className="arrow-v" size={20} />
                </div>
                <div
                  className={`table-slot filled ${dragOverSlot === index ? "drag-over" : ""}`}
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData("reorder-index", String(index));
                    e.dataTransfer.effectAllowed = "move";
                    setReorderFrom(index);
                  }}
                  onDragEnd={() => setReorderFrom(null)}
                  onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setDragOverSlot(index); }}
                  onDragLeave={() => setDragOverSlot(null)}
                  onDrop={(e) => handleSlotDrop(e, index)}
                >
                  <span className="slot-num">{index + 1}</span>
                  <ToolIcon id={item.id} size={28} />
                  <span className="slot-name">{item.label}</span>
                  <div className="slot-controls">
                    <button onClick={() => { if (index > 0) onReorder(index, index - 1); }} disabled={index === 0} aria-label="ขึ้น"><ArrowUp size={13} /></button>
                    <button onClick={() => { if (index < selected.length - 1) onReorder(index, index + 1); }} disabled={index === selected.length - 1} aria-label="ลง"><ArrowDown size={13} /></button>
                    <button className="ctrl-remove" onClick={() => onRemove(id)} aria-label="ลบ"><X size={13} /></button>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Empty drop zone */}
          <div className="table-step-group">
            <div className="table-arrow" aria-hidden="true">
              <ArrowRight className="arrow-h" size={20} />
              <ArrowDown className="arrow-v" size={20} />
            </div>
            <div
              className={`table-slot empty-slot ${dragOverSlot === -1 ? "drag-over" : ""}`}
              onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setDragOverSlot(-1); }}
              onDragLeave={() => setDragOverSlot(null)}
              onDrop={(e) => {
                e.preventDefault(); e.stopPropagation(); setDragOverSlot(null);
                const id = e.dataTransfer.getData("equipment-id");
                if (id && level.equipment.some((item) => item.id === id)) onAdd(id);
              }}
            >
              <span className="slot-num empty-num">{selected.length + 1}</span>
              <span className="slot-hint">{selected.length === 0 ? "ลากอุปกรณ์มาวาง" : "เพิ่มขั้นตอน"}</span>
            </div>
          </div>

          {/* Result beaker */}
          <div className="table-step-group">
            <div className="table-arrow" aria-hidden="true">
              <ArrowRight className="arrow-h" size={20} />
              <ArrowDown className="arrow-v" size={20} />
            </div>
            <div className="table-item result-beaker">
              <Beaker size={36} strokeWidth={1.5} />
              <span>ผลลัพธ์</span>
              <small>{selected.length ? `${selected.length} ขั้นตอน` : "รอทดลอง"}</small>
            </div>
          </div>
        </div>
        <div className="table-edge-front" />
        <div className="table-legs">
          <div className="leg" /><div className="leg" />
        </div>
      </div>

      {/* ── Floor ── */}
      <div className="lab-floor" />
    </div>
  );
}
