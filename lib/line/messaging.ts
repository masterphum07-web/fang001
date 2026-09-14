import { messagingApi } from '@line/bot-sdk';
import { CycleSummaryStats } from '@/lib/utils/cycle-calculator';

const channelAccessToken = process.env.LINE_CHANNEL_ACCESS_TOKEN || '';

export const getLineClient = () => {
  if (!channelAccessToken) return null;
  return new messagingApi.MessagingApiClient({
    channelAccessToken,
  });
};

/**
 * แม่แบบ LINE Flex Message: แจ้งเตือนประจำเดือนกำลังจะมาในอีก 2 วัน (หรือ X วัน)
 */
export function createPeriodUpcomingFlexMessage(
  daysRemaining: number,
  expectedDate: string,
  partnerTip: string
): messagingApi.FlexMessage {
  return {
    type: 'flex',
    altText: `🌸 แจ้งเตือน: ประจำเดือนจะมาในอีก ${daysRemaining} วัน`,
    contents: {
      type: 'bubble',
      size: 'mega',
      header: {
        type: 'box',
        layout: 'vertical',
        backgroundColor: '#FFE4E6',
        paddingAll: '20px',
        contents: [
          {
            type: 'text',
            text: '🌸 MENSTRUAL CARE ALERT',
            weight: 'bold',
            color: '#E11D48',
            size: 'xs',
          },
          {
            type: 'text',
            text: `อีก ${daysRemaining} วัน ประจำเดือนจะมา`,
            weight: 'bold',
            size: 'xl',
            color: '#881337',
            margin: 'md',
          },
          {
            type: 'text',
            text: `วันที่คาดการณ์: ${expectedDate}`,
            size: 'sm',
            color: '#9F1239',
            margin: 'xs',
          },
        ],
      },
      body: {
        type: 'box',
        layout: 'vertical',
        spacing: 'md',
        contents: [
          {
            type: 'box',
            layout: 'vertical',
            backgroundColor: '#FFF1F2',
            cornerRadius: '12px',
            paddingAll: '14px',
            contents: [
              {
                type: 'text',
                text: '🩸 ข้อแนะนำสำหรับช่วงนี้ (PMS Alert)',
                weight: 'bold',
                size: 'sm',
                color: '#BE123C',
              },
              {
                type: 'text',
                text: '• พกพาผ้าอนามัยติดตัวไว้ล่วงหน้า\n• ดื่มน้ำอุ่น และพักผ่อนให้เพียงพอ\n• อาจมีอารมณ์อ่อนไหว คัดตึงหน้าอก หรือปวดท้องน้อย',
                size: 'xs',
                color: '#4B5563',
                margin: 'sm',
                wrap: true,
              },
            ],
          },
          {
            type: 'box',
            layout: 'vertical',
            backgroundColor: '#FDF2F8',
            cornerRadius: '12px',
            paddingAll: '14px',
            contents: [
              {
                type: 'text',
                text: '💖 เคล็ดลับเอาใจแฟน',
                weight: 'bold',
                size: 'sm',
                color: '#A21CAF',
              },
              {
                type: 'text',
                text: partnerTip || 'ช่วยดูแลเอาใจใส่ ชวนคุยด้วยความใจเย็น และเตรียมขนมที่ชอบไว้ให้นะครับ',
                size: 'xs',
                color: '#6B7280',
                margin: 'sm',
                wrap: true,
              },
            ],
          },
        ],
      },
      footer: {
        type: 'box',
        layout: 'vertical',
        contents: [
          {
            type: 'button',
            style: 'primary',
            color: '#E11D48',
            action: {
              type: 'uri',
              label: 'เปิดดูปฏิทินรอบเดือน 📅',
              uri: process.env.NEXT_PUBLIC_APP_URL || 'https://liff.line.me',
            },
          },
        ],
      },
    },
  };
}

/**
 * แม่แบบ LINE Flex Message: แจ้งเตือนช่วงวันไข่ตก / เจริญพันธุ์
 */
export function createOvulationFertileFlexMessage(
  daysRemaining: number,
  ovulationDate: string
): messagingApi.FlexMessage {
  const isToday = daysRemaining === 0;
  const title = isToday ? '✨ วันนี้เป็นวันไข่ตก (Ovulation Day) ✨' : `🌿 พรุ่งนี้เข้าสู่ช่วงไข่ตก (ใน ${daysRemaining} วัน)`;

  return {
    type: 'flex',
    altText: `🌿 แจ้งเตือน: ${title}`,
    contents: {
      type: 'bubble',
      size: 'mega',
      header: {
        type: 'box',
        layout: 'vertical',
        backgroundColor: '#EDE9FE',
        paddingAll: '20px',
        contents: [
          {
            type: 'text',
            text: '🌿 FERTILE WINDOW & OVULATION',
            weight: 'bold',
            color: '#7C3AED',
            size: 'xs',
          },
          {
            type: 'text',
            text: title,
            weight: 'bold',
            size: 'lg',
            color: '#4C1D95',
            margin: 'md',
            wrap: true,
          },
          {
            type: 'text',
            text: `วันที่ประเมิน: ${ovulationDate}`,
            size: 'sm',
            color: '#6D28D9',
            margin: 'xs',
          },
        ],
      },
      body: {
        type: 'box',
        layout: 'vertical',
        contents: [
          {
            type: 'text',
            text: 'โอกาสตั้งครรภ์: สูงสุด (High Fertility)',
            weight: 'bold',
            color: '#059669',
            size: 'sm',
          },
          {
            type: 'text',
            text: '• หากวางแผนมีบุตร: ช่วงนี้เป็นโอกาสที่ดีที่สุด\n• หากยังไม่พร้อมมีบุตร: แนะนำให้คุมกำเนิดอย่างเคร่งครัดและปลอดภัย',
            size: 'xs',
            color: '#4B5563',
            margin: 'md',
            wrap: true,
          },
        ],
      },
      footer: {
        type: 'box',
        layout: 'vertical',
        contents: [
          {
            type: 'button',
            style: 'secondary',
            color: '#7C3AED',
            action: {
              type: 'uri',
              label: 'บันทึกอาการวันนี้',
              uri: process.env.NEXT_PUBLIC_APP_URL || 'https://liff.line.me',
            },
          },
        ],
      },
    },
  };
}

/**
 * แม่แบบ LINE Flex Message: สรุปสถานะรอบเดือนปัจจุบัน
 */
export function createStatusSummaryFlexMessage(stats: CycleSummaryStats): messagingApi.FlexMessage {
  return {
    type: 'flex',
    altText: `📊 สรุปสถานะรอบเดือน: ${stats.phaseLabel}`,
    contents: {
      type: 'bubble',
      size: 'mega',
      header: {
        type: 'box',
        layout: 'vertical',
        backgroundColor: '#F3F4F6',
        paddingAll: '16px',
        contents: [
          {
            type: 'text',
            text: '📊 สรุปสถานะรอบเดือนวันนี้',
            weight: 'bold',
            color: '#374151',
            size: 'sm',
          },
          {
            type: 'text',
            text: stats.phaseLabel,
            weight: 'bold',
            size: 'xl',
            color: '#1F2937',
            margin: 'sm',
          },
          {
            type: 'text',
            text: `วันที่ ${stats.currentDayOfCycle} ของรอบเดือน`,
            size: 'sm',
            color: '#6B7280',
          },
        ],
      },
      body: {
        type: 'box',
        layout: 'vertical',
        spacing: 'sm',
        contents: [
          {
            type: 'box',
            layout: 'horizontal',
            contents: [
              { type: 'text', text: '🩸 เมนรอบถัดไป', size: 'sm', color: '#6B7280' },
              { type: 'text', text: `อีก ${stats.daysUntilNextPeriod} วัน (${stats.nextPeriodDate})`, size: 'sm', color: '#E11D48', align: 'end', weight: 'bold' },
            ],
          },
          {
            type: 'box',
            layout: 'horizontal',
            contents: [
              { type: 'text', text: '🟣 วันไข่ตกถัดไป', size: 'sm', color: '#6B7280' },
              { type: 'text', text: `อีก ${stats.daysUntilOvulation} วัน (${stats.nextOvulationDate})`, size: 'sm', color: '#7C3AED', align: 'end', weight: 'bold' },
            ],
          },
          {
            type: 'separator',
            margin: 'md',
          },
          {
            type: 'text',
            text: `💡 สภาพร่างกาย: ${stats.bodyFeel}`,
            size: 'xs',
            color: '#4B5563',
            wrap: true,
            margin: 'md',
          },
        ],
      },
    },
  };
}
