import { addDays, subDays, differenceInCalendarDays, format, parseISO, isSameDay, isWithinInterval } from 'date-fns';
import { CyclePhase, DailyPhaseInfo, CycleLog } from '@/lib/types/cycle';

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
  isCurrentlyBleeding: boolean;
  activeCycleStartDate?: string;
  activeCycleEndDate?: string;
}

export function parseDateSafe(dateInput: string | Date): Date {
  if (dateInput instanceof Date) return dateInput;
  return parseISO(dateInput);
}

export function formatDateSafe(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

/**
 * คำนวณความยาวประจำเดือนเฉลี่ย (Period Length) จากประวัติรอบที่เคยบันทึกวันเริ่มและวันหมดจริง
 */
export function calculateAdaptivePeriodLength(cycleLogs: CycleLog[], fallback: number = 5): number {
  if (!cycleLogs || cycleLogs.length === 0) return fallback;
  
  let totalDays = 0;
  let count = 0;

  for (const log of cycleLogs) {
    if (log.startDate && log.endDate) {
      const start = parseDateSafe(log.startDate);
      const end = parseDateSafe(log.endDate);
      const diff = differenceInCalendarDays(end, start) + 1;
      if (diff >= 1 && diff <= 14) {
        totalDays += diff;
        count++;
      }
    }
  }

  if (count === 0) return fallback;
  return Math.round(totalDays / count);
}

/**
 * คำนวณรอบเดือนเฉลี่ย (Cycle Length) จากประวัติรอบที่เคยบันทึก
 */
export function calculateAdaptiveCycleLength(cycleLogs: CycleLog[], fallback: number = 28): number {
  if (!cycleLogs || cycleLogs.length < 2) return fallback;

  // เรียงวันเริ่มจากเก่าไปใหม่
  const sorted = [...cycleLogs]
    .map((c) => c.startDate)
    .filter(Boolean)
    .sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

  let totalDiff = 0;
  let count = 0;

  for (let i = 1; i < sorted.length; i++) {
    const diff = differenceInCalendarDays(parseDateSafe(sorted[i]), parseDateSafe(sorted[i - 1]));
    if (diff >= 20 && diff <= 45) {
      totalDiff += diff;
      count++;
    }
  }

  if (count === 0) return fallback;
  return Math.round(totalDiff / count);
}

/**
 * ตรวจสอบว่าวันที่ระบุ อยู่ในช่วงที่มีประจำเดือนจริงตามประวัติที่ผู้ใช้จดไว้หรือไม่
 */
export function findActualPeriodStatus(
  targetDate: Date,
  cycleLogs: CycleLog[],
  fallbackPeriodLength: number
): { isActualPeriod: boolean; isStartDate: boolean; isEndDate: boolean; logId?: string } {
  for (const log of cycleLogs) {
    if (!log.startDate) continue;
    const start = parseDateSafe(log.startDate);
    const end = log.endDate ? parseDateSafe(log.endDate) : addDays(start, fallbackPeriodLength - 1);

    if (isSameDay(targetDate, start)) {
      return { isActualPeriod: true, isStartDate: true, isEndDate: log.endDate ? isSameDay(targetDate, end) : false, logId: log.id };
    }

    if (log.endDate && isSameDay(targetDate, end)) {
      return { isActualPeriod: true, isStartDate: false, isEndDate: true, logId: log.id };
    }

    if (targetDate >= start && targetDate <= end) {
      return { isActualPeriod: true, isStartDate: false, isEndDate: false, logId: log.id };
    }
  }

  return { isActualPeriod: false, isStartDate: false, isEndDate: false };
}

/**
 * คำนวณข้อมูล Phase สำหรับปฏิทิน โดยอิงตาม "วันเริ่ม - วันหมดจริง" ที่ผู้ใช้จด
 */
export function calculateCyclePhases(
  lastPeriodStartDateInput: string | Date,
  averageCycleLength: number = 28,
  averagePeriodLength: number = 5,
  daysAhead: number = 90,
  cycleLogs: CycleLog[] = []
): Map<string, DailyPhaseInfo> {
  const lastPeriodStart = parseDateSafe(lastPeriodStartDateInput);
  const phaseMap = new Map<string, DailyPhaseInfo>();

  const startScanDate = subDays(lastPeriodStart, 21);
  const endScanDate = addDays(lastPeriodStart, daysAhead);
  const totalDays = differenceInCalendarDays(endScanDate, startScanDate) + 1;

  for (let i = 0; i < totalDays; i++) {
    const targetDate = addDays(startScanDate, i);
    const dateStr = formatDateSafe(targetDate);
    const info = getDayPhaseInfo(targetDate, lastPeriodStart, averageCycleLength, averagePeriodLength, cycleLogs);
    phaseMap.set(dateStr, info);
  }

  return phaseMap;
}

/**
 * คำนวณระยะของวันหนึ่งวัน โดยให้ความสำคัญสูงสุดกับ "วันเริ่มและวันหมดจริง" ที่ผู้ใช้บันทึก
 */
export function getDayPhaseInfo(
  targetDateInput: string | Date,
  lastPeriodStartDateInput: string | Date,
  averageCycleLength: number = 28,
  averagePeriodLength: number = 5,
  cycleLogs: CycleLog[] = []
): DailyPhaseInfo {
  const targetDate = parseDateSafe(targetDateInput);
  const lastPeriodStart = parseDateSafe(lastPeriodStartDateInput);

  // 1. ตรวจสอบก่อนว่าวันนี้อยู่ในช่วงที่จดวันเริ่ม-วันหมดจริงหรือไม่
  const actualStatus = findActualPeriodStatus(targetDate, cycleLogs, averagePeriodLength);

  // คำนวณรอบเดือนคาดการณ์
  const diffFromLastStart = differenceInCalendarDays(targetDate, lastPeriodStart);
  let cycleIndex = Math.floor(diffFromLastStart / averageCycleLength);
  let cycleStart = addDays(lastPeriodStart, cycleIndex * averageCycleLength);

  const nextPeriodStart = addDays(cycleStart, averageCycleLength);
  const ovulationDate = subDays(nextPeriodStart, 14);
  const fertileStart = subDays(ovulationDate, 5);
  const pmsStart = subDays(nextPeriodStart, 6);

  const dayOfCycle = differenceInCalendarDays(targetDate, cycleStart) + 1;

  let phase: CyclePhase = 'follicular';
  let phaseLabel = 'ระยะฟอลลิคูลาร์ (ช่วงสบายตัว)';
  let phaseColor = 'bg-sky-50 text-sky-800 border-sky-200';
  let isPeriod = false;
  let isOvulation = false;
  let isFertile = false;
  let isPMS = false;
  let pregnancyChance: 'ต่ำ' | 'ปานกลาง' | 'สูง' | 'สูงสุด' = 'ต่ำ';
  let hormoneSummary = 'ฮอร์โมนเอสโตรเจนเริ่มเพิ่มขึ้น ร่างกายสดชื่น ผิวพรรณเปล่งปลั่ง';
  let bodyFeel = 'รู้สึกกระปรี้กระเปร่า สมองปลอดโปร่ง ผ่อนคลาย';
  let careTipForPartner = 'ชวนไปเที่ยว ออกเดท หรือทำกิจกรรมสนุกๆ ด้วยกันได้เต็มที่ แฟนมีพลังงานเยอะ!';

  // ถ้าเป็นวันที่มีประจำเดือนจริงตามประวัติที่จดไว้ (ไม่ล็อควัน!)
  if (actualStatus.isActualPeriod) {
    phase = 'menstrual';
    phaseLabel = actualStatus.isStartDate 
      ? 'วันแรกของประจำเดือน 🩸' 
      : actualStatus.isEndDate 
      ? 'วันหมดประจำเดือน ✨' 
      : 'ระยะมีประจำเดือน 🩸';
    phaseColor = 'bg-rose-50 text-rose-800 border-rose-200';
    isPeriod = true;
    pregnancyChance = 'ต่ำ';
    hormoneSummary = 'เอสโตรเจนและโปรเจสเตอโรนต่ำ ผนังมดลูกหลุดลอก';
    bodyFeel = 'อาจมีอาการปวดเกร็งท้องน้อย อ่อนเพลีย ปวดเมื่อยตัวง่าย';
    careTipForPartner = '💖 เตรียมกระเป๋าน้ำร้อน นวดหลัง ชงน้ำอุ่น และอย่าปล่อยให้หิวนะครับ ช่วงนี้ต้องการกำลังใจที่สุด!';
  } else if (isSameDay(targetDate, ovulationDate)) {
    phase = 'ovulation';
    phaseLabel = 'วันไข่ตก (Ovulation)';
    phaseColor = 'bg-purple-50 text-purple-800 border-purple-300';
    isOvulation = true;
    isFertile = true;
    pregnancyChance = 'สูงสุด';
    hormoneSummary = 'ฮอร์โมน LH และ Estrogen พุ่งแตะจุดสูงสุด';
    bodyFeel = 'อุณหภูมิร่างกายอาจสูงขึ้นเล็กน้อย มีมูกใส อารมณ์สดใสเบิกบาน';
    careTipForPartner = '✨ วันนี้แฟนสวยและมีเสน่ห์ดึงดูดเป็นพิเศษ หมั่นชื่นชมและบอกรักบ่อยๆ นะครับ';
  } else if (targetDate >= fertileStart && targetDate <= ovulationDate) {
    phase = 'fertile';
    phaseLabel = 'ช่วงเจริญพันธุ์ (โอกาสท้องสูง)';
    phaseColor = 'bg-emerald-50 text-emerald-800 border-emerald-200';
    isFertile = true;
    pregnancyChance = 'สูง';
    hormoneSummary = 'เอสโตรเจนสูง ร่างกายพร้อมสำหรับการตกไข่';
    bodyFeel = 'สดใส มีความมั่นใจสูง อารมณ์แจ่มใส';
    careTipForPartner = '🌿 ช่วงเวลาแห่งความสุข บรรยากาศโรแมนติก (หากยังไม่พร้อมมีน้อง ต้องคุมกำเนิดอย่างรัดกุม)';
  } else if (targetDate >= pmsStart && targetDate < nextPeriodStart) {
    phase = 'pms';
    phaseLabel = 'ช่วงก่อนเมนมา (PMS)';
    phaseColor = 'bg-amber-50 text-amber-800 border-amber-200';
    isPMS = true;
    pregnancyChance = 'ต่ำ';
    hormoneSummary = 'ฮอร์โมนโปรเจสเตอโรนและเอสโตรเจนดิ่งลง รบกวนสารเซโรโทนิน';
    bodyFeel = 'คัดตึงหน้าอก อารมณ์แปรปรวนง่าย หิวง่าย ท้องอืด นอนหลับยาก';
    careTipForPartner = '🧸 แฟนอาจจะนอยด์ง่าย ขี้น้อยใจ หรือหงุดหงิดง่าย ให้ใจเย็น รับฟัง กอดแน่นๆ และซื้อขนมมาฝากนะ!';
  } else if (dayOfCycle > averagePeriodLength && targetDate < fertileStart) {
    phase = 'follicular';
    phaseLabel = 'ระยะฟอลลิคูลาร์ (สดชื่น)';
    phaseColor = 'bg-sky-50 text-sky-800 border-sky-200';
    pregnancyChance = 'ต่ำ';
    hormoneSummary = 'ฮอร์โมนเริ่มฟื้นฟู สมองและผิวพรรณสดใส';
    bodyFeel = 'สบายตัว สดชื่น อารมณ์คงที่ มีสมาธิทำงานดีเยี่ยม';
    careTipForPartner = '🎉 แฟนอารมณ์ดีมาก เหมาะแก่การวางแผนเที่ยวด้วยกัน ชวนคุยเรื่องเป้าหมาย';
  } else {
    phase = 'luteal';
    phaseLabel = 'ระยะลูเทียล (บำรุงร่างกาย)';
    phaseColor = 'bg-slate-50 text-slate-700 border-slate-200';
    pregnancyChance = 'ต่ำ';
    hormoneSummary = 'โปรเจสเตอโรนทำงานเต็มที่ มดลูกหนาตัว';
    bodyFeel = 'รู้สึกสงบ อาจเริ่มมีอาการง่วงหรือเหนื่อยง่ายขึ้นเล็กน้อย';
    careTipForPartner = '☕ ช่วยทำงานบ้าน หรือชวนพักผ่อนดูหนังน่ารักๆ';
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
    careTipForPartner,
  };
}

/**
 * คำนวณสรุปสถิติประจำวัน พร้อมตรวจสอบว่าวันนี้มีประจำเดือนอยู่หรือไม่
 */
export function calculateSummaryStats(
  targetDateInput: string | Date = new Date(),
  lastPeriodStartDateInput: string | Date,
  averageCycleLength: number = 28,
  averagePeriodLength: number = 5,
  cycleLogs: CycleLog[] = []
): CycleSummaryStats {
  const targetDate = parseDateSafe(targetDateInput);
  const lastPeriodStart = parseDateSafe(lastPeriodStartDateInput);

  const dayInfo = getDayPhaseInfo(targetDate, lastPeriodStart, averageCycleLength, averagePeriodLength, cycleLogs);

  // ตรวจสอบรอบที่กำลังดำเนินอยู่ (Active Cycle)
  const latestCycle = cycleLogs.length > 0
    ? [...cycleLogs].sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())[0]
    : undefined;

  let isCurrentlyBleeding = false;
  if (latestCycle?.startDate) {
    const start = parseDateSafe(latestCycle.startDate);
    if (latestCycle.endDate) {
      const end = parseDateSafe(latestCycle.endDate);
      isCurrentlyBleeding = targetDate >= start && targetDate <= end;
    } else {
      // ยังไม่ได้บันทึกวันหมด: ถ้าเริ่มมาแล้วไม่เกิน 10 วัน ถือว่าอาจจะยังเป็นอยู่
      const daysSinceStart = differenceInCalendarDays(targetDate, start);
      isCurrentlyBleeding = daysSinceStart >= 0 && daysSinceStart < averagePeriodLength;
    }
  }

  // คำนวณวันแรกของรอบถัดไป
  const diff = differenceInCalendarDays(targetDate, lastPeriodStart);
  const cycleIndex = Math.floor(diff / averageCycleLength);
  let nextPeriod = addDays(lastPeriodStart, (cycleIndex + 1) * averageCycleLength);

  if (differenceInCalendarDays(nextPeriod, targetDate) <= 0) {
    nextPeriod = addDays(nextPeriod, averageCycleLength);
  }

  const daysUntilNextPeriod = differenceInCalendarDays(nextPeriod, targetDate);

  let nextOvulation = subDays(nextPeriod, 14);
  if (differenceInCalendarDays(nextOvulation, targetDate) < 0) {
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
    bodyFeel: dayInfo.bodyFeel,
    isCurrentlyBleeding,
    activeCycleStartDate: latestCycle?.startDate,
    activeCycleEndDate: latestCycle?.endDate,
  };
}
