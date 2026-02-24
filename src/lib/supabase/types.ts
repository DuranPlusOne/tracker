export interface Habit {
  id: string;
  title: string;
  description?: string | null;
  days_of_week: number[]; // 1=Mon, 2=Tue, ..., 7=Sun
  color?: string | null; // Hex color e.g. "#3b82f6"
  emoji?: string | null; // Single emoji e.g. "🏋️"
  created_at?: string | null;
  is_active?: boolean;
}

export interface HabitLog {
  id: string;
  habit_id: string;
  date: string; // ISO date (YYYY-MM-DD)
  completed: boolean;
  created_at?: string | null;
}
