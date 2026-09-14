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
import { ChevronLeft, ChevronRight, Star, Droplet, Calendar as CalendarIcon } from 'lucide-react';
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

  const weekDayHeaders = [
    { label: 'อาทิตย์', short: 'อา.', isWeekend: true },
    { label: 'จันทร์', short: 'จ.', isWeekend: false },
    { label: 'อังคาร', short: 'อ.', isWeekend: false },
    { label: 'พุธ', short: 'พ.', isWeekend: false },
    { label: 'พฤหัสบดี', short: 'พฤ.', isWeekend: false },
    { label: 'ศุกร์', short: 'ศ.', isWeekend: false },
    { label: 'เสาร์', short: 'ส.', isWeekend: true },
  ];

  return (
    <div className="bg-white rounded-3xl sm:rounded-[2rem] p-5 sm:p-7 border border-slate-200 shadow-sm">
      {/* Calendar Top Header: Title & Navigation (Clean like screenshot) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-600">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 capitalize tracking-tight">
              {format(currentMonth, 'MMMM yyyy')}
            </h3>
            <p className="text-xs text-slate-400 font-medium">
              คลิกเพื่อดูรายละเอียด • ดับเบิ้ลคลิกเพื่อจดบันทึกอาการ
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            onClick={handleToday}
            className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
          >
            วันนี้
          </button>
          <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
            <button
              onClick={handlePrevMonth}
              className="p-2 hover:bg-slate-200 text-slate-600 transition-colors border-r border-slate-200"
              title="เดือนก่อนหน้า"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNextMonth}
              className="p-2 hover:bg-slate-200 text-slate-600 transition-colors"
              title="เดือนถัดไป"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Weekday Column Headers */}
      <div className="grid grid-cols-7 gap-2 mb-2.5 text-center">
        {weekDayHeaders.map((day) => (
          <div
            key={day.label}
            className={`text-xs sm:text-sm font-bold py-1.5 ${
              day.isWeekend ? 'text-rose-500' : 'text-slate-500'
            }`}
          >
            <span className="hidden sm:inline">{day.label}</span>
            <span className="sm:hidden">{day.short}</span>
          </div>
        ))}
      </div>

      {/* Days Grid - Clean, Spacious, Not Cluttered, Crisp Highlights */}
      <div className="grid grid-cols-7 gap-1.5 sm:gap-2.5">
        {calendarDays.map((day) => {
          const dateStr = formatDateSafe(day);
          const isCurrMonth = isSameMonth(day, currentMonth);
          const phaseInfo = phaseMap.get(dateStr);
          const isSelected = selectedDate === dateStr;
          const isTodayDate = isToday(day);
          const loggedData = dailyLogs[dateStr];

          // เช็คประเภทไฮไลท์
          const isPeriod = phaseInfo?.isPeriod;
          const isOvulation = phaseInfo?.isOvulation;
          const isFertile = phaseInfo?.isFertile && !isOvulation;
          const isPMS = phaseInfo?.isPMS;

          // กำหนดสไตล์พื้นหลังตามความสำคัญ (เรียบง่าย สบายตา ไม่ลายตา)
          let cellBg = 'bg-white hover:bg-slate-50/80 border-slate-200/80';
          if (isPeriod) {
            cellBg = 'bg-rose-50/70 hover:bg-rose-100/70 border-rose-200 text-rose-950';
          } else if (isOvulation) {
            cellBg = 'bg-purple-50/70 hover:bg-purple-100/70 border-purple-200 text-purple-950';
          } else if (isPMS) {
            cellBg = 'bg-amber-50/60 hover:bg-amber-100/60 border-amber-200 text-amber-950';
          } else if (isFertile) {
            cellBg = 'bg-emerald-50/50 hover:bg-emerald-100/50 border-emerald-200 text-emerald-950';
          }

          return (
            <div
              key={dateStr}
              onClick={() => onSelectDate(dateStr)}
              onDoubleClick={() => onOpenLogModal(dateStr)}
              className={`min-h-[70px] sm:min-h-[92px] p-2 sm:p-2.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between relative select-none ${cellBg} ${
                isSelected
                  ? 'ring-2 ring-sky-500 shadow-md border-sky-400 scale-[1.02] z-10'
                  : 'hover:scale-[1.01]'
              } ${!isCurrMonth ? 'opacity-25 pointer-events-none' : ''}`}
            >
              {/* Top Row: Date Number and Today indicator */}
              <div className="flex items-center justify-between">
                <span
                  className={`text-sm sm:text-base font-extrabold rounded-xl w-7 h-7 flex items-center justify-center transition-colors ${
                    isTodayDate
                      ? 'bg-slate-900 text-white shadow-sm'
                      : isSelected
                      ? 'text-sky-600'
                      : 'text-slate-800'
                  }`}
                >
                  {format(day, 'd')}
                </span>

                {/* Micro Icon Indicators */}
                <div className="flex items-center gap-1">
                  {isOvulation && (
                    <span className="w-5 h-5 rounded-full bg-purple-100 flex items-center justify-center text-purple-700" title="วันไข่ตก">
                      <Star className="w-3 h-3 fill-purple-600" />
                    </span>
                  )}
                  {isPeriod && (
                    <span className="w-5 h-5 rounded-full bg-rose-100 flex items-center justify-center text-rose-600" title="มีประจำเดือน">
                      <Droplet className="w-3 h-3 fill-rose-600" />
                    </span>
                  )}
                </div>
              </div>

              {/* Middle Row: Clean, Bold, Crisp Highlight Badges (ไฮไลท์ชัดเจน ไม่รกตา) */}
              <div className="my-1">
                {isPeriod && (
                  <span className="inline-block text-[11px] font-extrabold px-2 py-0.5 rounded-lg bg-rose-500 text-white shadow-2xs">
                    เมนมา
                  </span>
                )}
                {isOvulation && (
                  <span className="inline-block text-[11px] font-extrabold px-2 py-0.5 rounded-lg bg-purple-600 text-white shadow-2xs">
                    วันไข่ตก
                  </span>
                )}
                {isFertile && (
                  <span className="inline-block text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-200">
                    โอกาสท้องสูง
                  </span>
                )}
                {isPMS && (
                  <span className="inline-block text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-200">
                    ช่วง PMS
                  </span>
                )}
              </div>

              {/* Bottom Row: Symptom & Note Dots */}
              <div className="flex items-center gap-1">
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

                {loggedData?.notes ? (
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-500" title="มีโน้ตประจำวัน" />
                ) : null}
              </div>
            </div>
          );
        })}
      </div>

      {/* Clean Legend Bar (เหมือนแถบฟิลเตอร์ในรูปตัวอย่าง) */}
      <div className="mt-6 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <span className="text-slate-400 font-bold mr-1">สัญลักษณ์:</span>
          
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 font-bold">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <span>มีประจำเดือน</span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-purple-50 border border-purple-200 text-purple-700 font-bold">
            <Star className="w-3 h-3 fill-purple-600 text-purple-600" />
            <span>วันไข่ตก (โอกาสตั้งครรภ์สูงสุด)</span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span>ช่วงเจริญพันธุ์</span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 font-bold">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span>ช่วงก่อนเมนมา (PMS)</span>
          </div>
        </div>

        <div className="text-[11px] text-slate-400 font-medium">
          * ดับเบิ้ลคลิกเพื่อจดอาการและระดับเลือด
        </div>
      </div>
    </div>
  );
};
