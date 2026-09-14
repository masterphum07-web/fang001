'use client';

import React, { useState } from 'react';
import { X, Check, Sliders, MessageCircle, Database, Sparkles, BrainCircuit, Calendar, SlidersHorizontal } from 'lucide-react';
import { UserProfile, CycleLog } from '@/lib/types/cycle';
import { analyzePersonalBehavior } from '@/lib/utils/cycle-calculator';

interface CycleSettingsModalProps {
  isOpen: boolean;
  profile: UserProfile;
  cycleLogs?: CycleLog[];
  onClose: () => void;
  onSave: (updated: UserProfile) => void;
  onOpenPeriodRangeModal?: () => void;
}

export const CycleSettingsModal: React.FC<CycleSettingsModalProps> = ({
  isOpen,
  profile,
  cycleLogs = [],
  onClose,
  onSave,
  onOpenPeriodRangeModal,
}) => {
  const [activeTab, setActiveTab] = useState<'behavior' | 'line' | 'supabase'>('behavior');
  const [name, setName] = useState(profile.name);
  const [partnerName, setPartnerName] = useState(profile.partnerName);
  const [lastPeriodStartDate, setLastPeriodStartDate] = useState(profile.lastPeriodStartDate);
  const [lineUserId, setLineUserId] = useState(profile.lineUserId || '');
  const [showManualOverride, setShowManualOverride] = useState(false);
  const [manualCycleLength, setManualCycleLength] = useState(profile.averageCycleLength);
  const [manualPeriodLength, setManualPeriodLength] = useState(profile.averagePeriodLength);

  // วิเคราะห์พฤติกรรมจริงจากประวัติ
  const behavior = analyzePersonalBehavior(cycleLogs, profile.averageCycleLength, profile.averagePeriodLength);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave({
      ...profile,
      name,
      partnerName,
      lastPeriodStartDate,
      // ถ้าเปิด Manual Override ให้ใช้ค่าที่ตั้งเอง ถ้าไม่เปิดให้ใช้ค่าที่คำนวณจากพฤติกรรม
      averageCycleLength: showManualOverride ? Number(manualCycleLength) : behavior.avgCycleLength,
      averagePeriodLength: showManualOverride ? Number(manualPeriodLength) : behavior.avgPeriodLength,
      lineUserId,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in font-['Kanit',sans-serif]">
      <div className="bg-white rounded-3xl sm:rounded-[2rem] w-full max-w-lg overflow-hidden shadow-2xl border border-slate-200 flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-sky-50 to-blue-50 border-b border-sky-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-sky-500 text-white flex items-center justify-center">
              <BrainCircuit className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base sm:text-lg">
                ตั้งค่าข้อมูล & วิเคราะห์สรีระ
              </h3>
              <p className="text-xs text-sky-700 font-medium">
                ระบบเรียนรู้พฤติกรรมอัตโนมัติ ไม่ล็อคค่าตายตัว
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

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-100 px-6 pt-2 bg-slate-50/50">
          <button
            onClick={() => setActiveTab('behavior')}
            className={`pb-3 px-3 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'behavior'
                ? 'border-sky-500 text-sky-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-sky-500" />
            <span>พฤติกรรมรอบเดือน & ชื่อ</span>
          </button>
          <button
            onClick={() => setActiveTab('line')}
            className={`pb-3 px-3 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'line'
                ? 'border-sky-500 text-sky-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>LINE OA</span>
          </button>
          <button
            onClick={() => setActiveTab('supabase')}
            className={`pb-3 px-3 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'supabase'
                ? 'border-sky-500 text-sky-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Supabase DB</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs sm:text-sm">
          {activeTab === 'behavior' && (
            <div className="space-y-4">
              {/* Names */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    ชื่อแฟนสาว:
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-sky-300 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    ชื่อแฟนหนุ่ม:
                  </label>
                  <input
                    type="text"
                    value={partnerName}
                    onChange={(e) => setPartnerName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-sky-300 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  วันแรกของประจำเดือนรอบล่าสุด:
                </label>
                <input
                  type="date"
                  value={lastPeriodStartDate}
                  onChange={(e) => setLastPeriodStartDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-sky-300 focus:outline-none"
                />
              </div>

              {/* 🧠 Smart Behavioral Learning Box (แทนที่ Slider ตายตัว) */}
              <div className="bg-gradient-to-br from-sky-50/90 via-blue-50/50 to-white p-4 sm:p-5 rounded-2xl border border-sky-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 font-black text-sky-900 text-xs sm:text-sm">
                    <Sparkles className="w-4 h-4 text-sky-500" />
                    วิเคราะห์พฤติกรรมร่างกายอัตโนมัติ
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-sky-500 text-white text-[10px] font-bold">
                    Smart Learning Active ✨
                  </span>
                </div>

                <p className="text-slate-600 text-xs leading-relaxed font-medium">
                  {behavior.insightNote}
                </p>

                {/* Behavioral Stats Cards */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div className="p-3 bg-white rounded-xl border border-sky-100 shadow-2xs">
                    <span className="text-[11px] text-slate-400 font-semibold block">
                      รอบเดือนตามสรีระจริง:
                    </span>
                    <span className="text-base font-black text-sky-700">
                      {behavior.avgCycleLength} วัน
                    </span>
                    <span className="text-[10px] text-slate-500 block font-medium">
                      (แกว่งตัว {behavior.minCycleLength} - {behavior.maxCycleLength} วัน)
                    </span>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-sky-100 shadow-2xs">
                    <span className="text-[11px] text-slate-400 font-semibold block">
                      ระยะเลือดออกตามจริง:
                    </span>
                    <span className="text-base font-black text-rose-600">
                      {behavior.avgPeriodLength} วัน
                    </span>
                    <span className="text-[10px] text-slate-500 block font-medium">
                      (เคยเป็น {behavior.minPeriodLength} - {behavior.maxPeriodLength} วัน)
                    </span>
                  </div>
                </div>

                {/* Link to view & edit cycle logs */}
                {onOpenPeriodRangeModal && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenPeriodRangeModal();
                    }}
                    className="w-full py-2 px-3 rounded-xl bg-white hover:bg-sky-50/50 border border-sky-200 text-sky-700 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                    <span>จัดการวันเริ่ม-วันหมดของแต่ละเดือน ({cycleLogs.length} รอบที่บันทึก)</span>
                  </button>
                )}
              </div>

              {/* Optional Manual Baseline Override Toggle */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setShowManualOverride(!showManualOverride)}
                  className="text-xs text-slate-400 hover:text-slate-600 font-medium underline flex items-center gap-1"
                >
                  <Sliders className="w-3 h-3" />
                  <span>{showManualOverride ? 'ซ่อนการตั้งค่าตัวเลขตั้งต้น' : 'ต้องการกำหนดค่าตั้งต้นด้วยตัวเอง? (ตัวเลือกเสริม)'}</span>
                </button>

                {showManualOverride && (
                  <div className="mt-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 animate-fade-in">
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-xs font-bold text-slate-600">
                          ความยาวรอบเดือนเริ่มต้น (วัน):
                        </label>
                        <span className="text-xs font-bold text-sky-700 bg-white px-2 py-0.5 rounded border border-slate-200">
                          {manualCycleLength} วัน
                        </span>
                      </div>
                      <input
                        type="range"
                        min="21"
                        max="40"
                        value={manualCycleLength}
                        onChange={(e) => setManualCycleLength(Number(e.target.value))}
                        className="w-full accent-sky-500 cursor-pointer"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-xs font-bold text-slate-600">
                          จำนวนวันมีประจำเดือนเริ่มต้น (วัน):
                        </label>
                        <span className="text-xs font-bold text-rose-600 bg-white px-2 py-0.5 rounded border border-slate-200">
                          {manualPeriodLength} วัน
                        </span>
                      </div>
                      <input
                        type="range"
                        min="3"
                        max="8"
                        value={manualPeriodLength}
                        onChange={(e) => setManualPeriodLength(Number(e.target.value))}
                        className="w-full accent-sky-500 cursor-pointer"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'line' && (
            <div className="space-y-3">
              <div className="p-3.5 rounded-2xl bg-sky-50 border border-sky-200 text-sky-900 text-xs font-medium">
                <span className="font-bold block mb-1">💬 การเชื่อมต่อกับ LINE OA</span>
                ระบบรองรับการแจ้งเตือนอัตโนมัติ และการพิมพ์สั่งงานผ่านแชท เช่น พิมพ์ "เมนมา", "เมนหาย", "เช็คสถานะ"
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  LINE User ID ของแฟน:
                </label>
                <input
                  type="text"
                  value={lineUserId}
                  onChange={(e) => setLineUserId(e.target.value)}
                  placeholder="U1234567890abcdef..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono focus:ring-2 focus:ring-sky-300 focus:outline-none"
                />
              </div>

              <div className="text-xs space-y-1.5 text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200 font-medium">
                <p className="font-bold text-slate-800">📌 บันทึก LINE Token เรียบร้อยแล้ว</p>
                <p>Token ของคุณถูกบันทึกไว้ในระบบพร้อมส่งการแจ้งเตือนผ่าน API อัตโนมัติแล้วครับ</p>
              </div>
            </div>
          )}

          {activeTab === 'supabase' && (
            <div className="space-y-3">
              <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-200 text-blue-800 text-xs font-medium">
                <span className="font-bold block mb-1">🗄️ ฐานข้อมูล Supabase (PostgreSQL)</span>
                ตอนนี้เว็บใช้งานระบบ Local Storage ในเครื่องทันที หากต้องการบันทึกขึ้น Cloud สามารถนำ Schema ไปรันใน Supabase ได้
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors"
          >
            ปิด
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 rounded-xl shadow-sm transition-all active:scale-95"
          >
            <Check className="w-4 h-4" />
            <span>บันทึกการตั้งค่า</span>
          </button>
        </div>
      </div>
    </div>
  );
};
