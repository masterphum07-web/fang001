import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { getLineClient, createStatusSummaryFlexMessage } from '@/lib/line/messaging';
import { supabaseAdmin } from '@/lib/supabase/client';
import { calculateSummaryStats, formatDateSafe } from '@/lib/utils/cycle-calculator';

const channelSecret = process.env.LINE_CHANNEL_SECRET || '';

// ตรวจสอบ Signature จาก LINE Server
function verifySignature(body: string, signature: string | null): boolean {
  if (!channelSecret) return true; // ข้ามการตรวจสอบหากยังไม่ได้ตั้งค่า Secret เพื่อความสะดวกในการทดสอบ
  if (!signature) return false;
  const hash = crypto.createHmac('sha256', channelSecret).update(body).digest('base64');
  return hash === signature;
}

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-line-signature');

    if (!verifySignature(rawBody, signature)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const data = JSON.parse(rawBody);
    const events = data.events || [];
    const client = getLineClient();

    for (const event of events) {
      if (event.type === 'message' && event.message.type === 'text') {
        const text = event.message.text.trim().toLowerCase();
        const lineUserId = event.source.userId;
        const todayStr = formatDateSafe(new Date());

        // 1. คำสั่ง "เมนมา" / "period started"
        if (text.includes('เมนมา') || text.includes('เมนแล้ว') || text.includes('period started')) {
          if (supabaseAdmin && lineUserId) {
            // ค้นหา user จาก line_user_id
            const { data: user } = await supabaseAdmin
              .from('users')
              .select('*')
              .eq('line_user_id', lineUserId)
              .single();

            if (user) {
              await supabaseAdmin.from('cycle_logs').insert({
                user_id: user.id,
                start_date: todayStr,
              });
              await supabaseAdmin
                .from('users')
                .update({ last_period_start_date: todayStr })
                .eq('id', user.id);
            }
          }

          if (client && event.replyToken) {
            await client.replyMessage({
              replyToken: event.replyToken,
              messages: [
                {
                  type: 'text',
                  text: '🩸 บันทึกวันแรกของประจำเดือนเรียบร้อยแล้วค่ะ! \n\nช่วงนี้พักผ่อนเยอะๆ ดื่มน้ำอุ่น และอย่าลืมพกถุงน้ำร้อนนะ เดี๋ยวเราช่วยนับรอบและคอยเตือนแฟนให้ดูแลคุณอย่างดีเลยค่ะ 💖',
                },
              ],
            });
          }
        } 
        // 2. คำสั่ง "เมนหาย" / "period ended"
        else if (text.includes('เมนหาย') || text.includes('เมนหมด') || text.includes('period ended')) {
          if (supabaseAdmin && lineUserId) {
            const { data: user } = await supabaseAdmin
              .from('users')
              .select('id')
              .eq('line_user_id', lineUserId)
              .single();

            if (user) {
              // อัปเดต end_date ของ cycle ล่าสุด
              const { data: latestCycle } = await supabaseAdmin
                .from('cycle_logs')
                .select('id')
                .eq('user_id', user.id)
                .order('start_date', { ascending: false })
                .limit(1)
                .single();

              if (latestCycle) {
                await supabaseAdmin
                  .from('cycle_logs')
                  .update({ end_date: todayStr })
                  .eq('id', latestCycle.id);
              }
            }
          }

          if (client && event.replyToken) {
            await client.replyMessage({
              replyToken: event.replyToken,
              messages: [
                {
                  type: 'text',
                  text: '✨ บันทึกวันหมดประจำเดือนเรียบร้อยแล้วค่ะ! สบายตัวแล้วนะ เตรียมเข้าสู่ระยะฟอลลิคูลาร์ ผิวพรรณสดใส อารมณ์ดี พร้อมลุยกิจกรรมใหม่ๆ ค่ะ 🌸',
                },
              ],
            });
          }
        }
        // 3. คำสั่ง "เช็คสถานะ" / "status"
        else if (text.includes('เช็คสถานะ') || text.includes('สถานะ') || text.includes('status')) {
          // คำนวณสรุปสถานะ
          let lastPeriodDate = todayStr;
          let cycleLen = 28;
          let periodLen = 5;

          if (supabaseAdmin && lineUserId) {
            const { data: user } = await supabaseAdmin
              .from('users')
              .select('*')
              .eq('line_user_id', lineUserId)
              .single();

            if (user) {
              lastPeriodDate = user.last_period_start_date || todayStr;
              cycleLen = user.average_cycle_length || 28;
              periodLen = user.average_period_length || 5;
            }
          }

          const stats = calculateSummaryStats(new Date(), lastPeriodDate, cycleLen, periodLen);
          const flexMsg = createStatusSummaryFlexMessage(stats);

          if (client && event.replyToken) {
            await client.replyMessage({
              replyToken: event.replyToken,
              messages: [flexMsg],
            });
          }
        }
        // คำสั่งอื่นๆ / แนะนำการใช้งาน
        else if (text.includes('ช่วย') || text.includes('help') || text.includes('เมนู')) {
          if (client && event.replyToken) {
            await client.replyMessage({
              replyToken: event.replyToken,
              messages: [
                {
                  type: 'text',
                  text: '🌸 ยินดีต้อนรับสู่ระบบติดตามรอบเดือน Menstrual Tracker ค่ะ!\n\nคำสั่งที่คุณสามารถพิมพ์บอกได้:\n1. "เมนมา" - เพื่อบันทึกวันแรกที่มีประจำเดือน\n2. "เมนหาย" - เพื่อบันทึกวันหมดประจำเดือน\n3. "เช็คสถานะ" - เพื่อดูว่าตอนนี้อยู่ในระยะไหน และอีกกี่วันเมนจะมา',
                },
              ],
            });
          }
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error handling LINE webhook:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
