'use client';

import React from 'react';
import { format, parseISO } from 'date-fns';
import { 
  Heart, 
  Sparkles, 
  Activity, 
  Edit3, 
  Droplets, 
  Smile, 
  Calendar as CalendarIcon,
  ShieldCheck
} from 'lucide-react';
import { DailyPhaseInfo, DailyLog, UserProfile } from '@/lib/types/cycle';

interface DayDetailCardProps {
  dateStr: string;
  phaseInfo?: DailyPhaseInfo;
  log?: DailyLog;
  profile: UserProfile;
  onOpenLogModal: (dateStr: string) => void;
}

const SYMPTOM_LABELS: Record<string, string> = {
  cramps: 'ปวดท้องน้อย',
  headache: 'ปวดศีรษะ',
  backache: 'ปวดหลัง/เอว',
  bloating: 'ท้องอืด',
  breast_pain: 'คัดตึงเต้านม',
  acne: 'สิวขึ้น',
  cravings: 'อยากของหวาน',
  insomnia: 'นอนไม่หลับ',
};

const MOOD_LABELS: Record<string, { label: string; emoji: string }> = {
  happy: { label: 'มีความสุข สดใส', emoji: '😊' },
  calm: { label: 'ผ่อนคลาย สบายใจ', emoji: '😌' },
  sensitive: { label: 'อ่อนไหวง่าย ขี้น้อยใจ', emoji: '🥺' },
  irritable: { label: 'หงุดหงิดง่าย', emoji: '😤' },
  anxious: { label: 'กังวล / เครียด', emoji: '😰' },
  tired: { label: 'อ่อนเพลีย เหนื่อยล้า', emoji: '😴' },
  romantic: { label: 'อยากอ้อน อยากกอด', emoji: '🥰' },
};

export const DayDetailCard: React.FC<DayDetailCardProps> = ({
  dateStr,
  phaseInfo,
  log,
  profile,
  onOpenLogModal,
}) => {
  if (!phaseInfo) return null;

  const parsedDate = parseISO(dateStr);
  const formattedDateThai = format(parsedDate, 'd MMMM yyyy');

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 border border-sky-100 shadow-sm flex flex-col justify-between space-y-4">
      <div>
        {/* Top bar: Date & Edit Button */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
          <div className="flex items-center gap-2 text-slate-800">
            <CalendarIcon className="w-5 h-5 text-sky-500" />
            <span className="font-bold text-base sm:text-lg">{formattedDateThai}</span>
          </div>

          <button
            onClick={() => onOpenLogModal(dateStr)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-sky-50 text-sky-700 hover:bg-sky-100 transition-colors border border-sky-200"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>{log ? 'แก้ไขบันทึก' : '+ บันทึกอาการ'}</span>
          </button>
        </div>

        {/* Phase Header Badge */}
        <div className="flex items-center gap-2 mb-3">
          <span className={`text-xs px-3 py-1 rounded-full font-bold border ${phaseInfo.phaseColor}`}>
            {phaseInfo.phaseLabel}
          </span>
          <span className="text-xs text-slate-400 font-medium">
            (วันที่ {phaseInfo.dayOfCycle} ของรอบเดือน)
          </span>
        </div>

        {/* Medical & Body Overview */}
        <div className="space-y-3 text-xs sm:text-sm">
          <div className="p-3.5 rounded-2xl bg-sky-50/40 border border-sky-100">
            <div className="flex items-center gap-1.5 font-bold text-slate-700 mb-1">
              <Activity className="w-4 h-4 text-sky-500" />
              <span>ระดับฮอร์โมน & การเปลี่ยนแปลง:</span>
            </div>
            <p className="text-slate-600 leading-relaxed text-xs sm:text-sm">
              {phaseInfo.hormoneSummary}
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50/60 border border-slate-100">
            <div className="flex items-center gap-1.5 font-bold text-slate-700 mb-1">
              <Sparkles className="w-4 h-4 text-purple-500" />
              <span>สภาพร่างกาย & โอกาสตั้งครรภ์:</span>
            </div>
            <p className="text-slate-600 leading-relaxed text-xs sm:text-sm">
              {phaseInfo.bodyFeel}
            </p>
            <div className="mt-2 text-xs font-semibold text-slate-600 flex items-center gap-2">
              <span>โอกาสตั้งครรภ์:</span>
              <span className={`px-2 py-0.5 rounded-md font-bold ${
                phaseInfo.pregnancyChance === 'สูงสุด' ? 'bg-purple-100 text-purple-800' :
                phaseInfo.pregnancyChance === 'สูง' ? 'bg-emerald-100 text-emerald-800' :
                'bg-slate-200 text-slate-700'
              }`}>
                {phaseInfo.pregnancyChance}
              </span>
            </div>
          </div>
        </div>

        {/* Logged Daily Data (if any) */}
        {log && (
          <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              บันทึกประจำวันนี้
            </h4>

            {log.flowLevel > 0 && (
              <div className="flex items-center gap-2 text-xs text-rose-700 font-medium">
                <Droplets className="w-4 h-4 text-rose-500" />
                <span>ปริมาณประจำเดือน: ระดับ {log.flowLevel} / 5</span>
              </div>
            )}

            {log.mood && (
              <div className="flex items-center gap-2 text-xs text-slate-700">
                <Smile className="w-4 h-4 text-sky-500" />
                <span>อารมณ์: {MOOD_LABELS[log.mood]?.emoji} {MOOD_LABELS[log.mood]?.label}</span>
              </div>
            )}

            {log.symptoms.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {log.symptoms.map((s) => (
                  <span key={s} className="px-2 py-0.5 text-[11px] rounded-lg bg-amber-50 text-amber-800 border border-amber-200 font-medium">
                    {SYMPTOM_LABELS[s] || s}
                  </span>
                ))}
              </div>
            )}

            {log.notes && (
              <p className="text-xs text-slate-600 italic bg-sky-50/30 p-2.5 rounded-xl border border-sky-100">
                "{log.notes}"
              </p>
            )}

            {log.partnerNote && (
              <div className="text-xs text-sky-900 bg-sky-50 p-2.5 rounded-xl border border-sky-200 flex items-start gap-1.5 font-medium">
                <Heart className="w-3.5 h-3.5 fill-sky-500 text-sky-500 shrink-0 mt-0.5" />
                <span>{profile.partnerName}: {log.partnerNote}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Partner Care Action Box */}
      <div className="mt-4 p-3.5 rounded-2xl bg-gradient-to-r from-sky-50 to-blue-50 border border-sky-100">
        <div className="flex items-center gap-1.5 text-xs font-bold text-sky-800 mb-1">
          <Heart className="w-4 h-4 fill-sky-500 text-sky-500" />
          <span>{profile.mode === 'partner' ? 'ข้อแนะนำแฟนวันนี้:' : 'ดูแลตัวเองในวันนี้:'}</span>
        </div>
        <p className="text-xs text-slate-700 leading-relaxed">
          {phaseInfo.careTipForPartner}
        </p>
      </div>
    </div>
  );
};
