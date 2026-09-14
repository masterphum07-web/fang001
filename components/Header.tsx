'use client';

import React from 'react';
import { Heart, Settings, PlusCircle, User, HeartHandshake } from 'lucide-react';
import { UserProfile } from '@/lib/types/cycle';

interface HeaderProps {
  profile: UserProfile;
  onUpdateProfile: (updated: UserProfile) => void;
  onOpenSettings: () => void;
  onOpenLogModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  profile,
  onUpdateProfile,
  onOpenSettings,
  onOpenLogModal,
}) => {
  const toggleMode = (mode: 'partner' | 'self') => {
    onUpdateProfile({ ...profile, mode });
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
        {/* Left: Brand Logo & Title (Inspired by screenshot) */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-500 to-blue-600 flex items-center justify-center text-white shadow-sm">
            <Heart className="w-5 h-5 fill-white" />
          </div>
          <div>
            <h1 className="font-extrabold text-xl sm:text-2xl text-slate-900 tracking-tight leading-tight">
              Bloom & Care
            </h1>
            <p className="text-[11px] text-slate-500 hidden sm:block font-medium">
              ระบบติดตามรอบเดือนและคู่มือดูแลคนพิเศษ
            </p>
          </div>
        </div>

        {/* Center: Segmented Tabs (Like screenshot pill tabs) */}
        <div className="flex items-center bg-slate-100/90 p-1 rounded-2xl border border-slate-200/60 shadow-inner">
          <button
            onClick={() => toggleMode('partner')}
            className={`px-3.5 sm:px-4 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              profile.mode === 'partner'
                ? 'bg-white text-sky-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            โหมดซัพพอร์ตแฟน 💙
          </button>
          <button
            onClick={() => toggleMode('self')}
            className={`px-3.5 sm:px-4 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              profile.mode === 'self'
                ? 'bg-white text-rose-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            โหมดของฉัน 🌷
          </button>
        </div>

        {/* Right: User Pill & Action Button (Inspired by screenshot right side) */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200/80 text-xs font-semibold text-slate-700">
            <User className="w-3.5 h-3.5 text-slate-500" />
            <span>{profile.name} & {profile.partnerName}</span>
          </div>

          <button
            onClick={onOpenLogModal}
            className="flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-slate-900 text-white hover:bg-slate-800 transition-all shadow-sm active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ จดบันทึก</span>
          </button>

          <button
            onClick={onOpenSettings}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors border border-slate-200"
            title="ตั้งค่ารอบเดือน & LINE OA"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
