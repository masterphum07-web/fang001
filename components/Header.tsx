'use client';

import React from 'react';
import { Heart, Settings, PlusCircle, Sparkles, UserCheck, HeartHandshake } from 'lucide-react';
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
  const toggleMode = () => {
    const nextMode = profile.mode === 'partner' ? 'self' : 'partner';
    onUpdateProfile({ ...profile, mode: nextMode });
  };

  return (
    <header className="sticky top-0 z-30 bg-white/85 backdrop-blur-md border-b border-sky-100 shadow-sm transition-all">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
        {/* Brand & Logo */}
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-500 via-sky-400 to-blue-500 flex items-center justify-center text-white shadow-md shadow-sky-200">
            <Heart className="w-5 h-5 fill-white animate-pulse" />
          </div>
          <div>
            <h1 className="font-bold text-lg sm:text-xl text-slate-800 tracking-tight flex items-center gap-1.5">
              Bloom & Care
              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-700 font-semibold border border-sky-200 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-sky-500" />
                Medical & Care
              </span>
            </h1>
            <p className="text-xs text-slate-500 hidden sm:block">
              {profile.mode === 'partner' 
                ? `💙 โหมดซัพพอร์ตแฟน • ดูแล ${profile.name || 'แฟนสาว'}`
                : `🌷 โหมดส่วนตัว • บันทึกสุขภาพร่างกาย`}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Mode Switcher */}
          <button
            onClick={toggleMode}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-sm ${
              profile.mode === 'partner'
                ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-sky-200 hover:from-sky-600 hover:to-blue-700'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
            title="สลับโหมดมุมมอง"
          >
            {profile.mode === 'partner' ? (
              <>
                <HeartHandshake className="w-4 h-4 text-sky-100" />
                <span>โหมดซัพพอร์ตแฟน 💙</span>
              </>
            ) : (
              <>
                <UserCheck className="w-4 h-4 text-slate-500" />
                <span>โหมดของฉัน 🌷</span>
              </>
            )}
          </button>

          {/* Quick Log Button */}
          <button
            onClick={onOpenLogModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-medium bg-sky-50 text-sky-700 border border-sky-200 hover:bg-sky-100 transition-colors"
          >
            <PlusCircle className="w-4 h-4 text-sky-600" />
            <span className="hidden sm:inline">จดบันทึก</span>
          </button>

          {/* Settings Button */}
          <button
            onClick={onOpenSettings}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors border border-slate-200"
            title="ตั้งค่ารอบเดือน & ข้อมูล"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
