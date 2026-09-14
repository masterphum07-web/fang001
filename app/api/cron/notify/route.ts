import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/client';
import { 
  getLineClient, 
  createPeriodUpcomingFlexMessage, 
  createOvulationFertileFlexMessage 
} from '@/lib/line/messaging';
import { calculateSummaryStats } from '@/lib/utils/cycle-calculator';

export async function GET(req: NextRequest) {
  // ตรวจสอบ Authorization header สำหรับ cron job ป้องกันการเรียกโดยไม่ได้รับอนุญาต
  const authHeader = req.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const lineClient = getLineClient();
  if (!supabaseAdmin || !lineClient) {
    return NextResponse.json({ 
      message: 'Supabase or LINE client not configured. Simulated check completed.',
      sentCount: 0
    });
  }

  try {
    // 1. ดึงรายชื่อ users ทั้งหมดที่มี line_user_id
    const { data: users, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .not('line_user_id', 'is', null);

    if (error || !users) {
      return NextResponse.json({ error: error?.message || 'No users found' }, { status: 500 });
    }

    let notificationsSent = 0;
    const today = new Date();

    for (const user of users) {
      if (!user.last_period_start_date || !user.line_user_id) continue;

      const stats = calculateSummaryStats(
        today,
        user.last_period_start_date,
        user.average_cycle_length || 28,
        user.average_period_length || 5
      );

      // เงื่อนไข 1: อีก 2 วัน ประจำเดือนจะมา -> ส่งแจ้งเตือน PMS / เตรียมผ้าอนามัย
      if (stats.daysUntilNextPeriod === 2) {
        const flexMsg = createPeriodUpcomingFlexMessage(
          2,
          stats.nextPeriodDate,
          stats.partnerTip
        );

        // ส่งให้แฟนสาว
        await lineClient.pushMessage({
          to: user.line_user_id,
          messages: [flexMsg],
        });
        notificationsSent++;

        // หากมี partner_line_user_id ให้ส่งเตือนแฟนหนุ่มด้วย
        if (user.partner_line_user_id) {
          await lineClient.pushMessage({
            to: user.partner_line_user_id,
            messages: [
              {
                type: 'text',
                text: `🔔 [เตือนแฟนที่น่ารัก] อีก 2 วัน ประจำเดือนของ ${user.name || 'แฟน'} จะมาแล้วนะ!\nช่วงนี้เตรียมน้ำอุ่น ช็อกโกแลต หรือของโปรดไว้ดูแลเธอนะครับ 💖`,
              },
            ],
          });
          notificationsSent++;
        }
      }

      // เงื่อนไข 2: วันก่อนวันไข่ตก (Fertile Window) หรือวันไข่ตก
      if (stats.daysUntilOvulation === 1 || stats.daysUntilOvulation === 0) {
        const flexMsg = createOvulationFertileFlexMessage(
          stats.daysUntilOvulation,
          stats.nextOvulationDate
        );

        await lineClient.pushMessage({
          to: user.line_user_id,
          messages: [flexMsg],
        });
        notificationsSent++;
      }
    }

    return NextResponse.json({ 
      success: true, 
      usersProcessed: users.length, 
      notificationsSent 
    });
  } catch (err: any) {
    console.error('Error executing daily cron notification:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
