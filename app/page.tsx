'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  loadProfile, 
  saveProfile, 
  loadDailyLogs, 
  saveDailyLog, 
  loadCycleLogs, 
  saveCycleLog,
  deleteCycleLog
} from '@/lib/storage/local-store';
import { 
  calculateCyclePhases, 
  calculateSummaryStats, 
  formatDateSafe,
  calculateAdaptivePeriodLength,
  calculateAdaptiveCycleLength
} from '@/lib/utils/cycle-calculator';
import { UserProfile, DailyLog, CycleLog } from '@/lib/types/cycle';
import { Header } from '@/components/Header';
import { StatusBanner } from '@/components/StatusBanner';
import { Calendar } from '@/components/Calendar';
import { DayDetailCard } from '@/components/DayDetailCard';
import { PartnerCareCard } from '@/components/PartnerCareCard';
import { DailyLogModal } from '@/components/DailyLogModal';
import { CycleSettingsModal } from '@/components/CycleSettingsModal';
import { PeriodRangeModal } from '@/components/PeriodRangeModal';

export default function Home() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [cycleLogs, setCycleLogs] = useState<CycleLog[]>([]);
  const [dailyLogs, setDailyLogs] = useState<Record<string, DailyLog>>({});
  const [selectedDate, setSelectedDate] = useState<string>(() => formatDateSafe(new Date()));
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isPeriodRangeModalOpen, setIsPeriodRangeModalOpen] = useState(false);
  const [activeLogDate, setActiveLogDate] = useState<string>(() => formatDateSafe(new Date()));

  // โหลดข้อมูลเมื่อเปิดหน้าเว็บ
  useEffect(() => {
    const loadedProf = loadProfile();
    const loadedCycles = loadCycleLogs();
    setProfile(loadedProf);
    setCycleLogs(loadedCycles);
    setDailyLogs(loadDailyLogs());
  }, []);

  // คำนวณ Phases และ Stats โดยอิงตาม cycleLogs จริง (ไม่ล็อควัน!)
  const phaseMap = useMemo(() => {
    if (!profile) return new Map();
    return calculateCyclePhases(
      profile.lastPeriodStartDate,
      profile.averageCycleLength,
      profile.averagePeriodLength,
      120,
      cycleLogs
    );
  }, [profile, cycleLogs]);

  const summaryStats = useMemo(() => {
    if (!profile) return null;
    return calculateSummaryStats(
      new Date(),
      profile.lastPeriodStartDate,
      profile.averageCycleLength,
      profile.averagePeriodLength,
      cycleLogs
    );
  }, [profile, cycleLogs]);

  const selectedPhaseInfo = useMemo(() => {
    return phaseMap.get(selectedDate);
  }, [phaseMap, selectedDate]);

  if (!profile || !summaryStats) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF7F2]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-sky-500" />
      </div>
    );
  }

  // Event Handlers
  const handleUpdateProfile = (updated: UserProfile) => {
    setProfile(updated);
    saveProfile(updated);
  };

  // 🩸 วันแรกที่เมนมา (เริ่มรอบ)
  const handlePeriodStartedToday = () => {
    const todayStr = formatDateSafe(new Date());
    
    // สร้าง CycleLog ใหม่
    const newCycle: CycleLog = {
      id: `cycle-${Date.now()}`,
      startDate: todayStr,
      endDate: undefined,
    };
    const updatedCycles = saveCycleLog(newCycle);
    setCycleLogs(updatedCycles);

    // ปรับ lastPeriodStartDate ใน Profile
    const updatedProfile: UserProfile = {
      ...profile,
      lastPeriodStartDate: todayStr,
    };
    handleUpdateProfile(updatedProfile);
    setSelectedDate(todayStr);
  };

  // ✨ วันที่เมนหาย/วันหมด (สิ้นสุดรอบ)
  const handlePeriodEndedToday = () => {
    const todayStr = formatDateSafe(new Date());
    
    // หา cycle ล่าสุดที่ยังไม่มี endDate หรือมี startDate ใกล้เคียง
    const sorted = [...cycleLogs].sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
    let target = sorted[0];

    if (target) {
      const updated: CycleLog = {
        ...target,
        endDate: todayStr,
      };
      const updatedCycles = saveCycleLog(updated);
      setCycleLogs(updatedCycles);

      // คำนวณค่าเฉลี่ยใหม่แบบ Adaptive
      const newAvgPeriod = calculateAdaptivePeriodLength(updatedCycles, profile.averagePeriodLength);
      const newAvgCycle = calculateAdaptiveCycleLength(updatedCycles, profile.averageCycleLength);
      handleUpdateProfile({
        ...profile,
        averagePeriodLength: newAvgPeriod,
        averageCycleLength: newAvgCycle,
      });
    }
  };

  // 📝 บันทึกหรือแก้ไขรอบเดือน (Custom Start & End Date)
  const handleSaveCycle = (cycle: CycleLog) => {
    const updatedCycles = saveCycleLog(cycle);
    setCycleLogs(updatedCycles);

    // ปรับวันล่าสุดหากเป็นรอบที่ใหม่สุด
    const sorted = [...updatedCycles].sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
    if (sorted[0]?.id === cycle.id) {
      const newAvgPeriod = calculateAdaptivePeriodLength(updatedCycles, profile.averagePeriodLength);
      const newAvgCycle = calculateAdaptiveCycleLength(updatedCycles, profile.averageCycleLength);
      handleUpdateProfile({
        ...profile,
        lastPeriodStartDate: cycle.startDate,
        averagePeriodLength: newAvgPeriod,
        averageCycleLength: newAvgCycle,
      });
    }
  };

  // 🗑️ ลบรอบเดือน
  const handleDeleteCycle = (cycleId: string) => {
    const updatedCycles = deleteCycleLog(cycleId);
    setCycleLogs(updatedCycles);
  };

  const handleOpenLogModal = (dateStr?: string) => {
    setActiveLogDate(dateStr || selectedDate);
    setIsLogModalOpen(true);
  };

  const handleSaveDailyLog = (log: DailyLog) => {
    const updated = saveDailyLog(log);
    setDailyLogs(updated);
  };

  const handleDeleteDailyLog = (dateStr: string) => {
    if (typeof window === 'undefined') return;
    const current = { ...dailyLogs };
    delete current[dateStr];
    localStorage.setItem('cycle_tracker_daily_logs', JSON.stringify(current));
    setDailyLogs(current);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F2] font-['Kanit',sans-serif]">
      {/* Top Header */}
      <Header
        profile={profile}
        onUpdateProfile={handleUpdateProfile}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        onOpenLogModal={() => handleOpenLogModal()}
      />

      {/* Main Content Dashboard */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* Hero Status Banner with Start/End toggles */}
        <StatusBanner
          stats={summaryStats}
          profile={profile}
          onPeriodStartedToday={handlePeriodStartedToday}
          onPeriodEndedToday={handlePeriodEndedToday}
          onOpenPeriodRangeModal={() => setIsPeriodRangeModalOpen(true)}
        />

        {/* Partner Care In-depth Hub (Active in Partner Support Mode) */}
        {profile.mode === 'partner' && (
          <PartnerCareCard
            phaseInfo={selectedPhaseInfo}
            profile={profile}
          />
        )}

        {/* Interactive Calendar and Day Detail */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar on the Left/Center (2 columns on large screens) */}
          <div className="lg:col-span-2">
            <Calendar
              phaseMap={phaseMap}
              dailyLogs={dailyLogs}
              selectedDate={selectedDate}
              onSelectDate={(dateStr) => setSelectedDate(dateStr)}
              onOpenLogModal={(dateStr) => handleOpenLogModal(dateStr)}
            />
          </div>

          {/* Selected Day Details on the Right (1 column) */}
          <div className="lg:col-span-1">
            <DayDetailCard
              dateStr={selectedDate}
              phaseInfo={selectedPhaseInfo}
              log={dailyLogs[selectedDate]}
              profile={profile}
              onOpenLogModal={(dateStr) => handleOpenLogModal(dateStr)}
            />
          </div>
        </div>
      </main>

      {/* Footer Note */}
      <footer className="py-6 text-center text-xs text-slate-400 border-t border-slate-200">
        <p>สร้างด้วยความตั้งใจเพื่อดูแล {profile.name} 💙 • อิงหลักสูตินารีแพทย์ (ACOG)</p>
      </footer>

      {/* Modals */}
      <PeriodRangeModal
        isOpen={isPeriodRangeModalOpen}
        cycleLogs={cycleLogs}
        onClose={() => setIsPeriodRangeModalOpen(false)}
        onSaveCycle={handleSaveCycle}
        onDeleteCycle={handleDeleteCycle}
      />

      <DailyLogModal
        isOpen={isLogModalOpen}
        dateStr={activeLogDate}
        initialLog={dailyLogs[activeLogDate]}
        profile={profile}
        onClose={() => setIsLogModalOpen(false)}
        onSave={handleSaveDailyLog}
        onDelete={handleDeleteDailyLog}
      />

      <CycleSettingsModal
        isOpen={isSettingsModalOpen}
        profile={profile}
        onClose={() => setIsSettingsModalOpen(false)}
        onSave={handleUpdateProfile}
      />
    </div>
  );
}
