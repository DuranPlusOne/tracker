-- Phase 1 SQL: Create tables for Habits and Habit Logs
-- Ensure pgcrypto extension for gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS public.habits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  frequency TEXT DEFAULT 'daily', -- Legacy column, kept for compatibility
  days_of_week INTEGER[] NOT NULL DEFAULT ARRAY[1,2,3,4,5,6,7],
  color TEXT, -- Hex color e.g. "#3b82f6"
  emoji TEXT, -- Single emoji e.g. "🏋️"
  created_at TIMESTAMPTZ DEFAULT now(),
  is_active BOOLEAN DEFAULT true
);

CREATE INDEX IF NOT EXISTS idx_habits_on_title ON public.habits (title);

ALTER TABLE public.habits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all habits" ON public.habits
FOR ALL USING (true)
WITH CHECK (true);

CREATE TABLE IF NOT EXISTS public.habit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  habit_id UUID REFERENCES public.habits (id) ON DELETE CASCADE,
  date DATE NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (habit_id, date)
);

CREATE INDEX IF NOT EXISTS idx_habit_logs_date ON public.habit_logs (date);
CREATE INDEX IF NOT EXISTS idx_habit_logs_habit_id ON public.habit_logs (habit_id);

ALTER TABLE public.habit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all" ON public.habit_logs
FOR ALL USING (true)
WITH CHECK (true);