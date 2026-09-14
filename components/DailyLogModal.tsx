'use client';

import React, { useState, useEffect } from 'react';
import { X, Droplets, Smile, Heart, Check, Trash2 } from 'lucide-react';
import { DailyLog, MoodType, SymptomType, UserProfile } from '@/lib/types/cycle';

interface DailyLogModalProps {
  isOpen: boolean;
  dateStr: string;
  initialLog?: DailyLog;
  profile: UserProfile;
  onClose: () => void;
  onSave: (log: DailyLog) => void;
  onDelete?: (dateStr: string) => void;
}

const SYMPTOMS: { id: SymptomType; label: string; icon: string }[] = [
  { id: 'cramps', label: 'ปวดท้องน้อย', icon: '😣' },
  { id: 'headache', label: 'ปวดหัว', icon: '🤕' },
  { id: 'backache', label: 'ปวดหลัง/เอว', icon: '⚡' },
  { id: 'bloating', label: 'ท้องอืด', icon: '💨' },
  { id: 'breast_pain', label: 'คัดหน้าอก', icon: '🌸' },
  { id: 'acne', label: 'สิวขึ้น', icon: '✨' },
  { id: 'cravings', label: 'อยากของหวาน', icon: '🍫' },
  { id: 'insomnia', label: 'นอนไม่หลับ', icon: '🌙' },
];

const MOODS: { id: MoodType; label: string; emoji: string }[] = [
  { id: 'happy', label: 'สดใส', emoji: '😊' },
  { id: 'calm', label: 'ผ่อนคลาย', emoji: '😌' },
  { id: 'sensitive', label: 'อ่อนไหว/นอยด์', emoji: '🥺' },
  { id: 'irritable', label: 'หงุดหงิด', emoji: '😤' },
  { id: 'tired', label: 'เพลีย/ง่วง', emoji: '😴' },
  { id: 'romantic', label: 'อยากอ้อนแฟน', emoji: '🥰' },
];

export const DailyLogModal: React.FC<DailyLogModalProps> = ({
  isOpen,
  dateStr,
  initialLog,
  profile,
  onClose,
  onSave,
  onDelete,
}) => {
  const [flowLevel, setFlowLevel] = useState<number>(0);
  const [mood, setMood] = useState<MoodType | undefined>(undefined);
  const [symptoms, setSymptoms] = useState<SymptomType[]>([]);
  const [notes, setNotes] = useState<string>('');
  const [partnerNote, setPartnerNote] = useState<string>('');

  useEffect(() => {
    if (initialLog) {
      setFlowLevel(initialLog.flowLevel || 0);
      setMood(initialLog.mood);
      setSymptoms(initialLog.symptoms || []);
      setNotes(initialLog.notes || '');
      setPartnerNote(initialLog.partnerNote || '');
    } else {
      setFlowLevel(0);
      setMood(undefined);
      setSymptoms([]);
      setNotes('');
      setPartnerNote('');
    }
  }, [initialLog, dateStr, isOpen]);

  if (!isOpen) return null;

  const toggleSymptom = (id: SymptomType) => {
    if (symptoms.includes(id)) {
      setSymptoms(symptoms.filter((s) => s !== id));
    } else {
      setSymptoms([...symptoms, id]);
    }
  };

  const handleSave = () => {
    const newLog: DailyLog = {
      id: initialLog?.id || `log-${dateStr}-${Date.now()}`,
      date: dateStr,
      flowLevel,
      mood,
      symptoms,
      notes,
      partnerNote,
    };
    onSave(newLog);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl border border-sky-100 flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-sky-50 to-blue-50 border-b border-sky-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-800 text-lg">บันทึกอาการ & สุขภาพประจำวัน</h3>
            <p className="text-xs text-sky-700 font-medium">วันที่: {dateStr}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-white/80 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body (Scrollable) */}
        <div className="p-6 overflow-y-auto space-y-5 text-sm">
          {/* Flow Level */}
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-2 flex items-center gap-1.5">
              <Droplets className="w-4 h-4 text-rose-500" />
              <span>ปริมาณประจำเดือน (Flow Level):</span>
            </label>
            <div className="flex items-center gap-2">
              {[0, 1, 2, 3, 4, 5].map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setFlowLevel(level)}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${
                    flowLevel === level
                      ? 'bg-rose-500 text-white border-rose-600 shadow-sm scale-105'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {level === 0 ? 'ไม่มี' : `${level}`}
                </button>
              ))}
            </div>
          </div>

          {/* Mood Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-2 flex items-center gap-1.5">
              <Smile className="w-4 h-4 text-sky-500" />
              <span>อารมณ์วันนี้:</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {MOODS.map((m) => {
                const isSelected = mood === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setMood(isSelected ? undefined : m.id)}
                    className={`p-2.5 rounded-xl border text-xs flex items-center gap-2 transition-all ${
                      isSelected
                        ? 'bg-sky-100 text-sky-900 border-sky-300 font-bold shadow-sm'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <span className="text-base">{m.emoji}</span>
                    <span className="truncate">{m.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Symptoms Multi-Select */}
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-2">
              อาการทางร่างกาย (เลือกได้หลายข้อ):
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {SYMPTOMS.map((s) => {
                const isSelected = symptoms.includes(s.id);
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => toggleSymptom(s.id)}
                    className={`p-2 rounded-xl border text-xs flex items-center justify-center gap-1.5 transition-all ${
                      isSelected
                        ? 'bg-amber-100 text-amber-900 border-amber-300 font-bold shadow-sm'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <span>{s.icon}</span>
                    <span className="truncate">{s.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Personal Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1.5">
              โน้ตความรู้สึก / รายละเอียดเพิ่มเติม:
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="เช่น วันนี้สบายตัว อารมณ์แจ่มใส หรือปวดท้องเบาๆ..."
              rows={2}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-sky-300 focus:outline-none"
            />
          </div>

          {/* Partner Care Note */}
          <div className="p-3.5 rounded-2xl bg-sky-50/70 border border-sky-100">
            <label className="block text-xs font-bold text-sky-800 mb-1.5 flex items-center gap-1.5">
              <Heart className="w-3.5 h-3.5 fill-sky-500 text-sky-500" />
              <span>ข้อความจาก {profile.partnerName || 'แฟน'}:</span>
            </label>
            <input
              type="text"
              value={partnerNote}
              onChange={(e) => setPartnerNote(e.target.value)}
              placeholder="เช่น ส่งกำลังใจให้คนเก่งนะ เดี๋ยวซื้อขนมไปฝาก ❤️"
              className="w-full px-3 py-2 rounded-xl bg-white border border-sky-200 text-xs focus:ring-2 focus:ring-sky-300 focus:outline-none"
            />
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          {initialLog && onDelete ? (
            <button
              type="button"
              onClick={() => {
                onDelete(dateStr);
                onClose();
              }}
              className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1 font-medium"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>ลบบันทึก</span>
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-200 rounded-xl transition-colors"
            >
              ยกเลิก
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="flex items-center gap-1.5 px-5 py-2 text-xs font-semibold bg-sky-600 text-white hover:bg-sky-700 rounded-xl shadow-md shadow-sky-200 transition-all active:scale-95"
            >
              <Check className="w-4 h-4" />
              <span>บันทึก</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
