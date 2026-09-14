'use client';

import React from 'react';
import confetti from 'canvas-confetti';
import { 
  Sparkles, 
  Droplet,
  Heart,
  Calendar,
  ShieldAlert,
  ArrowRight,
  SunMedium
} from 'lucide-react';
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

  const getPhaseBadgeStyle = (phase: string) => {
    switch (phase) {
      case 'menstrual':
        return 'bg-rose-500 text-white shadow-rose-200';
      case 'ovulation':
        return 'bg-purple-600 text-white shadow-purple-200';
      case 'fertile':
        return 'bg-emerald-500 text-white shadow-emerald-200';
      case 'pms':
        return 'bg-amber-500 text-white shadow-amber-200';
      default:
        return 'bg-sky-500 text-white shadow-sky-200';
    }
  };

  return (
    <div className="bg-gradient-to-br from-white via-sky-50/50 to-blue-50/40 rounded-3xl p-5 sm:p-7 border border-sky-100 shadow-sm relative overflow-hidden">
      {/* Background Subtle Ambient Glow */}
      <div className="absolute -top-20 -right-20 w-64 h-64 bg-sky-200/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-blue-200/30 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        {/* Left: Countdown Circular Metric & Status */}
        <div className="flex items-center gap-5">
          <div className="relative flex items-center justify-center shrink-0">
            {/* Elegant Circular Counter with Blue Ring */}
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-[3.5px] border-sky-300 bg-white flex flex-col items-center justify-center shadow-md shadow-sky-100 text-center p-2">
              <span className="text-[11px] text-slate-400 font-medium">อีกประมาณ</span>
              <span className="text-3xl sm:text-4xl font-extrabold text-sky-600 tracking-tight leading-none my-0.5">
                {stats.daysUntilNextPeriod}
              </span>
              <span className="text-[11px] text-sky-600 font-semibold">วันเมนจะมา</span>
            </div>
            {/* Badge Indicator */}
            <div className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-gradient-to-tr from-sky-500 to-blue-600 text-white shadow-md">
              <Droplet className="w-3.5 h-3.5 fill-white" />
            </div>
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className={`text-xs px-3 py-1 rounded-full font-bold shadow-sm ${getPhaseBadgeStyle(stats.currentPhase)}`}>
                {stats.phaseLabel}
              </span>
              <span className="text-xs text-sky-700 bg-sky-50/90 border border-sky-200/80 px-2.5 py-0.5 rounded-full font-medium">
                วันที่ {stats.currentDayOfCycle} ของรอบ
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-slate-800">
              {stats.currentPhase === 'menstrual' && 'ช่วงนี้ประจำเดือนมา พักผ่อนและดื่มน้ำอุ่นเยอะๆ นะ 🩸'}
              {stats.currentPhase === 'pms' && 'เข้าสู่ระยะ PMS อารมณ์อาจอ่อนไหว ต้องการความเข้าใจ 🧸'}
              {stats.currentPhase === 'ovulation' && 'วันนี้คือวันไข่ตก (Ovulation Day) โอกาสตั้งครรภ์สูงสุด ✨'}
              {stats.currentPhase === 'fertile' && 'อยู่ในช่วงเจริญพันธุ์ โอกาสตั้งครรภ์สูง 🌿'}
              {stats.currentPhase === 'follicular' && 'ช่วงฟอลลิคูลาร์ ร่างกายสดชื่น อารมณ์แจ่มใส 🌸'}
              {stats.currentPhase === 'luteal' && 'ช่วงลูเทียล ร่างกายกำลังปรับสมดุล พักผ่อนให้สบาย ☕'}
            </h2>

            <p className="text-xs sm:text-sm text-slate-600 mt-1.5 max-w-xl leading-relaxed">
              {stats.bodyFeel}
            </p>
          </div>
        </div>

        {/* Right: Quick Action & Highlights */}
        <div className="w-full md:w-auto flex flex-col sm:flex-row md:flex-col gap-2.5 shrink-0">
          <button
            onClick={triggerConfetti}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-semibold text-xs sm:text-sm shadow-md shadow-rose-200 transition-all active:scale-95"
          >
            <Droplet className="w-4 h-4 fill-white" />
            <span>เมนมาแล้ววันนี้! จดรอบใหม่</span>
          </button>

          <div className="flex items-center justify-between gap-3 px-3.5 py-2 rounded-2xl bg-white/90 border border-sky-100 text-xs text-slate-600 shadow-sm">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-purple-500" />
              วันไข่ตกถัดไป:
            </span>
            <span className="font-bold text-purple-700">
              อีก {stats.daysUntilOvulation} วัน ({stats.nextOvulationDate})
            </span>
          </div>
        </div>
      </div>

      {/* Partner Support Highlight Strip */}
      <div className="mt-5 pt-4 border-t border-sky-100 flex items-start gap-3 bg-white/80 rounded-2xl p-3.5 shadow-sm">
        <div className="p-2 rounded-xl bg-sky-100 text-sky-700 shrink-0">
          <Heart className="w-4 h-4 fill-sky-500" />
        </div>
        <div className="text-xs sm:text-sm">
          <span className="font-bold text-sky-900 mr-1.5">
            {profile.mode === 'partner' ? `💙 คำแนะนำซัพพอร์ตแฟน (${profile.name}):` : 'คำแนะนำการดูแลตัวเองวันนี้:'}
          </span>
          <span className="text-slate-700 leading-relaxed">
            {stats.partnerTip}
          </span>
        </div>
      </div>
    </div>
  );
};
