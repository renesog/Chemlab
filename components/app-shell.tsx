"use client";

import { ArrowLeft, FlaskConical, Home, LogOut, Wifi, Sparkles } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

export function AppShell({
  children,
  title,
  back,
}: {
  children: React.ReactNode;
  title: string;
  back?: string;
}) {
  const router = useRouter();
  const path = usePathname();

  return (
    <div className="app-page modern-app-shell">
      <a className="skip-link" href="#main-content">
        ข้ามไปยังเนื้อหาหลัก
      </a>
      <header className="app-header modern-header">
        <div className="header-leading">
          {back && (
            <button
              type="button"
              className="back-button modern-back-btn"
              onClick={() => router.push(back)}
              aria-label="ย้อนกลับ"
            >
              <ArrowLeft size={20} />
            </button>
          )}
          <button
            type="button"
            className="brand-button modern-brand-btn"
            onClick={() => router.push("/")}
            aria-label="กลับหน้าหลัก"
          >
            <span className="brand-mark">
              <FlaskConical size={22} />
            </span>
            <span className="brand-copy">
              <strong>ChemClass Lab</strong>
              <small>{title}</small>
            </span>
          </button>
        </div>

        <div className="header-status modern-status-pill">
          <span className="live-pulse-dot" aria-hidden="true" />
          <Wifi size={15} />
          <span>เชื่อมต่อเซิร์ฟเวอร์เรียลไทม์</span>
        </div>
      </header>

      <div id="main-content">{children}</div>

      <nav className="mobile-nav modern-mobile-nav" aria-label="เมนูหลัก">
        <button
          type="button"
          onClick={() => router.push("/")}
          className={path === "/" ? "active" : ""}
        >
          <Home size={19} />
          <span>หน้าหลัก</span>
        </button>
        <button
          type="button"
          onClick={() => router.push(path.startsWith("/teacher") ? "/teacher/dashboard" : "/join")}
          className={path.startsWith("/teacher") || path.startsWith("/join") ? "active" : ""}
        >
          <LogOut size={19} />
          <span>{path.startsWith("/teacher") ? "แดชบอร์ด" : "เข้าห้องใหม่"}</span>
        </button>
      </nav>
    </div>
  );
}

export function LoadingState() {
  return (
    <div className="loading-state modern-loading-state" role="status">
      <div className="loading-icon-wrapper">
        <FlaskConical size={32} className="loading-flask-anim" />
        <span className="spinner" />
      </div>
      <strong>กำลังโหลดข้อมูลห้องเรียน…</strong>
      <small>ระบบกำลังซิงก์ข้อมูลเรียลไทม์</small>
    </div>
  );
}

export function StepIndicator({
  current,
  items,
}: {
  current: number;
  items: string[];
}) {
  return (
    <ol className="step-indicator modern-step-indicator" aria-label="ขั้นตอนการเข้าห้อง">
      {items.map((item, index) => (
        <li
          key={item}
          className={index + 1 < current ? "done" : index + 1 === current ? "current" : ""}
        >
          <span>{index + 1 < current ? "✓" : index + 1}</span>
          <strong>{item}</strong>
        </li>
      ))}
    </ol>
  );
}
