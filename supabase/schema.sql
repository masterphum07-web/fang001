-- ==========================================================
-- 🩸 MENSTRUAL CYCLE TRACKER & LINE OA DATABASE SCHEMA
-- Compatible with Supabase PostgreSQL & Row Level Security (RLS)
-- ==========================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  line_user_id VARCHAR(100) UNIQUE,           -- LINE ID ของแฟนสาว
  partner_line_user_id VARCHAR(100),          -- LINE ID ของแฟนหนุ่มสำหรับส่งการแจ้งเตือน
  name VARCHAR(100) DEFAULT 'My Love',
  partner_name VARCHAR(100) DEFAULT 'Babe',
  average_cycle_length INT DEFAULT 28,        -- ค่าเฉลี่ยความยาวรอบเดือน (ปกติ 28 วัน)
  average_period_length INT DEFAULT 5,        -- ค่าเฉลี่ยวันมีประจำเดือน (ปกติ 5 วัน)
  last_period_start_date DATE NOT NULL,       -- วันแรกของรอบเดือนล่าสุด
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. CYCLE LOGS TABLE (ประวัติรอบเดือนแต่ละรอบ)
CREATE TABLE IF NOT EXISTS public.cycle_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE,
  cycle_length INT,                          -- ความยาวรอบเดือนที่เกิดขึ้นจริง (คำนวณอัตโนมัติ)
  period_length INT,                         -- จำนวนวันที่มีประจำเดือน
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. DAILY LOGS TABLE (บันทึกอาการและอารมณ์รายวัน)
CREATE TABLE IF NOT EXISTS public.daily_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  log_date DATE NOT NULL,
  flow_level INT DEFAULT 0 CHECK (flow_level >= 0 AND flow_level <= 5), -- 0=ไม่มี, 1-5=น้อยถึงมาก
  mood VARCHAR(50),                           -- happy, sensitive, irritable, tired, etc.
  symptoms TEXT[] DEFAULT '{}',               -- cramps, headache, acne, bloating, etc.
  notes TEXT,
  partner_note TEXT,                         -- โน้ต/ข้อความให้กำลังใจจากแฟน
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, log_date)
);

-- ==========================================================
-- INDEXES FOR PERFORMANCE
-- ==========================================================
CREATE INDEX IF NOT EXISTS idx_users_line_user_id ON public.users(line_user_id);
CREATE INDEX IF NOT EXISTS idx_cycle_logs_user_id_start ON public.cycle_logs(user_id, start_date DESC);
CREATE INDEX IF NOT EXISTS idx_daily_logs_user_id_date ON public.daily_logs(user_id, log_date DESC);

-- ==========================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cycle_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_logs ENABLE ROW LEVEL SECURITY;

-- Allow users to manage their own profile
CREATE POLICY "Users can view and manage their own profile" 
ON public.users
FOR ALL 
USING (auth.uid() = auth_user_id OR auth.role() = 'service_role')
WITH CHECK (auth.uid() = auth_user_id OR auth.role() = 'service_role');

-- Allow users to manage their own cycle logs
CREATE POLICY "Users can manage cycle logs" 
ON public.cycle_logs
FOR ALL 
USING (
  user_id IN (SELECT id FROM public.users WHERE auth_user_id = auth.uid()) 
  OR auth.role() = 'service_role'
)
WITH CHECK (
  user_id IN (SELECT id FROM public.users WHERE auth_user_id = auth.uid()) 
  OR auth.role() = 'service_role'
);

-- Allow users to manage their daily logs
CREATE POLICY "Users can manage daily logs" 
ON public.daily_logs
FOR ALL 
USING (
  user_id IN (SELECT id FROM public.users WHERE auth_user_id = auth.uid()) 
  OR auth.role() = 'service_role'
)
WITH CHECK (
  user_id IN (SELECT id FROM public.users WHERE auth_user_id = auth.uid()) 
  OR auth.role() = 'service_role'
);
