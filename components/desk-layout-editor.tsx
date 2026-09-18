"use client";

import { useState } from "react";
import type { Classroom, Desk } from "@/lib/types";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Plus,
  Trash2,
  Tv,
  Edit3,
} from "lucide-react";

interface DeskLayoutEditorProps {
  desks: Desk[];
  layout: Classroom["layout"];
  onChange: (updatedDesks: Desk[]) => void;
}

export function DeskLayoutEditor({
  desks,
  layout,
  onChange,
}: DeskLayoutEditorProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editingLabel, setEditingLabel] = useState<string>("");
  const [hint, setHint] = useState<string>(
    "แตะเลือกโต๊ะเพื่อสลับตำแหน่ง หรือเปลี่ยนหมายเลขโต๊ะ"
  );

  const selectedDesk = desks.find((d) => d.id === selectedId);

  // Handle clicking a desk: if already selected one, swap them!
  function handleDeskClick(id: string) {
    if (!selectedId) {
      setSelectedId(id);
      const desk = desks.find((d) => d.id === id);
      setEditingLabel(desk?.label ?? "");
      setHint(`เลือกโต๊ะ ${desk?.label} แล้ว — แตะอีกโต๊ะเพื่อสลับตำแหน่ง หรือใช้ปุ่มด้านล่าง`);
    } else if (selectedId === id) {
      setSelectedId(null);
      setHint("ยกเลิกการเลือกโต๊ะแล้ว แตะโต๊ะที่ต้องการจัดการใหม่ได้ตลอดเวลา");
    } else {
      // Swap the two desks!
      const idxA = desks.findIndex((d) => d.id === selectedId);
      const idxB = desks.findIndex((d) => d.id === id);
      if (idxA !== -1 && idxB !== -1) {
        const next = [...desks];
        const temp = next[idxA];
        next[idxA] = next[idxB];
        next[idxB] = temp;
        onChange(next);
        setHint(`สลับตำแหน่งโต๊ะ ${desks[idxA].label} กับโต๊ะ ${desks[idxB].label} เรียบร้อยแล้ว ✨`);
      }
      setSelectedId(null);
    }
  }

  // Move desk left/right in array
  function moveDesk(direction: -1 | 1) {
    if (!selectedId) return;
    const idx = desks.findIndex((d) => d.id === selectedId);
    const targetIdx = idx + direction;
    if (idx === -1 || targetIdx < 0 || targetIdx >= desks.length) return;

    const next = [...desks];
    const [moved] = next.splice(idx, 1);
    next.splice(targetIdx, 0, moved);
    onChange(next);
  }

  // Move desk up/down (by row of 4)
  function moveDeskRow(direction: -4 | 4) {
    if (!selectedId) return;
    const idx = desks.findIndex((d) => d.id === selectedId);
    const targetIdx = idx + direction;
    if (idx === -1 || targetIdx < 0 || targetIdx >= desks.length) return;

    const next = [...desks];
    const temp = next[idx];
    next[idx] = next[targetIdx];
    next[targetIdx] = temp;
    onChange(next);
  }

  // Save label
  function handleSaveLabel() {
    if (!selectedId || !editingLabel.trim()) return;
    const next = desks.map((d) =>
      d.id === selectedId ? { ...d, label: editingLabel.trim() } : d
    );
    onChange(next);
    setHint(`เปลี่ยนชื่อเป็นโต๊ะ ${editingLabel.trim()} แล้ว`);
  }

  // Add new desk
  function handleAddDesk() {
    if (desks.length >= 40) return;
    const newNum = desks.length + 1;
    const newDesk: Desk = {
      id: `desk-${crypto.randomUUID().slice(0, 8)}`,
      label: `${newNum}`,
      locked: false,
      x: (desks.length % 4),
      y: Math.floor(desks.length / 4),
    };
    onChange([...desks, newDesk]);
    setHint(`เพิ่มโต๊ะ ${newNum} เรียบร้อยแล้ว (รวม ${desks.length + 1} โต๊ะ)`);
  }

  // Delete selected desk
  function handleDeleteDesk() {
    if (!selectedId || desks.length <= 4) return;
    const next = desks.filter((d) => d.id !== selectedId);
    onChange(next);
    setSelectedId(null);
    setHint(`ลบโต๊ะที่เลือกเรียบร้อยแล้ว (เหลือ ${next.length} โต๊ะ)`);
  }

  return (
    <div className="desk-editor-container">
      <div className="editor-header">
        <div>
          <h3 className="editor-title">ผังตัวอย่างและปรับตำแหน่งโต๊ะ (Interactive Preview)</h3>
          <p className="editor-hint">{hint}</p>
        </div>
        <div className="editor-top-actions">
          <button
            type="button"
            className="editor-btn add-btn"
            onClick={handleAddDesk}
            disabled={desks.length >= 40}
          >
            <Plus size={16} />
            <span>เพิ่มโต๊ะ (+1)</span>
          </button>
        </div>
      </div>

      {/* Classroom whiteboard / Projector */}
      <div className="classroom-stage">
        <div className="whiteboard-banner">
          <Tv size={16} />
          <span>หน้าห้องเรียน · กระดานดำ / จอโปรเจกเตอร์</span>
        </div>

        {/* The Grid of Desks */}
        <div className={`desk-editor-grid layout-${layout.toLowerCase()}`}>
          {desks.map((d, index) => {
            const isSelected = selectedId === d.id;
            return (
              <button
                type="button"
                key={d.id}
                className={`editor-desk ${isSelected ? "selected" : ""}`}
                onClick={() => handleDeskClick(d.id)}
                aria-pressed={isSelected}
              >
                <div className="editor-desk-top">
                  <span className="desk-seq">#{index + 1}</span>
                  {isSelected && <span className="desk-active-pill">เลือกอยู่</span>}
                </div>
                <div className="editor-desk-body">
                  <strong className="desk-label-text">{d.label}</strong>
                  <small>โต๊ะเรียน</small>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Control panel for selected desk */}
      {selectedDesk && (
        <div className="selected-desk-toolbar">
          <div className="toolbar-info">
            <span className="selected-badge">
              กำลังจัดการ: โต๊ะ <strong>{selectedDesk.label}</strong>
            </span>
            <div className="rename-box">
              <label htmlFor="desk-rename-input" className="sr-only">เปลี่ยนชื่อโต๊ะ</label>
              <input
                id="desk-rename-input"
                type="text"
                value={editingLabel}
                maxLength={6}
                onChange={(e) => setEditingLabel(e.target.value)}
                placeholder="เช่น A1"
                className="rename-input"
              />
              <button
                type="button"
                className="rename-save-btn"
                onClick={handleSaveLabel}
              >
                <Edit3 size={14} /> เปลี่ยนชื่อ
              </button>
            </div>
          </div>

          <div className="toolbar-actions">
            <div className="dpad-controls">
              <span className="dpad-label">เลื่อนตำแหน่ง:</span>
              <button
                type="button"
                className="dpad-btn"
                onClick={() => moveDeskRow(-4)}
                title="เลื่อนขึ้น 1 แถว"
                aria-label="เลื่อนขึ้น"
              >
                <ArrowUp size={16} />
              </button>
              <button
                type="button"
                className="dpad-btn"
                onClick={() => moveDesk(-1)}
                title="เลื่อนไปทางซ้าย"
                aria-label="เลื่อนซ้าย"
              >
                <ArrowLeft size={16} />
              </button>
              <button
                type="button"
                className="dpad-btn"
                onClick={() => moveDesk(1)}
                title="เลื่อนไปทางขวา"
                aria-label="เลื่อนขวา"
              >
                <ArrowRight size={16} />
              </button>
              <button
                type="button"
                className="dpad-btn"
                onClick={() => moveDeskRow(4)}
                title="เลื่อนลง 1 แถว"
                aria-label="เลื่อนลง"
              >
                <ArrowDown size={16} />
              </button>
            </div>

            <button
              type="button"
              className="toolbar-del-btn"
              onClick={handleDeleteDesk}
              disabled={desks.length <= 4}
              title="ลบโต๊ะนี้"
            >
              <Trash2 size={16} />
              <span>ลบโต๊ะ</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
