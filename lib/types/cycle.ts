export type CyclePhase = 
  | 'menstrual'   // 🔴 ระยะมีประจำเดือน (Day 1 - End of flow)
  | 'follicular'  // 🔵 ระยะฟอลลิคูลาร์ (ฮอร์โมนคงที่ สดชื่น อารมณ์ดี)
  | 'fertile'     // 🟢 ช่วงเจริญพันธุ์ (5 วันก่อนไข่ตก โอกาสตั้งครรภ์สูง)
  | 'ovulation'   // 🟣 วันไข่ตก (ประมาณ 14 วันก่อนเมนรอบถัดไป)
  | 'luteal'      // 🟡 ระยะลูเทียลทั่วไป
  | 'pms';        // 🟠 ระยะ PMS (5-7 วันก่อนเมนมา อารมณ์แปรปรวน/คัดตึง)

export type MoodType = 
  | 'happy'       // มีความสุข สดใส
  | 'calm'        // สบายๆ ผ่อนคลาย
  | 'sensitive'   // อ่อนไหวง่าย ขี้น้อยใจ
  | 'irritable'   // หงุดหงิดง่าย
  | 'anxious'     // กังวล เครียด
  | 'tired'       // เหนื่อยล้า อ่อนเพลีย
  | 'romantic';   // อยากอ้อน อยากกอด

export type SymptomType = 
  | 'cramps'        // ปวดท้องน้อย
  | 'headache'      // ปวดศีรษะ
  | 'backache'      // ปวดหลัง / ปวดเอว
  | 'bloating'      // ท้องอืด แน่นท้อง
  | 'breast_pain'   // คัดตึงหน้าอก
  | 'acne'          // สิวขึ้น
  | 'cravings'      // อยากของหวาน / หิวบ่อย
  | 'insomnia';     // นอนไม่หลับ

export interface DailyPhaseInfo {
  date: string;              // YYYY-MM-DD
  dayOfCycle: number;        // Day 1, Day 2, ...
  phase: CyclePhase;
  phaseLabel: string;        // ชื่อภาษาไทย
  phaseColor: string;        // Tailwind color class
  isPeriod: boolean;
  isOvulation: boolean;
  isFertile: boolean;
  isPMS: boolean;
  pregnancyChance: 'ต่ำ' | 'ปานกลาง' | 'สูง' | 'สูงสุด';
  hormoneSummary: string;    // คำอธิบายระดับฮอร์โมน
  bodyFeel: string;          // สภาพร่างกาย
  careTipForPartner: string; // เคล็ดลับสำหรับแฟนในการดูแล
}

export interface CycleLog {
  id: string;
  startDate: string;         // YYYY-MM-DD
  endDate?: string;          // YYYY-MM-DD
  cycleLength?: number;      // วัน
  periodLength?: number;     // วัน
  notes?: string;
}

export interface DailyLog {
  id: string;
  date: string;              // YYYY-MM-DD
  flowLevel: number;         // 0 (none) to 5 (heavy)
  mood?: MoodType;
  symptoms: SymptomType[];
  notes?: string;
  partnerNote?: string;      // โน้ตความรัก/กำลังใจจากแฟน
}

export interface UserProfile {
  id: string;
  name: string;
  partnerName: string;
  lineUserId?: string;
  averageCycleLength: number;   // ค่าเฉลี่ยรอบเดือน (ปกติ 28 วัน)
  averagePeriodLength: number;  // ค่าเฉลี่ยวันมีประจำเดือน (ปกติ 5 วัน)
  lastPeriodStartDate: string;  // YYYY-MM-DD
  mode: 'partner' | 'self';     // มุมมองแฟน หรือ มุมมองตัวเอง
}
