'use client';

import React from 'react';
import confetti from 'canvas-confetti';
import { Droplet, Heart, Sparkles, SlidersHorizontal, Check } from 'lucide-react';
import { CycleSummaryStats } from '@/lib/utils/cycle-calculator';
import { UserProfile } from '@/lib/types/cycle';

interface StatusBannerProps {
  stats: CycleSummaryStats;
  profile: UserProfile;
  onPeriodStartedToday: () => void;
  onPeriodEndedToday: () => void;
  onOpenPeriodRangeModal: () => void;
}

export const StatusBanner: React.FC<StatusBannerProps> = ({
  stats,
  profile,
  onPeriodStartedToday,
  onPeriodEndedToday,
  onOpenPeriodRangeModal,
}) => {
  const handlePeriodStart = () => {
    confetti({
      particleCount: 70,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#F43F5E', '#FB7185', '#FDA4AF', '#F472B6'],
    });
    onPeriodStartedToday();
  };

  const handlePeriodEnd = () => {
    confetti({
      particleCount: 70,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#38BDF8', '#0EA5E9', '#818CF8', '#10B981'],
    });
    onPeriodEndedToday();
  };

  const getPhaseColorBadge = (phase: string) => {
    switch (phase) {
      case 'menstrual':
        return 'bg-rose-500 text-white';
      case 'ovulation':
        return 'bg-purple-600 text-white';
      case 'fertile':
        return 'bg-emerald-500 text-white';
      case 'pms':
        return 'bg-amber-500 text-white';
      default:
        return 'bg-sky-500 text-white';
    }
  };

  return (
    <div className="bg-white rounded-3xl sm:rounded-[2rem] border border-slate-200 shadow-sm relative overflow-hidden">
      {/* Top Accent Bar */}
      <div className="h-2 w-full bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-500" />

      <div className="p-6 sm:p-8">
        {/* Headline */}
        <div className="text-center max-w-2xl mx-auto mb-6">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight leading-snug">
            {profile.mode === 'partner' 
              ? `ระบบติดตามรอบเดือน & ดูแล${profile.name} 💙`
              : `บันทึกรอบเดือน & สุขภาพของคุณ 🌷`}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1.5">
            คำนวณตามหลักสูตินารีแพทย์ (ACOG) • บันทึกวันเริ่มและวันหมดตามจริงในแต่ละเดือน
          </p>
        </div>

        {/* 3 Metric Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-5">
          {/* Metric 1: Days until period */}
          <div className="bg-slate-50/80 border border-slate-200/80 rounded-2xl p-4 flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-sky-500 text-white flex flex-col items-center justify-center font-black shadow-sm shrink-0">
              <span className="text-2xl leading-none">{stats.daysUntilNextPeriod}</span>
              <span className="text-[10px] font-medium mt-0.5">วัน</span>
            </div>
            <div>
              <span className="text-xs text-slate-400 font-semibold block">ประจำเดือนรอบถัดไป</span>
              <span className="text-sm font-bold text-slate-800">
                {stats.daysUntilNextPeriod === 0 ? 'คาดว่าจะมาวันนี้!' : `อีกประมาณ ${stats.daysUntilNextPeriod} วัน`}
              </span>
              <span className="text-[11px] text-sky-600 block mt-0.5 font-medium">({stats.nextPeriodDate})</span>
            </div>
          </div>

          {/* Metric 2: Current Phase */}
          <div className="bg-slate-50/80 border border-slate-200/80 rounded-2xl p-4 flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 flex items-center justify-center shrink-0">
              <span className="text-2xl">
                {stats.currentPhase === 'menstrual' && '🩸'}
                {stats.currentPhase === 'ovulation' && '✨'}
                {stats.currentPhase === 'fertile' && '🌿'}
                {stats.currentPhase === 'pms' && '🧸'}
                {stats.currentPhase === 'follicular' && '🌸'}
                {stats.currentPhase === 'luteal' && '☕'}
              </span>
            </div>
            <div>
              <span className="text-xs text-slate-400 font-semibold block">ระยะร่างกายปัจจุบัน</span>
              <span className={`inline-block px-2.5 py-0.5 rounded-lg text-xs font-bold mt-0.5 shadow-2xs ${getPhaseColorBadge(stats.currentPhase)}`}>
                {stats.phaseLabel}
              </span>
              <span className="text-[11px] text-slate-500 block mt-0.5 font-medium">
                วันที่ {stats.currentDayOfCycle} ของรอบเดือน
              </span>
            </div>
          </div>

          {/* Metric 3: Quick Action (Start / End Date) */}
          <div className="bg-slate-50/80 border border-slate-200/80 rounded-2xl p-4 flex flex-col justify-between gap-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-semibold">บันทึกวันเริ่ม-วันหมด:</span>
              <button
                type="button"
                onClick={onOpenPeriodRangeModal}
                className="text-[11px] font-bold text-sky-600 hover:text-sky-800 underline flex items-center gap-1"
              >
                <SlidersHorizontal className="w-3 h-3" />
                <span>จัดการรอบ</span>
              </button>
            </div>

            {stats.isCurrentlyBleeding ? (
              <button
                onClick={handlePeriodEnd}
                className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white text-xs font-bold shadow-sm transition-all active:scale-95 flex items-center justify-center gap-1.5"
                title="บันทึกว่าประจำเดือนหมดแล้ววันนี้"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>✨ เมนหายแล้ววันนี้ (บันทึกวันหมด)</span>
              </button>
            ) : (
              <button
                onClick={handlePeriodStart}
                className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white text-xs font-bold shadow-sm transition-all active:scale-95 flex items-center justify-center gap-1.5"
                title="บันทึกวันแรกที่มีประจำเดือน"
              >
                <Droplet className="w-3.5 h-3.5 fill-white" />
                <span>🩸 เมนมาแล้ววันนี้ (บันทึกวันเริ่ม)</span>
              </button>
            )}

            <div className="text-[10px] text-slate-400 text-center font-medium">
              * แต่ละเดือนมาไม่เท่ากัน สามารถปรับวันได้ตลอด
            </div>
          </div>
        </div>

        {/* Highlight Tip Banner */}
        <div className="bg-sky-50/60 border border-sky-100 rounded-2xl p-3.5 sm:p-4 flex items-start gap-3">
          <div className="p-2 rounded-xl bg-sky-500 text-white shrink-0 mt-0.5">
            <Heart className="w-4 h-4 fill-white" />
          </div>
          <div className="text-xs sm:text-sm">
            <span className="font-bold text-sky-900 mr-1.5">
              {profile.mode === 'partner' ? `💙 คำแนะนำดูแลแฟน (${profile.name}):` : 'คำแนะนำการดูแลตัวเองวันนี้:'}
            </span>
            <span className="text-slate-700 font-medium leading-relaxed">
              {stats.partnerTip}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
