import { addDays, subDays, differenceInCalendarDays, format, parseISO, isSameDay } from 'date-fns';
import { CyclePhase, DailyPhaseInfo, CycleLog } from '@/lib/types/cycle';

export interface BehavioralAnalysis {
  hasEnoughData: boolean;
  cycleCount: number;
  avgCycleLength: number;
  minCycleLength: number;
  maxCycleLength: number;
  avgPeriodLength: number;
  minPeriodLength: number;
  maxPeriodLength: number;
  regularityStatus: 'สม่ำเสมอสูง' | 'ปกติ (แปรผันตามธรรมชาติ)' | 'รอบเดือนค่อนข้างแปรปรวน';
  predictedRange: { start: string; end: string };
  insightNote: string;
}

export interface CycleSummaryStats {
  currentDate: string;
  currentDayOfCycle: number;
  currentPhase: CyclePhase;
  phaseLabel: string;
  nextPeriodDate: string;
  nextPeriodWindow: { start: string; end: string };
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
  behavioralInsight?: BehavioralAnalysis;
}

export function parseDateSafe(dateInput: string | Date): Date {
  if (dateInput instanceof Date) return dateInput;
  return parseISO(dateInput);
}

export function formatDateSafe(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

/**
 * 🧠 วิเคราะห์พฤติกรรมร่างกายเฉพาะบุคคล (Behavioral Pattern Learning)
 * คำนวณจากประวัติจริง ไม่ใช้การตั้งค่าตายตัว
 */
export function analyzePersonalBehavior(
  cycleLogs: CycleLog[] = [],
  fallbackCycle: number = 28,
  fallbackPeriod: number = 5
): BehavioralAnalysis {
  if (!cycleLogs || cycleLogs.length === 0) {
    return {
      hasEnoughData: false,
      cycleCount: 0,
      avgCycleLength: fallbackCycle,
      minCycleLength: fallbackCycle - 2,
      maxCycleLength: fallbackCycle + 2,
      avgPeriodLength: fallbackPeriod,
      minPeriodLength: fallbackPeriod - 1,
      maxPeriodLength: fallbackPeriod + 1,
      regularityStatus: 'ปกติ (แปรผันตามธรรมชาติ)',
      predictedRange: {
        start: formatDateSafe(addDays(new Date(), fallbackCycle - 1)),
        end: formatDateSafe(addDays(new Date(), fallbackCycle + 1)),
      },
      insightNote: 'ยังไม่มีประวัติบันทึก ระบบใช้ค่ามาตรฐานทางการแพทย์ชั่วคราว เมื่อเริ่มจดวันเริ่ม-วันหมด ระบบจะเรียนรู้สรีระจริงให้อัตโนมัติ',
    };
  }

  // 1. วิเคราะห์จำนวนวันที่มีประจำเดือนจริง (Period Length) จากแต่ละรอบ
  const recordedPeriodLengths: number[] = [];
  for (const log of cycleLogs) {
    if (log.startDate && log.endDate) {
      const start = parseDateSafe(log.startDate);
      const end = parseDateSafe(log.endDate);
      const diff = differenceInCalendarDays(end, start) + 1;
      if (diff >= 1 && diff <= 14) {
        recordedPeriodLengths.push(diff);
      }
    }
  }

  let avgPeriodLength = fallbackPeriod;
  let minPeriodLength = fallbackPeriod;
  let maxPeriodLength = fallbackPeriod;

  if (recordedPeriodLengths.length > 0) {
    // ให้น้ำหนักรอบล่าสุดมากกว่า (Weighted Average)
    let weightedSum = 0;
    let weightTotal = 0;
    recordedPeriodLengths.forEach((len, idx) => {
      const weight = idx + 1;
      weightedSum += len * weight;
      weightTotal += weight;
    });
    avgPeriodLength = Math.round(weightedSum / weightTotal);
    minPeriodLength = Math.min(...recordedPeriodLengths);
    maxPeriodLength = Math.max(...recordedPeriodLengths);
  }

  // 2. วิเคราะห์ความยาวรอบเดือนจริง (Cycle Length) ระหว่างแต่ละรอบ
  const sortedStarts = [...cycleLogs]
    .map((c) => c.startDate)
    .filter(Boolean)
    .sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

  const recordedCycleLengths: number[] = [];
  for (let i = 1; i < sortedStarts.length; i++) {
    const diff = differenceInCalendarDays(parseDateSafe(sortedStarts[i]), parseDateSafe(sortedStarts[i - 1]));
    if (diff >= 18 && diff <= 50) {
      recordedCycleLengths.push(diff);
    }
  }

  let avgCycleLength = fallbackCycle;
  let minCycleLength = fallbackCycle - 2;
  let maxCycleLength = fallbackCycle + 2;
  let regularityStatus: 'สม่ำเสมอสูง' | 'ปกติ (แปรผันตามธรรมชาติ)' | 'รอบเดือนค่อนข้างแปรปรวน' = 'ปกติ (แปรผันตามธรรมชาติ)';

  if (recordedCycleLengths.length > 0) {
    let weightedSum = 0;
    let weightTotal = 0;
    recordedCycleLengths.forEach((len, idx) => {
      const weight = idx + 1;
      weightedSum += len * weight;
      weightTotal += weight;
    });
    avgCycleLength = Math.round(weightedSum / weightTotal);
    minCycleLength = Math.min(...recordedCycleLengths);
    maxCycleLength = Math.max(...recordedCycleLengths);

    const variance = maxCycleLength - minCycleLength;
    if (variance <= 2) {
      regularityStatus = 'สม่ำเสมอสูง';
    } else if (variance <= 5) {
      regularityStatus = 'ปกติ (แปรผันตามธรรมชาติ)';
    } else {
      regularityStatus = 'รอบเดือนค่อนข้างแปรปรวน';
    }
  }

  // คาดการณ์หน้าต่างวันที่เมนจะมา (Window of Prediction)
  const latestStartStr = sortedStarts[sortedStarts.length - 1] || formatDateSafe(new Date());
  const latestStart = parseDateSafe(latestStartStr);
  const predictedCenter = addDays(latestStart, avgCycleLength);
  const windowHalfSpan = Math.max(1, Math.round((maxCycleLength - minCycleLength) / 2));
  const predictedRange = {
    start: formatDateSafe(subDays(predictedCenter, windowHalfSpan)),
    end: formatDateSafe(addDays(predictedCenter, windowHalfSpan)),
  };

  const insightNote = recordedCycleLengths.length >= 1
    ? `ระบบเรียนรู้จากประวัติ ${cycleLogs.length} รอบ: รอบเดือนจริงจะอยู่ที่ ${minCycleLength}-${maxCycleLength} วัน (เฉลี่ย ${avgCycleLength} วัน) และมีประจำเดือนประมาณ ${minPeriodLength}-${maxPeriodLength} วัน`
    : `บันทึกแล้ว ${cycleLogs.length} รอบเดือน ระบบกำลังเริ่มจดจำพฤติกรรมร่างกายจริง`;

  return {
    hasEnoughData: recordedCycleLengths.length >= 1 || recordedPeriodLengths.length >= 1,
    cycleCount: cycleLogs.length,
    avgCycleLength,
    minCycleLength,
    maxCycleLength,
    avgPeriodLength,
    minPeriodLength,
    maxPeriodLength,
    regularityStatus,
    predictedRange,
    insightNote,
  };
}

export function calculateAdaptivePeriodLength(cycleLogs: CycleLog[], fallback: number = 5): number {
  return analyzePersonalBehavior(cycleLogs, 28, fallback).avgPeriodLength;
}

export function calculateAdaptiveCycleLength(cycleLogs: CycleLog[], fallback: number = 28): number {
  return analyzePersonalBehavior(cycleLogs, fallback, 5).avgCycleLength;
}

/**
 * ค้นหาว่าวันเป้าหมายอยู่ในช่วงประจำเดือนของประวัติรอบไหน
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
 * คำนวณข้อมูล Phase สำหรับปฏิทิน โดยอิงตามพฤติกรรมจริงและช่วงวันจริงที่ผู้ใช้จด
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

  // วิเคราะห์พฤติกรรมเพื่อใช้ค่าเฉลี่ยสรีระจริง
  const behavior = analyzePersonalBehavior(cycleLogs, averageCycleLength, averagePeriodLength);
  const effectiveCycleLen = behavior.avgCycleLength;
  const effectivePeriodLen = behavior.avgPeriodLength;

  const startScanDate = subDays(lastPeriodStart, 28);
  const endScanDate = addDays(lastPeriodStart, daysAhead);
  const totalDays = differenceInCalendarDays(endScanDate, startScanDate) + 1;

  for (let i = 0; i < totalDays; i++) {
    const targetDate = addDays(startScanDate, i);
    const dateStr = formatDateSafe(targetDate);
    const info = getDayPhaseInfo(targetDate, lastPeriodStart, effectiveCycleLen, effectivePeriodLen, cycleLogs);
    phaseMap.set(dateStr, info);
  }

  return phaseMap;
}

/**
 * คำนวณระยะของวันหนึ่งวันตามสรีระเฉพาะบุคคล
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

  // ตรวจสอบวันจริงที่บันทึกไว้
  const actualStatus = findActualPeriodStatus(targetDate, cycleLogs, averagePeriodLength);

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
 * คำนวณสรุปสถิติประจำวัน อิงพฤติกรรมร่างกายจริง
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

  // 1. วิเคราะห์พฤติกรรมสรีระเฉพาะบุคคล
  const behavioralInsight = analyzePersonalBehavior(cycleLogs, averageCycleLength, averagePeriodLength);
  const effectiveCycleLen = behavioralInsight.avgCycleLength;
  const effectivePeriodLen = behavioralInsight.avgPeriodLength;

  const dayInfo = getDayPhaseInfo(targetDate, lastPeriodStart, effectiveCycleLen, effectivePeriodLen, cycleLogs);

  // ตรวจสอบว่ากำลังมีประจำเดือนอยู่หรือไม่
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
      const daysSinceStart = differenceInCalendarDays(targetDate, start);
      isCurrentlyBleeding = daysSinceStart >= 0 && daysSinceStart < effectivePeriodLen;
    }
  }

  // วันแรกของรอบถัดไป
  const diff = differenceInCalendarDays(targetDate, lastPeriodStart);
  const cycleIndex = Math.floor(diff / effectiveCycleLen);
  let nextPeriod = addDays(lastPeriodStart, (cycleIndex + 1) * effectiveCycleLen);

  if (differenceInCalendarDays(nextPeriod, targetDate) <= 0) {
    nextPeriod = addDays(nextPeriod, effectiveCycleLen);
  }

  const daysUntilNextPeriod = differenceInCalendarDays(nextPeriod, targetDate);

  let nextOvulation = subDays(nextPeriod, 14);
  if (differenceInCalendarDays(nextOvulation, targetDate) < 0) {
    const nextNextPeriod = addDays(nextPeriod, effectiveCycleLen);
    nextOvulation = subDays(nextNextPeriod, 14);
  }
  const daysUntilOvulation = differenceInCalendarDays(nextOvulation, targetDate);

  return {
    currentDate: formatDateSafe(targetDate),
    currentDayOfCycle: dayInfo.dayOfCycle,
    currentPhase: dayInfo.phase,
    phaseLabel: dayInfo.phaseLabel,
    nextPeriodDate: formatDateSafe(nextPeriod),
    nextPeriodWindow: behavioralInsight.predictedRange,
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
    behavioralInsight,
  };
}
