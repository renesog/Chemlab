"use client";

import { AppShell } from "@/components/app-shell";
import { TeacherProfileForm } from "@/components/teacher-profile-form";
import { GraduationCap, Loader2, Lock, LogIn, Mail, UserPlus } from "lucide-react";
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
    if (!email.trim() || !password.trim()) {
      setError("กรุณากรอกอีเมลและรหัสผ่าน");
      return;
    }
    if (password.length < 6) {
      setError("รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const fn = isRegister ? createUserWithEmailAndPassword : signInWithEmailAndPassword;
      const cred = await fn(auth, email.trim(), password);
      setUser({ uid: cred.user.uid, email: cred.user.email ?? email.trim() });
    } catch (err: unknown) {
      console.error("Firebase auth error:", err);
      const code = (err as { code?: string }).code ?? "";
      const msg = (err as { message?: string }).message ?? "";
      if (code === "auth/operation-not-allowed") {
        setError("ยังไม่ได้เปิดใช้งาน Email/Password ใน Firebase Console (ไปที่ Firebase > Authentication > Sign-in method แล้วเปิด Enable Email/Password)");
      } else if (code === "auth/unauthorized-domain") {
        setError("โดเมนนี้ยังไม่ได้รับอนุญาต (ไปที่ Firebase > Authentication > Settings > Authorized domains แล้วเพิ่มโดเมนนี้)");
      } else if (code === "auth/email-already-in-use") {
        setError("อีเมลนี้ถูกใช้งานแล้ว กรุณากดแท็บ 'เข้าสู่ระบบ' แทน");
      } else if (code === "auth/invalid-credential" || code === "auth/wrong-password" || code === "auth/user-not-found") {
        setError("อีเมลหรือรหัสผ่านไม่ถูกต้อง (หากยังไม่มีบัญชี ให้กดแท็บ 'สมัครสมาชิกใหม่' ก่อน)");
      } else if (code === "auth/weak-password") {
        setError("รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร");
      } else if (code === "auth/invalid-email") {
        setError("รูปแบบอีเมลไม่ถูกต้อง");
      } else {
        setError(`เกิดข้อผิดพลาด (${code || msg || "unknown"}) กรุณาลองใหม่อีกครั้ง`);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppShell title="สำหรับครู">
      <main className="center-shell">
        <section className="form-card teacher-account-card">
          <div className="section-icon">
            <GraduationCap size={28} />
          </div>
          <p className="eyebrow">พื้นที่สำหรับครูผู้สอน</p>
          <h1>{user ? "ตั้งค่าโปรไฟล์ครู" : isRegister ? "สมัครสมาชิกบัญชีครู" : "เข้าสู่ระบบครู"}</h1>

          {user ? (
            <TeacherProfileForm email={user.email} submitLabel="บันทึกโปรไฟล์และเริ่มใช้งาน" />
          ) : (
            <>
              <p className="muted">
                {isRegister
                  ? "สร้างบัญชีผู้สอนเพื่อจัดการห้องเรียน สร้างโต๊ะ ออกโจทย์ และติดตามคะแนนนักเรียนแบบเรียลไทม์"
                  : "เข้าสู่ระบบเพื่อจัดการห้องเรียนของคุณ นักเรียนสามารถเข้าร่วมผ่าน QR Code ได้โดยไม่ต้องสมัครบัญชี"}
              </p>

              {/* Toggle Tab */}
              <div className="auth-tabs" role="tablist">
                <button
                  type="button"
                  className={`auth-tab ${!isRegister ? "active" : ""}`}
                  onClick={() => { setIsRegister(false); setError(""); }}
                >
                  <LogIn size={18} />
                  <span>เข้าสู่ระบบ</span>
                </button>
                <button
                  type="button"
                  className={`auth-tab ${isRegister ? "active" : ""}`}
                  onClick={() => { setIsRegister(true); setError(""); }}
                >
                  <UserPlus size={18} />
                  <span>สมัครสมาชิกใหม่</span>
                </button>
              </div>

              <form onSubmit={handleAuth} className="form-stack teacher-auth-form">
                <label>
                  <span>อีเมล</span>
                  <div className="input-wrap">
                    <Mail size={18} aria-hidden="true" />
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="teacher@school.ac.th"
                      autoComplete="email"
                      required
                    />
                  </div>
                </label>

                <label>
                  <span>รหัสผ่าน</span>
                  <div className="input-wrap">
                    <Lock size={18} aria-hidden="true" />
                    <input
                      type="password"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="รหัสผ่านอย่างน้อย 6 ตัวอักษร"
                      autoComplete={isRegister ? "new-password" : "current-password"}
                      required
                      minLength={6}
                    />
                  </div>
                </label>

                {error && (
                  <p className="error-box" role="alert">
                    {error}
                  </p>
                )}

                <button type="submit" className="primary-button auth-submit-btn" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin" size={20} />
                      <span>กำลังดำเนินการ...</span>
                    </>
                  ) : isRegister ? (
                    <>
                      <UserPlus size={20} />
                      <span>สมัครบัญชีครู</span>
                    </>
                  ) : (
                    <>
                      <LogIn size={20} />
                      <span>เข้าสู่ระบบ</span>
                    </>
                  )}
                </button>
              </form>

              <div className="auth-footer-prompt">
                <span>{isRegister ? "มีบัญชีครูอยู่แล้ว?" : "ยังไม่มีบัญชีครู?"}</span>
                <button
                  type="button"
                  className="auth-switch-link"
                  onClick={() => { setIsRegister(!isRegister); setError(""); }}
                >
                  {isRegister ? "เข้าสู่ระบบที่นี่" : "สร้างบัญชีใหม่ที่นี่"}
                </button>
              </div>
            </>
          )}
        </section>
      </main>
    </AppShell>
  );
}
