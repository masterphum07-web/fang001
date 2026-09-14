'use client';

import React from 'react';
import confetti from 'canvas-confetti';
import { Sparkles, Droplet, Heart, Calendar, ShieldAlert } from 'lucide-react';
import { CycleSummaryStats } from '@/lib/utils/cycle-calculator';
import { UserProfile } from '@/lib/types/cycle';

interface StatusBannerProps {
  stats: CycleSummaryStats;
  profile: UserProfile;
  onPeriodStartedToday: () => void;
}

export const StatusBanner: React.FC<StatusBannerProps> = ({
  stats,
  profile,
  onPeriodStartedToday,
}) => {
  const triggerConfetti = () => {
    confetti({
      particleCount: 70,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#0EA5E9', '#38BDF8', '#818CF8', '#F43F5E']
    });
    onPeriodStartedToday();
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
      {/* Top Accent Bar (Inspired by the orange/accent bar in screenshot) */}
      <div className="h-2 w-full bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-500" />

      <div className="p-6 sm:p-8">
        {/* Giant Centered Headline in Chunky Kanit Font (Like "เก็บไฟล์เรียนโหดๆๆๆๆ" in screenshot) */}
        <div className="text-center max-w-2xl mx-auto mb-6">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight leading-snug">
            {profile.mode === 'partner' 
              ? `ระบบติดตามรอบเดือน & ดูแล${profile.name} 💙`
              : `บันทึกรอบเดือน & สุขภาพของคุณ 🌷`}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1.5">
            คำนวณระยะร่างกายตามหลักวิทยาศาสตร์การแพทย์ (ACOG) พร้อมแจ้งเตือนผ่าน LINE OA
          </p>
        </div>

        {/* 3 Metric Cards Grid: Clean, High Contrast, Easy to Read */}
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

          {/* Metric 3: Next Ovulation & Action */}
          <div className="bg-slate-50/80 border border-slate-200/80 rounded-2xl p-4 flex items-center justify-between gap-3">
            <div>
              <span className="text-xs text-slate-400 font-semibold block">วันไข่ตกถัดไป</span>
              <span className="text-sm font-bold text-purple-700">
                อีก {stats.daysUntilOvulation} วัน
              </span>
              <span className="text-[11px] text-slate-500 block mt-0.5 font-medium">
                โอกาสตั้งครรภ์: <b className="text-slate-700">{stats.pregnancyChance}</b>
              </span>
            </div>
            <button
              onClick={triggerConfetti}
              className="px-3 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-sm transition-all active:scale-95 shrink-0 flex items-center gap-1"
              title="จดว่าเมนมาแล้ววันนี้"
            >
              <Droplet className="w-3.5 h-3.5 fill-white" />
              <span>เมนมาแล้ว</span>
            </button>
          </div>
        </div>

        {/* Highlight Tip Banner for Today */}
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
