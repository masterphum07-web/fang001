'use client';

import React, { useState } from 'react';
import { X, Check, Sliders, MessageCircle, Database } from 'lucide-react';
import { UserProfile } from '@/lib/types/cycle';

interface CycleSettingsModalProps {
  isOpen: boolean;
  profile: UserProfile;
  onClose: () => void;
  onSave: (updated: UserProfile) => void;
}

export const CycleSettingsModal: React.FC<CycleSettingsModalProps> = ({
  isOpen,
  profile,
  onClose,
  onSave,
}) => {
  const [activeTab, setActiveTab] = useState<'cycle' | 'line' | 'supabase'>('cycle');
  const [name, setName] = useState(profile.name);
  const [partnerName, setPartnerName] = useState(profile.partnerName);
  const [lastPeriodStartDate, setLastPeriodStartDate] = useState(profile.lastPeriodStartDate);
  const [averageCycleLength, setAverageCycleLength] = useState(profile.averageCycleLength);
  const [averagePeriodLength, setAveragePeriodLength] = useState(profile.averagePeriodLength);
  const [lineUserId, setLineUserId] = useState(profile.lineUserId || '');

  if (!isOpen) return null;

  const handleSave = () => {
    onSave({
      ...profile,
      name,
      partnerName,
      lastPeriodStartDate,
      averageCycleLength: Number(averageCycleLength),
      averagePeriodLength: Number(averagePeriodLength),
      lineUserId,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl border border-sky-100 flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-sky-50 to-blue-50 border-b border-sky-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-sky-600" />
            <h3 className="font-bold text-slate-800 text-lg">ตั้งค่ารอบเดือน & ระบบเชื่อมต่อ</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-white/80 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-100 px-6 pt-2 bg-slate-50/50">
          <button
            onClick={() => setActiveTab('cycle')}
            className={`pb-3 px-3 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'cycle'
                ? 'border-sky-500 text-sky-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <span>รอบเดือน & ชื่อ</span>
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
          {activeTab === 'cycle' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">
                    ชื่อแฟนสาว:
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-sky-300 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">
                    ชื่อแฟนหนุ่ม:
                  </label>
                  <input
                    type="text"
                    value={partnerName}
                    onChange={(e) => setPartnerName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-sky-300 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">
                  วันแรกของประจำเดือนรอบล่าสุด:
                </label>
                <input
                  type="date"
                  value={lastPeriodStartDate}
                  onChange={(e) => setLastPeriodStartDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-sky-300 focus:outline-none"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-bold text-slate-600">
                    ความยาวรอบเดือนเฉลี่ย (Cycle Length):
                  </label>
                  <span className="text-xs font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-lg border border-sky-200">
                    {averageCycleLength} วัน
                  </span>
                </div>
                <input
                  type="range"
                  min="21"
                  max="40"
                  value={averageCycleLength}
                  onChange={(e) => setAverageCycleLength(Number(e.target.value))}
                  className="w-full accent-sky-500 cursor-pointer"
                />
                <p className="text-[11px] text-slate-400 mt-0.5">
                  * โดยทั่วไปผู้หญิงจะมีรอบเดือนเฉลี่ย 28 วัน (ปกติ 21-35 วัน)
                </p>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-bold text-slate-600">
                    จำนวนวันมีประจำเดือนเฉลี่ย (Period Length):
                  </label>
                  <span className="text-xs font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-lg border border-sky-200">
                    {averagePeriodLength} วัน
                  </span>
                </div>
                <input
                  type="range"
                  min="3"
                  max="8"
                  value={averagePeriodLength}
                  onChange={(e) => setAveragePeriodLength(Number(e.target.value))}
                  className="w-full accent-sky-500 cursor-pointer"
                />
                <p className="text-[11px] text-slate-400 mt-0.5">
                  * โดยทั่วไปมีเลือดออกเฉลี่ย 3-7 วัน (เฉลี่ย 5 วัน)
                </p>
              </div>
            </div>
          )}

          {activeTab === 'line' && (
            <div className="space-y-3">
              <div className="p-3.5 rounded-2xl bg-sky-50 border border-sky-200 text-sky-900 text-xs">
                <span className="font-bold block mb-1">💬 การเชื่อมต่อกับ LINE OA</span>
                ระบบรองรับการแจ้งเตือนอัตโนมัติ และการพิมพ์สั่งงานผ่านแชท เช่น พิมพ์ "เมนมา", "เมนหาย", "เช็คสถานะ"
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">
                  LINE User ID ของแฟน:
                </label>
                <input
                  type="text"
                  value={lineUserId}
                  onChange={(e) => setLineUserId(e.target.value)}
                  placeholder="U1234567890abcdef..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono focus:ring-2 focus:ring-sky-300 focus:outline-none"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  นำมาจาก LINE Developers Console หรือดึงจาก Webhook เมื่อแฟนทักบอท
                </p>
              </div>

              <div className="text-xs space-y-1.5 text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <p className="font-semibold text-slate-700">📌 ขั้นตอนเปิดใช้งาน LINE Webhook:</p>
                <p>1. ไปที่ <a href="https://developers.line.biz" target="_blank" rel="noreferrer" className="text-sky-600 underline">LINE Developers Console</a></p>
                <p>2. ใน Messaging API ให้กรอก Webhook URL เป็น: <code className="bg-slate-200 px-1 py-0.5 rounded text-[11px]">https://your-domain.com/api/webhook/line</code></p>
                <p>3. ใส่ Token ในไฟล์ <code className="bg-slate-200 px-1 py-0.5 rounded text-[11px]">.env</code></p>
              </div>
            </div>
          )}

          {activeTab === 'supabase' && (
            <div className="space-y-3">
              <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-200 text-blue-800 text-xs">
                <span className="font-bold block mb-1">🗄️ ฐานข้อมูล Supabase (PostgreSQL)</span>
                ตอนนี้เว็บใช้งานระบบ Local Storage ในเครื่องทันที หากต้องการบันทึกขึ้น Cloud สามารถนำ Schema ไปรันใน Supabase ได้
              </div>

              <div className="text-xs space-y-1.5 text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <p className="font-semibold text-slate-700">📌 ไฟล์ SQL Schema:</p>
                <p>เตรียมไว้ให้แล้วที่ <code className="bg-slate-200 px-1 py-0.5 rounded text-[11px]">supabase/schema.sql</code></p>
                <p>เปิด Supabase SQL Editor แล้วคัดลอกไปวางรันเพื่อสร้างตารางและตั้งค่า Row Level Security (RLS) ได้ทันทีครับ</p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-200 rounded-xl transition-colors"
          >
            ปิด
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex items-center gap-1.5 px-5 py-2 text-xs font-semibold bg-sky-600 text-white hover:bg-sky-700 rounded-xl shadow-md shadow-sky-200 transition-all active:scale-95"
          >
            <Check className="w-4 h-4" />
            <span>บันทึกการตั้งค่า</span>
          </button>
        </div>
      </div>
    </div>
  );
};
