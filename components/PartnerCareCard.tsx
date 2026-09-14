'use client';

import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { 
  Heart, 
  Sparkles, 
  CheckCircle2, 
  XCircle, 
  Gift, 
  CheckSquare, 
  Square, 
  MessageCircleHeart, 
  Copy,
  Check
} from 'lucide-react';
import { DailyPhaseInfo, UserProfile } from '@/lib/types/cycle';

interface PartnerCareCardProps {
  phaseInfo?: DailyPhaseInfo;
  profile: UserProfile;
}

export const PartnerCareCard: React.FC<PartnerCareCardProps> = ({
  phaseInfo,
  profile,
}) => {
  const [completedTasks, setCompletedTasks] = useState<number[]>([]);
  const [copiedText, setCopiedText] = useState(false);
  const [currentAffirmationIndex, setCurrentAffirmationIndex] = useState(0);

  if (!phaseInfo) return null;

  const affirmations = [
    `"วันนี้คนเก่งเป็นยังไงบ้าง เหนื่อยมั้ยคะ เดี๋ยวเค้าดูแลเองนะ ❤️"`,
    `"ถ้าปวดท้องหรือเพลีย บอกเค้าได้ตลอดเลยนะ พร้อมเป็นกำลังใจให้เสมอ 🧸"`,
    `"แฟนเค้าน่ารักที่สุดในโลก ขอบคุณที่อยู่เคียงข้างกันนะคะ ✨"`,
    `"อยากกินอะไรเป็นพิเศษมั้ยคนดี เดี๋ยวเค้าสั่ง/ทำให้ทานนะ 🍰"`,
    `"ไม่ว่าวันนี้จะเจอเรื่องอะไรมา เค้าอยู่ข้างๆ แฟนเสมอนะ กอดๆ น้า 🫂"`
  ];

  const handleNextAffirmation = () => {
    setCurrentAffirmationIndex((prev) => (prev + 1) % affirmations.length);
    setCopiedText(false);
  };

  const handleCopyAffirmation = () => {
    navigator.clipboard.writeText(affirmations[currentAffirmationIndex]);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  const handleSendVirtualHug = () => {
    confetti({
      particleCount: 50,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#0EA5E9', '#38BDF8', '#F43F5E', '#EC4899']
    });
  };

  const getPhaseCareGuide = (phase: string) => {
    switch (phase) {
      case 'menstrual':
        return {
          title: 'ระยะมีประจำเดือน: โหมดดูแลพิเศษ & เอาใจใส่สูงสุด 🩸',
          tasks: [
            'เตรียมถุงน้ำร้อน หรือกระเป๋าน้ำอุ่นให้เธอ',
            'ชงเครื่องดื่มอุ่นๆ เช่น ชาคาโมมายล์ หรือน้ำขิง',
            'ช่วยทำงานบ้าน นวดหลังหรือบ่าให้ผ่อนคลาย',
            'เตรียมผ้าอนามัยสำรองไว้ใกล้ตัว',
          ],
          dos: [
            'รับฟังและกอดปลอบเวลาเธอปวดท้อง',
            'ตามใจเรื่องของกิน ชวนกินของอุ่นๆ ย่อยง่าย',
            'ให้เธอนอนพักเต็มอิ่ม ไม่เร่งรีบ',
          ],
          donts: [
            'อย่าปล่อยให้หิวนาน (ความหิว + ปวดท้อง = พายุ)',
            'อย่าชวนทะเลาะหรือพูดจาประชดประชัน',
            'อย่าพูดว่า "แค่นี้เอง ทนหน่อยสิ" (มดลูกบีบตัวทรมานจริง)',
          ],
          giftSuggestion: 'ช็อกโกแลตเข้มข้น, บัวลอยน้ำขิง, โกโก้อุ่นๆ',
        };
      case 'pms':
        return {
          title: 'ระยะ PMS: โหมดใจเย็นขั้นสุด & ระวังคลื่นลม 🧸',
          tasks: [
            'ชมเธอว่าน่ารัก ชื่นชมความเก่งของเธอเสมอ',
            'เตรียมขนมหรือของว่างคลายความหิวไว้ใกล้ตัว',
            'ชวนดูหนัง/ซีรีส์ตลก ผ่อนคลายสมอง',
            'รับฟังด้วยความเข้าใจ ไม่รีบเถียงหรือขัด',
          ],
          dos: [
            'ใจเย็น มีสติ และตอบแชทด้วยถ้อยคำอ่อนโยน',
            'กอดแน่นๆ ให้เธอรู้สึกปลอดภัยและอบอุ่น',
            'ยอมตามใจเรื่องเล็กๆ น้อยๆ ในช่วงนี้',
          ],
          donts: [
            'อย่าทักเรื่องสิว น้ำหนัก หรือรูปร่างเด็ดขาด',
            'อย่าถามว่า "เป็นเมนส์เหรอถึงหงุดหงิด" (คำต้องห้าม!)',
            'อย่าตอบแชทห้วน หรือทำตัวเงียบหายไปนาน',
          ],
          giftSuggestion: 'ไอศกรีมรสโปรด, ชานมไข่มุกหวานน้อย, ตุ๊กตานุ่มๆ',
        };
      case 'ovulation':
        return {
          title: 'ระยะไข่ตก: เสน่ห์ดึงดูด & ความรักเบ่งบาน ✨',
          tasks: [
            'ชมแฟนว่าวันนี้สวยและน่ารักเป็นพิเศษ',
            'ชวนไปเดท ดินเนอร์ หรือถ่ายรูปสวยๆ ด้วยกัน',
            'วางแผนอนาคตและกิจกรรมร่วมกัน',
          ],
          dos: [
            'พาไปเปิดหูเปิดตาในบรรยากาศโรแมนติก',
            'ใส่ใจความรู้สึกและแสดงความรักอย่างสม่ำเสมอ',
          ],
          donts: [
            'หากยังไม่พร้อมมีน้อง ต้องป้องกันอย่างรัดกุม 100%',
          ],
          giftSuggestion: 'ดอกไม้ช่อเล็กๆ, ดินเนอร์ร้านโปรด, ขนมหวานน่ารัก',
        };
      case 'fertile':
        return {
          title: 'ช่วงเจริญพันธุ์: ร่างกายแข็งแรง พลังบวกเต็มเปี่ยม 🌿',
          tasks: [
            'ชวนไปออกกำลังกายเบาๆ หรือเดินเล่นรับลม',
            'รับฟังไอเดียและเรื่องราวที่เธอกำลังตื่นเต้น',
          ],
          dos: [
            'ร่วมทำกิจกรรมสนุกๆ และสร้างโมเมนต์ดีๆ ด้วยกัน',
          ],
          donts: [
            'อย่าลืมตรวจสอบการป้องกันหากยังไม่วางแผนมีบุตร',
          ],
          giftSuggestion: 'สมูทตี้ผลไม้สดชื่น, อาหารเพื่อสุขภาพ',
        };
      case 'follicular':
      default:
        return {
          title: 'ระยะฟอลลิคูลาร์: สดชื่น อารมณ์ดี พร้อมลุยทุกทริป 🌸',
          tasks: [
            'ชวนวางแผนทริปท่องเที่ยวที่อยากไปด้วยกัน',
            'ชวนไปกินบุฟเฟต์ หรือลองร้านอาหารใหม่ๆ',
            'เป็นคู่คิด ซัพพอร์ตเป้าหมายการทำงานของเธอ',
          ],
          dos: [
            'พาไปทำกิจกรรมสนุกๆ ที่เธออยากทำ',
            'พลังงานแฟนกำลังล้นเหลือ เที่ยวได้เต็มที่เลย!',
          ],
          donts: [
            'เป็นช่วงที่สบายใจที่สุด ไม่มีข้อจำกัดพิเศษครับ',
          ],
          giftSuggestion: 'พาไปช้อปปิ้ง, ทริปเที่ยวสั้นๆ, ของขวัญเซอร์ไพรส์',
        };
    }
  };

  const guide = getPhaseCareGuide(phaseInfo.phase);

  const toggleTask = (index: number) => {
    if (completedTasks.includes(index)) {
      setCompletedTasks(completedTasks.filter((t) => t !== index));
    } else {
      setCompletedTasks([...completedTasks, index]);
    }
  };

  const progressPercent = Math.round((completedTasks.length / guide.tasks.length) * 100);

  return (
    <div className="bg-white rounded-3xl sm:rounded-[2rem] p-5 sm:p-7 border border-slate-200 shadow-sm space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-500 to-blue-600 text-white flex items-center justify-center shadow-sm">
            <Heart className="w-5 h-5 fill-white" />
          </div>
          <div>
            <h3 className="font-extrabold text-slate-900 text-lg sm:text-xl">
              ศูนย์ซัพพอร์ตแฟน: {profile.name}
            </h3>
            <p className="text-xs text-sky-700 font-bold">
              {guide.title}
            </p>
          </div>
        </div>

        {/* Quest Progress */}
        <div className="flex items-center gap-3 bg-slate-50 px-3.5 py-2 rounded-2xl border border-slate-200/80">
          <div className="text-xs font-bold text-slate-700">
            ภารกิจดูแล: <span className="text-sky-600">{completedTasks.length}/{guide.tasks.length}</span>
          </div>
          <div className="w-20 bg-slate-200 h-2.5 rounded-full overflow-hidden">
            <div 
              className="bg-gradient-to-r from-sky-500 to-blue-600 h-full rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Boyfriend Quest Checklist */}
      <div className="bg-slate-50/70 rounded-2xl p-4 sm:p-5 border border-slate-200/80">
        <div className="text-xs sm:text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
          <CheckSquare className="w-4 h-4 text-sky-500" />
          <span>เช็คลิสต์การดูแลแฟนวันนี้ (กดเพื่อติ๊กเมื่อทำแล้ว):</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {guide.tasks.map((task, idx) => {
            const isDone = completedTasks.includes(idx);
            return (
              <button
                key={idx}
                type="button"
                onClick={() => toggleTask(idx)}
                className={`flex items-start gap-2.5 p-3 rounded-xl text-left text-xs font-semibold transition-all border ${
                  isDone
                    ? 'bg-sky-50 text-sky-900 border-sky-300 line-through opacity-80'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-sky-300 hover:bg-sky-50/30'
                }`}
              >
                {isDone ? (
                  <CheckSquare className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                ) : (
                  <Square className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                )}
                <span>{task}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* DOs and DONTs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm">
        {/* DOs */}
        <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50/40 border border-emerald-200 space-y-2.5">
          <div className="flex items-center gap-2 font-bold text-emerald-800 text-sm">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>สิ่งที่ควรทำวันนี้ (Do):</span>
          </div>
          <ul className="space-y-2 text-slate-700 text-xs font-medium">
            {guide.dos.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-emerald-500 font-bold">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* DONTs */}
        <div className="p-4 sm:p-5 rounded-2xl bg-rose-50/40 border border-rose-200 space-y-2.5">
          <div className="flex items-center gap-2 font-bold text-rose-800 text-sm">
            <XCircle className="w-4 h-4 text-rose-600" />
            <span>สิ่งที่ไม่ควรทำช่วงนี้ (Don't):</span>
          </div>
          <ul className="space-y-2 text-slate-700 text-xs font-medium">
            {guide.donts.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-rose-500 font-bold">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Bottom Row: Words of Affirmation & Gift Idea */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5">
        {/* Words of Affirmation Card */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs font-bold text-slate-800 mb-2">
              <span className="flex items-center gap-1.5 text-sky-700">
                <MessageCircleHeart className="w-4 h-4 text-sky-500" />
                คำพูดฮีลใจแฟน (คัดลอกส่งแชทได้ทันที):
              </span>
              <button
                onClick={handleNextAffirmation}
                className="text-[11px] text-slate-400 hover:text-sky-600 font-medium underline"
              >
                สุ่มข้อความใหม่
              </button>
            </div>
            <p className="text-xs text-slate-700 font-medium italic bg-white p-3 rounded-xl border border-slate-200">
              {affirmations[currentAffirmationIndex]}
            </p>
          </div>

          <div className="flex items-center gap-2 mt-3">
            <button
              onClick={handleCopyAffirmation}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-xs"
            >
              {copiedText ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>คัดลอกสำเร็จแล้ว!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>คัดลอกข้อความ</span>
                </>
              )}
            </button>
            <button
              onClick={handleSendVirtualHug}
              className="flex items-center justify-center gap-1.5 py-2 px-3.5 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 text-xs font-bold transition-colors"
              title="ส่งกอดเสมือน"
            >
              <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
              <span>ส่งกอด 🫂</span>
            </button>
          </div>
        </div>

        {/* Snack / Gift Recommendation */}
        <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200 flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-amber-100 border border-amber-300 text-amber-700 flex items-center justify-center shrink-0">
            <Gift className="w-5 h-5" />
          </div>
          <div>
            <span className="font-extrabold text-amber-950 text-xs sm:text-sm block mb-0.5">
              เมนูหรือของขวัญแนะนำวันนี้:
            </span>
            <p className="text-xs text-slate-700 font-medium leading-relaxed">
              {guide.giftSuggestion}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
