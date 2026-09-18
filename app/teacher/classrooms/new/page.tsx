"use client";

import { AppShell } from "@/components/app-shell";
import { DeskLayoutEditor } from "@/components/desk-layout-editor";
import { useDemo } from "@/lib/demo-store";
import { generateDesks } from "@/lib/desk";
import type { Classroom, Desk } from "@/lib/types";
import { Grid2X2, Rows3, Shapes, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export default function NewRoom() {
  const router = useRouter();
  const { createRoom } = useDemo();
  const [layout, setLayout] = useState<Classroom["layout"]>("ROWS");
  const [deskCount, setDeskCount] = useState<number>(12);
  const [desksList, setDesksList] = useState<Desk[]>(() => generateDesks(12, "ROWS"));
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  // When count changes from dropdown
  function handleCountChange(newCount: number) {
    setDeskCount(newCount);
    setDesksList(generateDesks(newCount, layout));
  }

  // When layout changes
  function handleLayoutChange(newLayout: Classroom["layout"]) {
    setLayout(newLayout);
    setDesksList(generateDesks(desksList.length, newLayout));
  }

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const f = new FormData(e.currentTarget);
    try {
      const room = await createRoom({
        name: String(f.get("name")),
        subject: String(f.get("subject")),
        count: desksList.length,
        layout,
        customDesks: desksList,
      });
      router.push(`/teacher/classrooms/${room.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "สร้างห้องไม่สำเร็จ");
    } finally {
      setBusy(false);
    }
  }

  return (
    <AppShell title="สร้างห้อง" back="/teacher/dashboard">
      <main className="narrow-shell">
        <div className="page-heading">
          <div>
            <p className="eyebrow">ห้องเรียนใหม่</p>
            <h1>ตั้งค่าห้องและผังโต๊ะเรียน</h1>
            <p>สร้างห้อง ออกแบบผังโต๊ะ และปรับตำแหน่งโต๊ะเรียนก่อนแชร์ QR ให้นักเรียน</p>
          </div>
        </div>

        <form className="panel form-stack modern-form-panel" onSubmit={submit}>
          <div className="form-grid">
            <label>
              ชื่อห้อง
              <input
                name="name"
                required
                minLength={2}
                maxLength={60}
                placeholder="เช่น ห้องทดลอง ม.2/1"
              />
            </label>
            <label>
              ชื่อวิชา
              <input
                name="subject"
                required
                maxLength={80}
                placeholder="เช่น วิทยาศาสตร์ — การแยกสาร"
              />
            </label>
            <label>
              จำนวนโต๊ะเริ่มต้น
              <select
                name="count"
                value={deskCount}
                onChange={(e) => handleCountChange(Number(e.target.value))}
              >
                <option value="8">8 โต๊ะ</option>
                <option value="12">12 โต๊ะ</option>
                <option value="16">16 โต๊ะ</option>
                <option value="20">20 โต๊ะ</option>
                <option value="24">24 โต๊ะ</option>
              </select>
            </label>
          </div>

          <fieldset>
            <legend>รูปแบบผังโต๊ะเริ่มต้น</legend>
            <div className="layout-choices">
              {[
                ["ROWS", "แถวปกติ", Rows3],
                ["U_SHAPE", "รูปตัว U", Shapes],
                ["GROUPS", "แบบกลุ่ม", Grid2X2],
              ].map(([value, label, Icon]) => (
                <button
                  type="button"
                  key={String(value)}
                  className={layout === value ? "active" : ""}
                  onClick={() => handleLayoutChange(value as Classroom["layout"])}
                >
                  <Icon size={26} />
                  <strong>{String(label)}</strong>
                </button>
              ))}
            </div>
          </fieldset>

          {/* Interactive Desk Layout Editor */}
          <div className="layout-editor-section">
            <DeskLayoutEditor
              desks={desksList}
              layout={layout}
              onChange={setDesksList}
            />
          </div>

          {error && (
            <p className="error-box" role="alert">
              {error}
            </p>
          )}

          <div className="form-actions">
            <button
              type="button"
              className="secondary-button"
              onClick={() => router.back()}
            >
              ยกเลิก
            </button>
            <button className="primary-button" type="submit" disabled={busy}>
              {busy ? "กำลังสร้างห้อง…" : "สร้างและเปิดห้องเรียน"}
            </button>
          </div>
        </form>
      </main>
    </AppShell>
  );
}

