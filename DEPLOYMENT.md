# ChemClass Lab — การตั้งค่า Production (Firebase + Vercel)

## ขั้นตอนที่ 1: สร้าง Firebase Project

1. ไปที่ [console.firebase.google.com](https://console.firebase.google.com)
2. กด **Create a project** → ตั้งชื่อ เช่น "chemclass-lab"
3. เปิด **Authentication** → Sign-in method → เปิด **Email/Password**
4. เปิด **Firestore Database** → Create database → เลือก region **asia-southeast1** (สิงคโปร์ ใกล้ไทยสุด) → เลือก **Start in production mode**
5. ไปที่ **Project Settings** → General → เลื่อนลง → กด **Add app** → เลือก **Web** → ตั้งชื่อ → จะได้ Firebase config

## ขั้นตอนที่ 2: เก็บ Firebase Config

จากขั้นตอนที่ 1 จะได้ค่าเหล่านี้ ให้ใส่ใน `.env.local`:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIza...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=chemclass-lab.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=chemclass-lab
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=chemclass-lab.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123
```

## ขั้นตอนที่ 3: สร้าง Service Account Key

1. ไปที่ **Project Settings** → **Service Accounts**
2. กด **Generate New Private Key** → Download ไฟล์ JSON
3. เปิดไฟล์ JSON → copy เนื้อหาทั้งหมด → ใส่ใน `.env.local`:

```env
FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account","project_id":"chemclass-lab",...}
```

⚠️ **อย่า commit ไฟล์นี้** เก็บเป็นความลับเสมอ

## ขั้นตอนที่ 4: ตั้ง Firestore Security Rules

ไปที่ Firestore → Rules → วาง rules นี้:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /rooms/{roomId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update: if request.auth != null && request.auth.uid == resource.data.ownerUserId;
      allow delete: if request.auth != null && request.auth.uid == resource.data.ownerUserId;
      match /studentTokens/{tokenId} {
        allow read, write: if false;
      }
      match /answerKeys/{keyId} {
        allow read, write: if false;
      }
    }
    match /teacherProfiles/{uid} {
      allow read: if request.auth != null && request.auth.uid == uid;
      allow write: if request.auth != null && request.auth.uid == uid;
    }
    match /rateLimits/{key} {
      allow read, write: if false;
    }
  }
}
```

## ขั้นตอนที่ 5: ตั้ง App Secrets

สร้าง random secrets สำหรับ `.env.local`:

```env
STUDENT_SESSION_SECRET=<สุ่มตัวอักษร 32 ตัว>
ROOM_CODE_PEPPER=<สุ่มตัวอักษร 32 ตัว>
NEXT_PUBLIC_APP_URL=http://localhost:5173
```

## ขั้นตอนที่ 6: รันในเครื่อง

```bash
npm install
npm run dev
```

เปิด http://localhost:5173

## ขั้นตอนที่ 7: Deploy บน Vercel

1. Push โค้ดขึ้น GitHub
2. ไปที่ [vercel.com](https://vercel.com) → Import project จาก GitHub
3. ตั้ง **Environment Variables** ทั้งหมดจาก `.env.local` (ยกเว้นเปลี่ยน `NEXT_PUBLIC_APP_URL` เป็น URL จริงของ Vercel)
4. กด **Deploy**
5. หลัง deploy สำเร็จ → อัปเดต `NEXT_PUBLIC_APP_URL` เป็น URL ที่ได้ เช่น `https://chemclass-lab.vercel.app`

## Environment Variables ทั้งหมด

| ชื่อ | ต้อง Public? | คำอธิบาย |
|------|-------------|----------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | ✅ | Firebase API key |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | ✅ | Firebase auth domain |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | ✅ | Firebase project ID |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | ✅ | Firebase storage |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | ✅ | Firebase messaging sender |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | ✅ | Firebase app ID |
| `NEXT_PUBLIC_APP_URL` | ✅ | URL ที่ deploy เช่น `https://chemclass-lab.vercel.app` |
| `FIREBASE_SERVICE_ACCOUNT_KEY` | ❌ | Service account JSON (เก็บ server เท่านั้น!) |
| `STUDENT_SESSION_SECRET` | ❌ | Random secret อย่างน้อย 32 ตัว |
| `ROOM_CODE_PEPPER` | ❌ | Random secret สำหรับ hash รหัสห้อง |
