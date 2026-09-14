'use client';

import React, { useState } from 'react';
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfWeek, 
  endOfWeek, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameMonth, 
  isToday 
} from 'date-fns';
import { ChevronLeft, ChevronRight, Star, Droplet } from 'lucide-react';
import { DailyPhaseInfo, DailyLog } from '@/lib/types/cycle';
import { formatDateSafe } from '@/lib/utils/cycle-calculator';

interface CalendarProps {
  phaseMap: Map<string, DailyPhaseInfo>;
  dailyLogs: Record<string, DailyLog>;
  selectedDate: string;
  onSelectDate: (dateStr: string) => void;
  onOpenLogModal: (dateStr: string) => void;
}

export const Calendar: React.FC<CalendarProps> = ({
  phaseMap,
  dailyLogs,
  selectedDate,
  onSelectDate,
  onOpenLogModal,
}) => {
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());

  const handlePrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const handleToday = () => {
    const today = new Date();
    setCurrentMonth(today);
    onSelectDate(formatDateSafe(today));
  };

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 0 }); // Sunday
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 });

  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

  const weekDayHeaders = ['อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.'];

  // สีและสไตล์ของแต่ละ Phase ในโทนที่ดูง่าย สบายตา
  const getDayStyle = (phaseInfo?: DailyPhaseInfo, isCurrentMonth: boolean = true) => {
    if (!phaseInfo || !isCurrentMonth) {
      return 'text-slate-300 bg-slate-50/40 border-transparent';
    }

    if (phaseInfo.isPeriod) {
      return 'bg-rose-50 text-rose-800 border-rose-200 font-semibold hover:bg-rose-100';
    }
    if (phaseInfo.isOvulation) {
      return 'bg-purple-50 text-purple-900 border-purple-300 font-bold hover:bg-purple-100';
    }
    if (phaseInfo.isFertile) {
      return 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100';
    }
    if (phaseInfo.isPMS) {
      return 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100';
    }
    if (phaseInfo.phase === 'follicular') {
      return 'bg-sky-50/80 text-sky-800 border-sky-200 hover:bg-sky-100';
    }
    return 'bg-slate-50/70 text-slate-700 border-slate-100 hover:bg-slate-100';
  };

  return (
    <div className="bg-white rounded-3xl p-4 sm:p-6 border border-sky-100 shadow-sm">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2 sm:gap-3">
          <h3 className="text-lg sm:text-xl font-bold text-slate-800 capitalize tracking-tight">
            {format(currentMonth, 'MMMM yyyy')}
          </h3>
          <button
            onClick={handleToday}
            className="text-xs px-3 py-1 rounded-full bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-200 transition-colors font-medium"
          >
            วันนี้
          </button>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={handlePrevMonth}
            className="p-1.5 rounded-xl border border-slate-200 hover:bg-sky-50 text-slate-600 transition-colors"
            title="เดือนก่อนหน้า"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={handleNextMonth}
            className="p-1.5 rounded-xl border border-slate-200 hover:bg-sky-50 text-slate-600 transition-colors"
            title="เดือนถัดไป"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Weekday Labels */}
      <div className="grid grid-cols-7 gap-1.5 sm:gap-2 mb-2 text-center text-xs font-semibold text-slate-400">
        {weekDayHeaders.map((day, i) => (
          <div key={day} className={i === 0 ? 'text-rose-400' : ''}>
            {day}
          </div>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
        {calendarDays.map((day) => {
          const dateStr = formatDateSafe(day);
          const isCurrMonth = isSameMonth(day, currentMonth);
          const phaseInfo = phaseMap.get(dateStr);
          const isSelected = selectedDate === dateStr;
          const isTodayDate = isToday(day);
          const loggedData = dailyLogs[dateStr];

          return (
            <div
              key={dateStr}
              onClick={() => onSelectDate(dateStr)}
              onDoubleClick={() => onOpenLogModal(dateStr)}
              className={`min-h-[64px] sm:min-h-[82px] p-1.5 sm:p-2 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between relative group ${getDayStyle(
                phaseInfo,
                isCurrMonth
              )} ${
                isSelected
                  ? 'ring-2 ring-sky-500 shadow-md scale-[1.02] z-10 bg-white'
                  : 'hover:scale-[1.01]'
              } ${!isCurrMonth ? 'opacity-30 pointer-events-none' : ''}`}
            >
              {/* Day Number and Badges */}
              <div className="flex items-center justify-between">
                <span
                  className={`text-xs sm:text-sm font-semibold rounded-full w-6 h-6 flex items-center justify-center ${
                    isTodayDate
                      ? 'bg-sky-600 text-white shadow-sm'
                      : 'text-slate-700'
                  }`}
                >
                  {format(day, 'd')}
                </span>

                {/* Status Badges */}
                <div className="flex items-center gap-0.5">
                  {phaseInfo?.isOvulation && (
                    <span title="วันไข่ตก">
                      <Star className="w-3.5 h-3.5 fill-purple-600 text-purple-600 animate-pulse" />
                    </span>
                  )}
                  {phaseInfo?.isPeriod && (
                    <span title="ประจำเดือน">
                      <Droplet className="w-3 h-3 fill-rose-500 text-rose-500" />
                    </span>
                  )}
                </div>
              </div>

              {/* Middle Mini Tags for Desktop */}
              <div className="hidden sm:block text-[10px] leading-tight font-medium truncate">
                {phaseInfo?.isPeriod && 'มีประจำเดือน'}
                {phaseInfo?.isOvulation && '✨ วันไข่ตก'}
                {phaseInfo?.isFertile && !phaseInfo.isOvulation && 'โอกาสท้องสูง'}
                {phaseInfo?.isPMS && 'ช่วง PMS'}
              </div>

              {/* Logged Symptoms & Flow Dots */}
              <div className="flex items-center gap-1 mt-0.5">
                {loggedData?.flowLevel && loggedData.flowLevel > 0 ? (
                  <span className="flex gap-0.5">
                    {Array.from({ length: Math.min(loggedData.flowLevel, 3) }).map((_, idx) => (
                      <span key={idx} className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                    ))}
                  </span>
                ) : null}

                {loggedData?.symptoms && loggedData.symptoms.length > 0 ? (
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" title="มีบันทึกอาการ" />
                ) : null}

                {loggedData?.mood ? (
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-500" title="มีบันทึกอารมณ์" />
                ) : null}
              </div>
            </div>
          );
        })}
      </div>

      {/* Elegant Legend */}
      <div className="mt-6 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
        <div className="flex flex-wrap items-center gap-3 sm:gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-md bg-rose-100 border border-rose-200" />
            <span>มีประจำเดือน</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-md bg-emerald-100 border border-emerald-200" />
            <span>ช่วงเจริญพันธุ์</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-md bg-purple-100 border border-purple-300 flex items-center justify-center">
              <Star className="w-2.5 h-2.5 fill-purple-600 text-purple-600" />
            </span>
            <span>วันไข่ตก</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-md bg-amber-100 border border-amber-200" />
            <span>ช่วงก่อนเมนมา (PMS)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-md bg-sky-100 border border-sky-200" />
            <span>ช่วงสดชื่น (Follicular)</span>
          </div>
        </div>

        <div className="text-[11px] text-slate-400 italic">
          * ดับเบิ้ลคลิกที่วันเพื่อบันทึกอาการ
        </div>
      </div>
    </div>
  );
};
