'use client';

import React, { useState } from 'react';
import { X, Check, Trash2, Calendar, Plus, Droplets, Sparkles } from 'lucide-react';
import { CycleLog } from '@/lib/types/cycle';
import { differenceInCalendarDays, parseISO, format } from 'date-fns';

interface PeriodRangeModalProps {
  isOpen: boolean;
  cycleLogs: CycleLog[];
  onClose: () => void;
  onSaveCycle: (cycle: CycleLog) => void;
  onDeleteCycle: (cycleId: string) => void;
}

export const PeriodRangeModal: React.FC<PeriodRangeModalProps> = ({
  isOpen,
  cycleLogs,
  onClose,
  onSaveCycle,
  onDeleteCycle,
}) => {
  const [startDate, setStartDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState('');
  const [isStillBleeding, setIsStillBleeding] = useState(false);
  const [notes, setNotes] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleStartEdit = (cycle: CycleLog) => {
    setEditingId(cycle.id);
    setStartDate(cycle.startDate);
    setEndDate(cycle.endDate || '');
    setIsStillBleeding(!cycle.endDate);
    setNotes(cycle.notes || '');
  };

  const handleResetForm = () => {
    setEditingId(null);
    setStartDate(format(new Date(), 'yyyy-MM-dd'));
    setEndDate('');
    setIsStillBleeding(false);
    setNotes('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate) return;

    let periodLength: number | undefined = undefined;
    if (endDate && !isStillBleeding) {
      periodLength = differenceInCalendarDays(parseISO(endDate), parseISO(startDate)) + 1;
    }

    const newLog: CycleLog = {
      id: editingId || `cycle-${Date.now()}`,
      startDate,
      endDate: isStillBleeding ? undefined : endDate || undefined,
      periodLength,
      notes: notes || undefined,
    };

    onSaveCycle(newLog);
    handleResetForm();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in font-['Kanit',sans-serif]">
      <div className="bg-white rounded-3xl sm:rounded-[2rem] w-full max-w-xl overflow-hidden shadow-2xl border border-slate-200 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-rose-50 to-pink-50 border-b border-rose-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-rose-500 text-white flex items-center justify-center">
              <Droplets className="w-4 h-4 fill-white" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base sm:text-lg">
                บันทึกรอบเดือน (วันเริ่ม - วันที่หาย)
              </h3>
              <p className="text-xs text-rose-700 font-medium">
                ไม่ล็อควัน! ปรับเปลี่ยนได้ตามจริงในแต่ละเดือน
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-white/80 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm">
          {/* Form to Add or Edit */}
          <form onSubmit={handleSubmit} className="bg-slate-50/80 p-4 sm:p-5 rounded-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-slate-800 text-sm">
                {editingId ? '✏️ แก้ไขรอบเดือน' : '+ บันทึกรอบเดือนใหม่'}
              </span>
              {editingId && (
                <button
                  type="button"
                  onClick={handleResetForm}
                  className="text-xs text-slate-400 hover:text-slate-600 underline font-medium"
                >
                  ยกเลิกการแก้ไข
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  🩸 วันแรกที่เมนมา (Start Date):
                </label>
                <input
                  type="date"
                  required
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-rose-300 focus:outline-none bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ✨ วันที่เมนหาย/วันหมด (End Date):
                </label>
                <input
                  type="date"
                  disabled={isStillBleeding}
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className={`w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-rose-300 focus:outline-none bg-white ${
                    isStillBleeding ? 'opacity-40 cursor-not-allowed' : ''
                  }`}
                />
              </div>
            </div>

            {/* Checkbox: ยังไม่หมด */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-600">
                <input
                  type="checkbox"
                  checked={isStillBleeding}
                  onChange={(e) => {
                    setIsStillBleeding(e.target.checked);
                    if (e.target.checked) setEndDate('');
                  }}
                  className="w-4 h-4 rounded text-rose-600 focus:ring-rose-300 accent-rose-500"
                />
                <span>ยังไม่หมด (กำลังมีประจำเดือนอยู่)</span>
              </label>

              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs transition-all flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                <span>{editingId ? 'บันทึกการแก้ไข' : 'เพิ่มรอบเดือนนี้'}</span>
              </button>
            </div>
          </form>

          {/* History List */}
          <div>
            <h4 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider mb-2.5">
              ประวัติรอบเดือนที่บันทึกไว้ ({cycleLogs.length} รอบ)
            </h4>

            {cycleLogs.length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-400">
                ยังไม่มีประวัติรอบเดือน บันทึกรอบแรกด้านบนได้เลยครับ
              </div>
            ) : (
              <div className="space-y-2">
                {cycleLogs.map((cycle) => {
                  let daysCount = 'กำลังมีอยู่';
                  if (cycle.startDate && cycle.endDate) {
                    const d = differenceInCalendarDays(parseISO(cycle.endDate), parseISO(cycle.startDate)) + 1;
                    daysCount = `${d} วัน`;
                  }

                  return (
                    <div
                      key={cycle.id}
                      className="p-3.5 rounded-2xl bg-white border border-slate-200 flex items-center justify-between gap-3 shadow-2xs hover:border-slate-300 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center font-black text-xs shrink-0">
                          🩸
                        </div>
                        <div>
                          <div className="text-xs sm:text-sm font-extrabold text-slate-800">
                            {cycle.startDate} ถึง {cycle.endDate || 'ปัจจุบัน (ยังไม่หมด)'}
                          </div>
                          <span className="text-[11px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-100">
                            ระยะเวลา: {daysCount}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleStartEdit(cycle)}
                          className="px-2.5 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                          แก้ไข
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteCycle(cycle.id)}
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="ลบรอบนี้"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 rounded-xl transition-all"
          >
            เสร็จสิ้น
          </button>
        </div>
      </div>
    </div>
  );
};
