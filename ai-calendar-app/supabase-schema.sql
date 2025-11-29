-- ============================================
-- Supabase Database Schema cho AI Calendar App
-- Copy toàn bộ file này và chạy trong Supabase SQL Editor
-- ============================================

-- 1. Tạo bảng users (tùy chọn, mở rộng thông tin từ auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security cho users
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Policies cho users
CREATE POLICY "Users can view own profile"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.users FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.users FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ============================================

-- 2. Tạo bảng tasks
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  time TEXT,
  priority TEXT CHECK (priority IN ('high', 'medium', 'low')) DEFAULT 'medium',
  category TEXT,
  completed BOOLEAN DEFAULT FALSE,
  date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes cho tasks
CREATE INDEX IF NOT EXISTS tasks_user_id_idx ON public.tasks(user_id);
CREATE INDEX IF NOT EXISTS tasks_date_idx ON public.tasks(date);
CREATE INDEX IF NOT EXISTS tasks_user_date_idx ON public.tasks(user_id, date);

-- Enable Row Level Security cho tasks
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- Policies cho tasks
CREATE POLICY "Users can view own tasks"
  ON public.tasks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own tasks"
  ON public.tasks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tasks"
  ON public.tasks FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own tasks"
  ON public.tasks FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================

-- 3. Tạo bảng moods
CREATE TABLE IF NOT EXISTS public.moods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  mood TEXT NOT NULL,
  note TEXT,
  emoji TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date) -- Mỗi user chỉ có 1 mood mỗi ngày
);

-- Indexes cho moods
CREATE INDEX IF NOT EXISTS moods_user_id_idx ON public.moods(user_id);
CREATE INDEX IF NOT EXISTS moods_date_idx ON public.moods(date);
CREATE INDEX IF NOT EXISTS moods_user_date_idx ON public.moods(user_id, date);

-- Enable Row Level Security cho moods
ALTER TABLE public.moods ENABLE ROW LEVEL SECURITY;

-- Policies cho moods
CREATE POLICY "Users can view own moods"
  ON public.moods FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own moods"
  ON public.moods FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own moods"
  ON public.moods FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own moods"
  ON public.moods FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================

-- 4. Tạo function tự động update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers tự động update updated_at
DROP TRIGGER IF EXISTS update_tasks_updated_at ON public.tasks;
CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_moods_updated_at ON public.moods;
CREATE TRIGGER update_moods_updated_at
  BEFORE UPDATE ON public.moods
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- HOÀN THÀNH!
-- Kiểm tra bằng cách:
-- SELECT * FROM public.tasks LIMIT 1;
-- SELECT * FROM public.moods LIMIT 1;
-- ============================================

