# 🌸 Bloom & Care - ระบบติดตามรอบเดือนเพื่อคู่รัก (Menstrual Cycle Tracker)

> เว็บแอปพลิเคชันสำหรับติดตามรอบเดือนตามหลักสูตินารีแพทย์ (ACOG) ออกแบบพิเศษเพื่อให้คู่รักเข้าใจและดูแลกันได้ดียิ่งขึ้น พร้อมรองรับการเชื่อมต่อกับ **LINE Official Account (LINE OA)** และ **Supabase**

---

## ✨ ไฮไลท์ฟีเจอร์เด่น (Key Features)

1. **🧠 Medical-Grade Calculation (ACOG Standard):**
   - คำนวณ 4 ระยะของรอบเดือนอย่างแม่นยำ:
     - 🔴 **Menstrual Phase:** ระยะมีประจำเดือน
     - 🔵 **Follicular Phase:** ระยะฟอลลิคูลาร์ (ฮอร์โมนคงที่ สดชื่น อารมณ์ดี)
     - 🟣 **Ovulation & Fertile Window:** คำนวณวันไข่ตกแบบ *14 วันก่อนรอบถัดไปเสมอ* (Luteal Phase คงที่) พร้อมช่วง 5 วันก่อนไข่ตกที่มีโอกาสตั้งครรภ์สูงสุด
     - 🟡 **PMS Alert:** แจ้งเตือนระยะก่อนมีประจำเดือน (5-7 วันก่อนรอบใหม่) เพื่อเตรียมผ้าอนามัยและดูแลอารมณ์
2. **💖 Partner Care Mode (โหมดแฟนดูแล):**
   - มีปุ่มสลับโหมดมุมมองสำหรับแฟนหนุ่ม เพื่อดูว่าวันนี้แฟนอยู่ในสภาวะไหน
   - คำแนะนำ **"สิ่งที่ควรทำ (Do)"** และ **"สิ่งที่ไม่ควรทำ (Don't)"** ในแต่ละวัน เช่น อาหาร/ขนมที่ควรซื้อมาฝาก, การนวดคลายปวด, คำพูดที่ควรระวัง
3. **📅 Interactive Monthly Calendar:**
   - ปฏิทินแสดงสีแยกตามระยะของร่างกายอย่างชัดเจน
   - มีสัญลักษณ์ดาว ⭐ สำหรับวันไข่ตก และหยดเลือด 🩸 สำหรับวันมีประจำเดือน
   - มีจุดแสดงสถานะบันทึกอาการและระดับเลือดในแต่ละวัน
4. **📝 Daily Symptom & Mood Logger:**
   - บันทึกอาการ (ปวดท้อง, คัดหน้าอก, สิว, ปวดหลัง, อยากของหวาน)
   - บันทึกอารมณ์และระดับเลือด (Flow level 0-5)
   - ช่องใส่โน้ตให้กำลังใจจากแฟนหนุ่ม
5. **💬 LINE OA Integration & Daily Cron Notification:**
   - **Webhook API (`/api/webhook/line`):** รองรับการพิมพ์คำสั่งผ่านแชท เช่น "เมนมา", "เมนหาย", "เช็คสถานะ"
   - **Daily Cron API (`/api/cron/notify`):** ยิงแจ้งเตือนผ่าน Flex Message ทุกเช้า 08:00 น. ล่วงหน้า 2 วันก่อนเมนมา และช่วงวันไข่ตก
   - **GitHub Actions Workflow (`.github/workflows/line-cron.yml`):** ตั้งเวลารันอัตโนมัติฟรี

---

## 🚀 เริ่มต้นใช้งานในเครื่อง (Quick Start)

โปรเจกต์นี้ออกแบบให้มี **Local-First Storage** สามารถเปิดรันและทดลองใช้งานในเครื่องได้ทันที 100% โดยไม่ต้องรอตั้งค่า Database

```bash
# 1. ติดตั้ง Dependencies (ทำเสร็จแล้ว)
npm install

# 2. รันโหมด Development
npm run dev
```

เปิดเบราว์เซอร์ไปที่: **`http://localhost:3000`**

---

## 📁 โครงสร้างโปรเจกต์ (Project Structure)

```text
├── app/
│   ├── api/
│   │   ├── cron/notify/route.ts   # Endpoint สำหรับ Cron Job ยิง LINE Push Message
│   │   └── webhook/line/route.ts  # Endpoint รับ Webhook จาก LINE OA
│   ├── globals.css                # โทนสีและสไตล์พาสเทล
│   ├── layout.tsx                 # Root Layout
│   └── page.tsx                   # หน้า Dashboard หลัก
├── components/
│   ├── Calendar.tsx               # ปฏิทินรอบเดือน Interactive พร้อมโค้ดสี 5 ระยะ
│   ├── Header.tsx                 # แถบเมนูด้านบนพร้อมปุ่มสลับโหมดแฟนดูแล
│   ├── StatusBanner.tsx           # การ์ด Hero สรุปนับถอยหลังวันเมนมา & ปุ่มจดรอบใหม่
│   ├── DayDetailCard.tsx          # การ์ดแสดงผลฮอร์โมนและอาการของวันที่เลือก
│   ├── PartnerCareCard.tsx        # คู่มือแนะนำแฟนหนุ่ม (Do's, Don'ts, ไอเดียของขวัญ)
│   ├── DailyLogModal.tsx          # หน้าต่างจดบันทึกอาการและระดับเลือด
│   └── CycleSettingsModal.tsx     # หน้าต่างตั้งค่ารอบเดือน, ชื่อ, และ LINE ID
├── lib/
│   ├── line/
│   │   └── messaging.ts           # LINE Messaging API SDK & Flex Message Templates
│   ├── storage/
│   │   └── local-store.ts         # ตัวจัดการบันทึกข้อมูล LocalStorage ในเครื่อง
│   ├── supabase/
│   │   └── client.ts              # Supabase Client สำหรับ Production DB
│   ├── types/
│   │   └── cycle.ts               # TypeScript Interfaces และโมเดลข้อมูล
│   └── utils/
│       └── cycle-calculator.ts    # 🧠 Core Medical Algorithm ตามมาตรฐาน ACOG
├── supabase/
│   └── schema.sql                 # SQL Schema สำหรับสร้างตารางบน Supabase (มี RLS)
├── .github/
│   └── workflows/
│       └── line-cron.yml          # GitHub Actions สำหรับรัน Cron ส่งไลน์ทุก 08:00 น.
└── .env.example                   # ตัวอย่าง Environment Variables
```

---

## 🛠️ ขั้นตอนเชื่อมต่อกับ LINE OA และ Supabase เมื่อพร้อมใช้งานจริง

### 1. การตั้งค่า LINE Official Account
1. สมัครหรือเข้าสู่ระบบที่ [LINE Developers Console](https://developers.line.biz)
2. สร้าง Provider และ **Messaging API Channel**
3. คัดลอกค่าต่อไปนี้มาใส่ในไฟล์ `.env`:
   - `LINE_CHANNEL_ID`
   - `LINE_CHANNEL_SECRET`
   - `LINE_CHANNEL_ACCESS_TOKEN` (ออกเป็นแบบ Long-lived)
4. ในหน้า Messaging API ให้ตั้งค่า **Webhook URL** เป็น:
   `https://<your-domain>/api/webhook/line`
   แล้วเปิดใช้งานปุ่ม **Use Webhook**

### 2. การตั้งค่า Supabase
1. สร้างโปรเจกต์ใหม่บน [Supabase](https://supabase.com)
2. ไปที่เมนู **SQL Editor** แล้วนำโค้ดจากไฟล์ `supabase/schema.sql` ไปวางแล้วกด **Run**
3. คัดลอกค่า URL และ Keys มาใส่ใน `.env`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`

### 3. การ Deploy ขึ้น Vercel
1. Push โปรเจกต์นี้ขึ้น GitHub Repository
2. Import เข้า [Vercel](https://vercel.com)
3. ใส่ Environment Variables ตามไฟล์ `.env.example`
4. Deploy ได้ทันที!

---

💖 สร้างด้วยความตั้งใจเพื่อแฟนของคุณ ขอให้มีความสุขในการดูแลกันและกันครับ!
