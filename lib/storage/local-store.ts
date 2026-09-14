import { UserProfile, CycleLog, DailyLog } from '@/lib/types/cycle';
import { format, subDays } from 'date-fns';

const STORAGE_KEYS = {
  PROFILE: 'cycle_tracker_profile',
  CYCLES: 'cycle_tracker_cycles',
  DAILY_LOGS: 'cycle_tracker_daily_logs',
};

// ข้อมูลเริ่มต้นสำหรับผู้ใช้ใหม่ (คำนวณวันรอบล่าสุดให้อยู่ในช่วง 12 วันก่อนหน้าเพื่อเห็นข้อมูลสวยงามทันที)
export const getDefaultProfile = (): UserProfile => {
  const today = new Date();
  const defaultLastPeriod = format(subDays(today, 12), 'yyyy-MM-dd');

  return {
    id: 'local-user-1',
    name: 'หวานใจ',
    partnerName: 'แฟนที่น่ารัก',
    lineUserId: '',
    averageCycleLength: 28,
    averagePeriodLength: 5,
    lastPeriodStartDate: defaultLastPeriod,
    mode: 'partner', // เริ่มต้นในโหมดแฟนดูแลเพื่อความเซอร์ไพรส์
  };
};

export function loadProfile(): UserProfile {
  if (typeof window === 'undefined') return getDefaultProfile();
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PROFILE);
    if (!raw) return getDefaultProfile();
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error loading profile from localStorage', e);
    return getDefaultProfile();
  }
}

export function saveProfile(profile: UserProfile): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
  } catch (e) {
    console.error('Error saving profile to localStorage', e);
  }
}

export function loadCycleLogs(): CycleLog[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CYCLES);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error loading cycle logs from localStorage', e);
    return [];
  }
}

export function saveCycleLog(newLog: CycleLog): CycleLog[] {
  if (typeof window === 'undefined') return [];
  try {
    const existing = loadCycleLogs();
    const filtered = existing.filter((c) => c.id !== newLog.id);
    const updated = [newLog, ...filtered].sort(
      (a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
    );
    localStorage.setItem(STORAGE_KEYS.CYCLES, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error('Error saving cycle log to localStorage', e);
    return [];
  }
}

export function loadDailyLogs(): Record<string, DailyLog> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.DAILY_LOGS);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error loading daily logs from localStorage', e);
    return {};
  }
}

export function saveDailyLog(log: DailyLog): Record<string, DailyLog> {
  if (typeof window === 'undefined') return {};
  try {
    const existing = loadDailyLogs();
    existing[log.date] = log;
    localStorage.setItem(STORAGE_KEYS.DAILY_LOGS, JSON.stringify(existing));
    return { ...existing };
  } catch (e) {
    console.error('Error saving daily log to localStorage', e);
    return {};
  }
}
