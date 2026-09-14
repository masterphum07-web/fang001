import { addDays, subDays, differenceInCalendarDays, format, parseISO, isSameDay } from 'date-fns';
import { CyclePhase, DailyPhaseInfo } from '@/lib/types/cycle';

/**
 * คำนวณระยะของรอบเดือนตามหลักสูตินารีแพทย์ (ACOG Guidelines)
 * 1. Ovulation เกิดขึ้น 14 วัน ก่อนวันแรกของรอบเดือนถัดไป (Luteal Phase คงที่ ~14 วัน)
 * 2. Fertile Window คือ 5 วันก่อนวันไข่ตก + วันไข่ตก
 * 3. Menstrual Phase คือช่วงวันแรกของรอบเดือนจนถึงระยะเวลาที่มีประจำเดือนเฉลี่ย
 * 4. PMS Alert คือช่วง 5-7 วันก่อนประจำเดือนรอบถัดไปจะมา
 */

export interface CycleSummaryStats {
  currentDate: string;
  currentDayOfCycle: number;
  currentPhase: CyclePhase;
  phaseLabel: string;
  nextPeriodDate: string;
  daysUntilNextPeriod: number;
  nextOvulationDate: string;
  daysUntilOvulation: number;
  pregnancyChance: 'ต่ำ' | 'ปานกลาง' | 'สูง' | 'สูงสุด';
  hormoneSummary: string;
  partnerTip: string;
  bodyFeel: string;
}

export function parseDateSafe(dateInput: string | Date): Date {
  if (dateInput instanceof Date) return dateInput;
  return parseISO(dateInput);
}

export function formatDateSafe(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

/**
 * คำนวณข้อมูล Phase สำหรับช่วงเวลาข้างหน้า (เช่น 90 หรือ 120 วัน)
 */
export function calculateCyclePhases(
  lastPeriodStartDateInput: string | Date,
  averageCycleLength: number = 28,
  averagePeriodLength: number = 5,
  daysAhead: number = 90
): Map<string, DailyPhaseInfo> {
  const lastPeriodStart = parseDateSafe(lastPeriodStartDateInput);
  const phaseMap = new Map<string, DailyPhaseInfo>();

  // คำนวณย้อนหลังเล็กน้อย (เช่น 14 วันก่อนหน้า) และล่วงหน้าตาม daysAhead
  const startScanDate = subDays(lastPeriodStart, 14);
  const endScanDate = addDays(lastPeriodStart, daysAhead);

  const totalDays = differenceInCalendarDays(endScanDate, startScanDate) + 1;

  for (let i = 0; i < totalDays; i++) {
    const targetDate = addDays(startScanDate, i);
    const dateStr = formatDateSafe(targetDate);
    const info = getDayPhaseInfo(targetDate, lastPeriodStart, averageCycleLength, averagePeriodLength);
    phaseMap.set(dateStr, info);
  }

  return phaseMap;
}

/**
 * คำนวณระยะของวันหนึ่งวันตามรอบเดือน
 */
export function getDayPhaseInfo(
  targetDateInput: string | Date,
  lastPeriodStartDateInput: string | Date,
  averageCycleLength: number = 28,
  averagePeriodLength: number = 5
): DailyPhaseInfo {
  const targetDate = parseDateSafe(targetDateInput);
  const lastPeriodStart = parseDateSafe(lastPeriodStartDateInput);

  // คำนวณจำนวนวันนับจากวันแรกของรอบที่บันทึก
  const diffFromLastStart = differenceInCalendarDays(targetDate, lastPeriodStart);

  // หากเป็นวันก่อนรอบล่าสุด ให้ย้อนรอบไป
  let cycleStart: Date;
  let cycleIndex = 0;
  if (diffFromLastStart >= 0) {
    cycleIndex = Math.floor(diffFromLastStart / averageCycleLength);
    cycleStart = addDays(lastPeriodStart, cycleIndex * averageCycleLength);
  } else {
    cycleIndex = Math.floor(diffFromLastStart / averageCycleLength);
    cycleStart = addDays(lastPeriodStart, cycleIndex * averageCycleLength);
  }

  const nextPeriodStart = addDays(cycleStart, averageCycleLength);
  const ovulationDate = subDays(nextPeriodStart, 14);
  const fertileStart = subDays(ovulationDate, 5);
  const pmsStart = subDays(nextPeriodStart, 6);

  const dayOfCycle = differenceInCalendarDays(targetDate, cycleStart) + 1;

  let phase: CyclePhase = 'follicular';
  let phaseLabel = 'ระยะฟอลลิคูลาร์ (ช่วงสบายตัว)';
  let phaseColor = 'bg-blue-50 text-blue-700 border-blue-200';
  let isPeriod = false;
  let isOvulation = false;
  let isFertile = false;
  let isPMS = false;
  let pregnancyChance: 'ต่ำ' | 'ปานกลาง' | 'สูง' | 'สูงสุด' = 'ต่ำ';
  let hormoneSummary = 'ฮอร์โมนเอสโตรเจนเริ่มเพิ่มขึ้น ร่างกายเริ่มสร้างพลังงาน';
  let bodyFeel = 'รู้สึกกระปรี้กระเปร่า สมองปลอดโปร่ง ผิวพรรณเริ่มเปล่งปลั่ง';
  let careTipForPartner = 'ชวนไปเที่ยว ออกเดท หรือทำกิจกรรมสนุกๆ ด้วยกันได้เต็มที่เลย แฟนมีพลังงานเยอะ!';

  // ตรวจสอบเงื่อนไขตามลำดับความสำคัญทางการแพทย์
  if (dayOfCycle <= averagePeriodLength && dayOfCycle >= 1) {
    phase = 'menstrual';
    phaseLabel = 'ระยะมีประจำเดือน';
    phaseColor = 'bg-rose-100 text-rose-800 border-rose-300';
    isPeriod = true;
    pregnancyChance = 'ต่ำ';
    hormoneSummary = 'เอสโตรเจนและโปรเจสเตอโรนลดลงต่ำสุด ผนังมดลูกหลุดลอก';
    bodyFeel = 'อาจมีอาการปวดเกร็งท้องน้อย อ่อนเพลีย ปวดเมื่อยตัวง่าย';
    careTipForPartner = '💖 เตรียมกระเป๋าน้ำร้อน นวดหลัง ชงน้ำอุ่น และอย่าปล่อยให้หิวนะครับ ช่วงนี้ต้องการกำลังใจที่สุด!';
  } else if (isSameDay(targetDate, ovulationDate)) {
    phase = 'ovulation';
    phaseLabel = 'วันไข่ตก (Ovulation Day)';
    phaseColor = 'bg-purple-100 text-purple-800 border-purple-300';
    isOvulation = true;
    isFertile = true;
    pregnancyChance = 'สูงสุด';
    hormoneSummary = 'ฮอร์โมน LH และ Estrogen พุ่งแตะจุดสูงสุด';
    bodyFeel = 'อุณหภูมิร่างกายอาจสูงขึ้นเล็กน้อย มีมูกใส อาจรู้สึกจี๊ดๆ บริเวณรังไข่';
    careTipForPartner = '✨ เป็นวันที่แฟนมีเสน่ห์ดึงดูดและอารมณ์ดีเป็นพิเศษ หมั่นชื่นชมและชมว่าแฟนสวยบ่อยๆ นะครับ';
  } else if (targetDate >= fertileStart && targetDate <= ovulationDate) {
    phase = 'fertile';
    phaseLabel = 'ช่วงเจริญพันธุ์ (โอกาสตั้งครรภ์สูง)';
    phaseColor = 'bg-emerald-100 text-emerald-800 border-emerald-300';
    isFertile = true;
    pregnancyChance = 'สูง';
    hormoneSummary = 'เอสโตรเจนสูง ร่างกายพร้อมสำหรับการผสมพันธุ์';
    bodyFeel = 'สดใส มีความมั่นใจสูง อารมณ์แจ่มใส';
    careTipForPartner = '🌿 ช่วงเวลาแห่งความสุข บรรยากาศโรแมนติกเป็นใจ (หากยังไม่พร้อมมีเบบี๋ ต้องคุมกำเนิดอย่างรัดกุม)';
  } else if (targetDate >= pmsStart && targetDate < nextPeriodStart) {
    phase = 'pms';
    phaseLabel = 'ช่วงก่อนมีประจำเดือน (PMS)';
    phaseColor = 'bg-amber-100 text-amber-800 border-amber-300';
    isPMS = true;
    pregnancyChance = 'ต่ำ';
    hormoneSummary = 'ฮอร์โมนโปรเจสเตอโรนและเอสโตรเจนดิ่งลง รบกวนสารเซโรโทนินในสมอง';
    bodyFeel = 'คัดตึงหน้าอก อารมณ์แปรปรวนง่าย หิวง่าย ท้องอืด นอนหลับยาก';
    careTipForPartner = '🧸 แฟนอาจจะนอยด์ง่าย ขี้น้อยใจ หรือหงุดหงิดง่าย ให้ใจเย็น รับฟัง กอดแน่นๆ และซื้อขนมที่เธอชอบมาฝากนะ!';
  } else if (dayOfCycle > averagePeriodLength && targetDate < fertileStart) {
    phase = 'follicular';
    phaseLabel = 'ระยะฟอลลิคูลาร์ (สดชื่นแจ่มใส)';
    phaseColor = 'bg-sky-100 text-sky-800 border-sky-300';
    pregnancyChance = 'ต่ำ';
    hormoneSummary = 'ฮอร์โมนเริ่มฟื้นฟู สมองและผิวพรรณสดใส';
    bodyFeel = 'สบายตัว สดชื่น อารมณ์คงที่ มีสมาธิทำงานดีเยี่ยม';
    careTipForPartner = '🎉 แฟนอารมณ์ดีมาก เหมาะแก่การวางแผนเที่ยวด้วยกัน พูดคุยเรื่องอนาคต หรือทานของอร่อย';
  } else {
    phase = 'luteal';
    phaseLabel = 'ระยะลูเทียล (ช่วงบำรุงร่างกาย)';
    phaseColor = 'bg-amber-50 text-amber-700 border-amber-200';
    pregnancyChance = 'ต่ำ';
    hormoneSummary = 'โปรเจสเตอโรนทำงานเต็มที่ มดลูกหนาตัว';
    bodyFeel = 'รู้สึกสงบ อาจเริ่มมีอาการง่วงหรือเหนื่อยง่ายขึ้นเล็กน้อย';
    careTipForPartner = '☕ ช่วยทำงานบ้าน หรือชวนพักผ่อนดูหนังน่ารักๆ ที่บ้าน';
  }

  return {
    date: formatDateSafe(targetDate),
    dayOfCycle,
    phase,
    phaseLabel,
    phaseColor,
    isPeriod,
    isOvulation,
    isFertile,
    isPMS,
    pregnancyChance,
    hormoneSummary,
    bodyFeel,
    careTipForPartner
  };
}

/**
 * คำนวณข้อมูลสรุปประจำวัน (Dashboard Summary)
 */
export function calculateSummaryStats(
  targetDateInput: string | Date = new Date(),
  lastPeriodStartDateInput: string | Date,
  averageCycleLength: number = 28,
  averagePeriodLength: number = 5
): CycleSummaryStats {
  const targetDate = parseDateSafe(targetDateInput);
  const lastPeriodStart = parseDateSafe(lastPeriodStartDateInput);

  const dayInfo = getDayPhaseInfo(targetDate, lastPeriodStart, averageCycleLength, averagePeriodLength);

  // คำนวณวันแรกของรอบถัดไป
  const diff = differenceInCalendarDays(targetDate, lastPeriodStart);
  const cycleIndex = Math.floor(diff / averageCycleLength);
  let nextPeriod = addDays(lastPeriodStart, (cycleIndex + 1) * averageCycleLength);
  
  // ถ้าวันนี้เลยหรือตรงกับ nextPeriod ให้ขยับรอบ
  if (differenceInCalendarDays(nextPeriod, targetDate) <= 0) {
    nextPeriod = addDays(nextPeriod, averageCycleLength);
  }

  const daysUntilNextPeriod = differenceInCalendarDays(nextPeriod, targetDate);

  // คำนวณวันไข่ตกถัดไป
  let nextOvulation = subDays(nextPeriod, 14);
  if (differenceInCalendarDays(nextOvulation, targetDate) < 0) {
    // ถ้าวันไข่ตกรอบนี้ผ่านไปแล้ว ให้นับรอบหน้า
    const nextNextPeriod = addDays(nextPeriod, averageCycleLength);
    nextOvulation = subDays(nextNextPeriod, 14);
  }
  const daysUntilOvulation = differenceInCalendarDays(nextOvulation, targetDate);

  return {
    currentDate: formatDateSafe(targetDate),
    currentDayOfCycle: dayInfo.dayOfCycle,
    currentPhase: dayInfo.phase,
    phaseLabel: dayInfo.phaseLabel,
    nextPeriodDate: formatDateSafe(nextPeriod),
    daysUntilNextPeriod,
    nextOvulationDate: formatDateSafe(nextOvulation),
    daysUntilOvulation,
    pregnancyChance: dayInfo.pregnancyChance,
    hormoneSummary: dayInfo.hormoneSummary,
    partnerTip: dayInfo.careTipForPartner,
    bodyFeel: dayInfo.bodyFeel
  };
}

/**
 * คำนวณรอบเดือนเฉลี่ยแบบ Adaptive จากประวัติรอบที่เคยบันทึก
 */
export function calculateAdaptiveCycleLength(cycleDates: string[], fallback: number = 28): number {
  if (!cycleDates || cycleDates.length < 2) return fallback;

  // เรียงวันจากเก่าไปใหม่
  const sorted = [...cycleDates].sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
  
  let totalDiff = 0;
  let count = 0;

  for (let i = 1; i < sorted.length; i++) {
    const diff = differenceInCalendarDays(parseDateSafe(sorted[i]), parseDateSafe(sorted[i - 1]));
    // รอบเดือนปกติของมนุษย์อยู่ระหว่าง 21 ถึง 45 วัน
    if (diff >= 20 && diff <= 45) {
      totalDiff += diff;
      count++;
    }
  }

  if (count === 0) return fallback;
  return Math.round(totalDiff / count);
}
