"use client";

import { useState } from "react";
import { Hand, LockKeyhole, Sparkles, Unlock, UserCheck } from "lucide-react";
import { Avatar } from "@/components/avatar";
import type { Classroom, Desk } from "@/lib/types";
import { deskState } from "@/lib/desk";

const labels = {
  AVAILABLE: "โต๊ะว่าง",
  OCCUPIED: "มีเพื่อนร่วมชั้นนั่ง",
  LOCKED_EMPTY: "คุณครูล็อกโต๊ะ",
  LOCKED_OCCUPIED: "ล็อกที่นั่งแล้ว",
};

function DeskContent({ desk, room }: { desk: Desk; room: Classroom }) {
  const state = deskState(desk);
  const student = room.students.find((s) => s.id === desk.occupantId);

  return (
    <>
      <div className="desk-top-bar">
        <span className="desk-number-badge">
          โต๊ะ <strong>{desk.label}</strong>
        </span>
        <span className={`desk-lock-pill ${desk.locked ? "is-locked" : "is-unlocked"}`}>
          {desk.locked ? <LockKeyhole size={13} /> : <Unlock size={13} />}
          <small>{desk.locked ? "ล็อก" : "เปิด"}</small>
        </span>
      </div>

      <div className="desk-body">
        {student ? (
          <div className="desk-occupant">
            <div className="desk-avatar-wrapper">
              <Avatar value={student.avatar} size={36} />
              {student.handRaised && (
                <span className="hand-raise-indicator" title="ยกมือถามคุณครู">
                  <Hand size={14} className="hand-wave-icon" />
                </span>
              )}
            </div>
            <div className="occupant-details">
              <b className="occupant-name">{student.nickname}</b>
              {student.handRaised ? (
                <span className="hand-raised-text">
                  <Hand size={11} /> ยกมือถาม
                </span>
              ) : (
                <span className="desk-status-pill occupied">กำลังอยู่ในห้อง</span>
              )}
            </div>
          </div>
        ) : (
          <div className="desk-empty-state">
            <span className={`empty-desk-tag ${state.toLowerCase()}`}>
              {desk.locked ? "โต๊ะถูกล็อก" : "แตะเพื่อเลือก"}
            </span>
          </div>
        )}
      </div>
    </>
  );
}

export function DeskGrid({
  room,
  onSelect,
  onLock,
  onMoveStudent,
  selectedId,
}: {
  room: Classroom;
  onSelect?: (id: string) => void;
  onLock?: (id: string, locked: boolean) => void;
  onMoveStudent?: (studentId: string, toDeskId: string) => void;
  selectedId?: string;
}) {
  const [movingStudent, setMovingStudent] = useState<{ id: string; nickname: string; fromDeskId: string } | null>(null);

  function handleTeacherDeskClick(desk: Desk) {
    if (!onMoveStudent) return;
    const student = room.students.find((s) => s.id === desk.occupantId);

    // If already in move mode
    if (movingStudent) {
      // If clicking same desk or occupied desk, cancel or switch
      if (desk.id === movingStudent.fromDeskId) {
        setMovingStudent(null);
        return;
      }
      if (student) {
        // Switch to this new student instead
        setMovingStudent({ id: student.id, nickname: student.nickname, fromDeskId: desk.id });
        return;
      }
      // Target desk is empty! Move student here!
      onMoveStudent(movingStudent.id, desk.id);
      setMovingStudent(null);
      return;
    }

    // If not in move mode and clicking a student, initiate move mode
    if (student) {
      setMovingStudent({ id: student.id, nickname: student.nickname, fromDeskId: desk.id });
    }
  }

  return (
    <div className={`desk-grid modern-desk-grid layout-${room.layout.toLowerCase()}`}>
      {movingStudent && (
        <div className="moving-student-banner">
          <span>
            กำลังย้าย <b>{movingStudent.nickname}</b> ➡️ แตะโต๊ะว่างที่ต้องการย้ายไป
          </span>
          <button
            type="button"
            className="moving-cancel-btn"
            onClick={() => setMovingStudent(null)}
          >
            ยกเลิก
          </button>
        </div>
      )}

      {room.desks.map((d) => {
        const state = deskState(d);
        const student = room.students.find((s) => s.id === d.occupantId);
        const selected = selectedId === d.id || movingStudent?.fromDeskId === d.id;
        const handRaised = !!student?.handRaised;
        const isMoveTarget = movingStudent && !d.occupantId && !d.locked;

        const className = [
          "desk",
          "modern-desk",
          state.toLowerCase(),
          selected ? "selected-desk" : "",
          handRaised ? "hand-raised" : "",
          isMoveTarget ? "move-target-desk" : "",
        ]
          .filter(Boolean)
          .join(" ");

        if (onLock) {
          return (
            <article
              key={d.id}
              className={className}
              aria-label={`โต๊ะ ${d.label} ${labels[state]}`}
              onClick={() => handleTeacherDeskClick(d)}
              style={{ cursor: onMoveStudent ? "pointer" : "default" }}
            >
              <div className="desk-surface">
                <DeskContent desk={d} room={room} />

                {isMoveTarget && (
                  <span className="move-target-indicator">
                    แตะเพื่อย้ายมาโต๊ะนี้
                  </span>
                )}

                <div className="teacher-desk-actions" onClick={(e) => e.stopPropagation()}>
                  {student && onMoveStudent && !movingStudent && (
                    <button
                      type="button"
                      className="desk-move-btn"
                      onClick={() => setMovingStudent({ id: student.id, nickname: student.nickname, fromDeskId: d.id })}
                    >
                      ย้ายที่นั่ง
                    </button>
                  )}
                  <button
                    type="button"
                    className={`desk-lock-action ${d.locked ? "unlock-action" : "lock-action"}`}
                    onClick={() => onLock(d.id, !d.locked)}
                  >
                    {d.locked ? (
                      <>
                        <Unlock size={14} /> ปลดล็อก
                      </>
                    ) : (
                      <>
                        <LockKeyhole size={14} /> ล็อก
                      </>
                    )}
                  </button>
                </div>
              </div>
            </article>
          );
        }

        return (
          <button
            type="button"
            key={d.id}
            className={className}
            onClick={() => onSelect?.(d.id)}
            disabled={d.locked || (!!d.occupantId && !selected)}
            aria-pressed={selected}
            aria-label={`โต๊ะ ${d.label} ${labels[state]}`}
          >
            <div className="desk-surface">
              <DeskContent desk={d} room={room} />
              {selected && (
                <span className="selected-ribbon">
                  <UserCheck size={14} /> ที่นั่งของคุณ
                </span>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}
