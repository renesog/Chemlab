# ChemClass Lab — การตั้งค่า Production

เวอร์ชันที่รันได้โดยไม่ตั้งค่า environment คือ **โหมดทดลองในอุปกรณ์เดียว** ข้อมูลเก็บใน browser และมีป้าย “โหมดทดลอง” ชัดเจน เหมาะสำหรับตรวจ UX เท่านั้น ไม่ใช่ห้องเรียนจริงหลายเครื่อง

## Supabase

1. สร้าง Supabase project และรัน migration ใน `supabase/migrations` ด้วย Supabase CLI
2. เปิด Email authentication สำหรับบัญชีครู และเปิด Realtime ให้ตาราง `desks`, `student_sessions`, `activities`, `level_progress`
3. ตั้ง environment variables ตาม `.env.example` โดยเก็บ `SUPABASE_SERVICE_ROLE_KEY`, `STUDENT_SESSION_SECRET` และ `ROOM_CODE_PEPPER` เฉพาะ server
4. API ฝั่ง server ต้อง hash room code/session token, ตรวจ teacher ownership ทุก mutation และเรียก `select_own_desk` สำหรับการเลือกหรือย้ายโต๊ะ

## Environment

- `NEXT_PUBLIC_APP_URL`: origin ที่ deploy แล้ว ใช้สร้าง QR join URL
- `NEXT_PUBLIC_SUPABASE_URL`: URL ของ Supabase project
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: anon key สำหรับ client
- `SUPABASE_SERVICE_ROLE_KEY`: service role สำหรับ route handler เท่านั้น
- `STUDENT_SESSION_SECRET`: secret แบบสุ่มอย่างน้อย 32 bytes
- `ROOM_CODE_PEPPER`: secret สำหรับ hash รหัสห้อง

## Deployment

ใช้ Node.js 22 ขึ้นไป ติดตั้งด้วย `npm ci`, ทดสอบด้วย `npm test`, และ build ด้วย `npm run build` ก่อน deploy บน Vercel ตั้ง environment แยก Preview/Production และตั้ง `NEXT_PUBLIC_APP_URL` ให้ตรง origin จริง
