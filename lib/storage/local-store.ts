import { UserProfile, CycleLog, DailyLog } from '@/lib/types/cycle';
import { format, subDays, addDays } from 'date-fns';

const STORAGE_KEYS = {
  PROFILE: 'cycle_tracker_profile',
  CYCLES: 'cycle_tracker_cycles',
  DAILY_LOGS: 'cycle_tracker_daily_logs',
};

// ข้อมูลตัวอย่างเริ่มต้น (มีวันเริ่มและวันหมดจริง)
export const getDefaultProfile = (): UserProfile => {
  const today = new Date();
  const defaultLastPeriod = format(subDays(today, 12), 'yyyy-MM-dd');

  return {
    id: 'local-user-1',
    name: 'ฟาง',
    partnerName: 'พุม',
    lineUserId: '',
    averageCycleLength: 28,
    averagePeriodLength: 5,
    lastPeriodStartDate: defaultLastPeriod,
    mode: 'partner',
  };
};

export const getDefaultCycleLogs = (): CycleLog[] => {
  const today = new Date();
  const lastStart = subDays(today, 12);
  const lastEnd = addDays(lastStart, 4); // 5 วัน
  
  const prevStart = subDays(lastStart, 28);
  const prevEnd = addDays(prevStart, 3); // 4 วัน

  return [
    {
      id: 'cycle-1',
      startDate: format(lastStart, 'yyyy-MM-dd'),
      endDate: format(lastEnd, 'yyyy-MM-dd'),
      periodLength: 5,
      notes: 'รอบล่าสุด',
    },
    {
      id: 'cycle-2',
      startDate: format(prevStart, 'yyyy-MM-dd'),
      endDate: format(prevEnd, 'yyyy-MM-dd'),
      periodLength: 4,
      notes: 'รอบก่อนหน้า มา 4 วัน',
    },
  ];
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
  if (typeof window === 'undefined') return getDefaultCycleLogs();
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CYCLES);
    if (!raw) {
      const defaults = getDefaultCycleLogs();
      localStorage.setItem(STORAGE_KEYS.CYCLES, JSON.stringify(defaults));
      return defaults;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : getDefaultCycleLogs();
  } catch (e) {
    console.error('Error loading cycle logs from localStorage', e);
    return getDefaultCycleLogs();
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

export function deleteCycleLog(cycleId: string): CycleLog[] {
  if (typeof window === 'undefined') return [];
  try {
    const existing = loadCycleLogs();
    const updated = existing.filter((c) => c.id !== cycleId);
    localStorage.setItem(STORAGE_KEYS.CYCLES, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error('Error deleting cycle log from localStorage', e);
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
