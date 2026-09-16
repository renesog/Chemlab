"use client";

import { AppShell } from "@/components/app-shell";
import { TeacherProfileForm } from "@/components/teacher-profile-form";
import { GraduationCap, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { auth } from "@/lib/firebase/config";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";

export default function TeacherLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [user, setUser] = useState<{ uid: string; email: string } | null>(null);

  async function handleAuth(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password.trim()) { setError("กรุณากรอกอีเมลและรหัสผ่าน"); return; }
    if (password.length < 6) { setError("รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร"); return; }
    setLoading(true); setError("");
    try {
      const fn = isRegister ? createUserWithEmailAndPassword : signInWithEmailAndPassword;
      const cred = await fn(auth, email.trim(), password);
      setUser({ uid: cred.user.uid, email: cred.user.email ?? email });
    } catch (err: unknown) {
      const code = (err as { code?: string }).code ?? "";
      if (code === "auth/email-already-in-use") setError("อีเมลนี้ถูกใช้งานแล้ว กรุณาเข้าสู่ระบบแทน");
      else if (code === "auth/invalid-credential" || code === "auth/wrong-password" || code === "auth/user-not-found") setError("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
      else if (code === "auth/weak-password") setError("รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร");
      else if (code === "auth/invalid-email") setError("รูปแบบอีเมลไม่ถูกต้อง");
      else setError("เข้าสู่ระบบไม่สำเร็จ กรุณาลองอีกครั้ง");
    } finally { setLoading(false); }
  }

  return (
    <AppShell title="สำหรับครู">
      <main className="center-shell">
        <section className="form-card teacher-account-card">
          <div className="section-icon"><GraduationCap /></div>
          <p className="eyebrow">พื้นที่สำหรับครู</p>
          <h1>{user ? "สมัครโปรไฟล์ครู" : isRegister ? "สมัครบัญชีครู" : "เข้าสู่ระบบครู"}</h1>

          {user ? (
            <TeacherProfileForm email={user.email} submitLabel="สร้างโปรไฟล์และเริ่มใช้งาน" />
          ) : (
            <>
              <p className="muted">
                {isRegister
                  ? "สร้างบัญชีเพื่อจัดห้องเรียนและติดตามผลนักเรียน"
                  : "เข้าสู่ระบบอย่างปลอดภัยก่อนตั้งชื่อเล่นและสร้างห้องเรียน นักเรียนยังเข้าห้องผ่าน QR ได้โดยไม่ต้องสมัครบัญชี"}
              </p>
              <form onSubmit={handleAuth} className="auth-form">
                <label>
                  <span>อีเมล</span>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="teacher@example.com"
                    autoComplete="email"
                    required
                  />
                </label>
                <label>
                  <span>รหัสผ่าน</span>
                  <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="อย่างน้อย 6 ตัวอักษร"
                    autoComplete={isRegister ? "new-password" : "current-password"}
                    required
                    minLength={6}
                  />
                </label>
                {error && <p className="error-box" role="alert">{error}</p>}
                <button type="submit" className="primary-button" disabled={loading}>
                  {loading ? <><Loader2 className="animate-spin" size={18} /> กำลังดำเนินการ...</> : isRegister ? "สมัครบัญชี" : "เข้าสู่ระบบ"}
                </button>
              </form>
              <button
                type="button"
                className="text-link toggle-auth"
                onClick={() => { setIsRegister(!isRegister); setError(""); }}
              >
                {isRegister ? "มีบัญชีแล้ว? เข้าสู่ระบบ" : "ยังไม่มีบัญชี? สมัครใหม่"}
              </button>
            </>
          )}
        </section>
      </main>
    </AppShell>
  );
}
