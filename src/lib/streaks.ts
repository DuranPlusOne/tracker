import { subDays, format, getDay } from "date-fns";

interface StreakInput {
  days_of_week: number[]; // 1=Mon...7=Sun
  logs: { date: string; completed: boolean }[];
}

/**
 * Calculate the current streak for a habit.
 *
 * Walks backwards through scheduled days (based on days_of_week),
 * counting consecutive completed days.
 *
 * If the most recent scheduled day is not yet completed, we skip it
 * and start counting from the previous scheduled day.
 */
export function calculateStreak({ days_of_week, logs }: StreakInput): number {
  const completedDates = new Set(
    logs.filter((l) => l.completed).map((l) => l.date),
  );

  const daysSet = new Set(days_of_week);
  if (daysSet.size === 0) return 0;

  const today = new Date();
  let streak = 0;
  let checked = 0;

  for (let i = 0; i < 365 && checked < 90; i++) {
    const date = subDays(today, i);
    const jsDay = getDay(date); // 0=Sun...6=Sat
    const isoDay = jsDay === 0 ? 7 : jsDay; // 1=Mon...7=Sun

    if (!daysSet.has(isoDay)) continue;
    checked++;

    const dateStr = format(date, "yyyy-MM-dd");
    if (checked === 1 && !completedDates.has(dateStr)) {
      // Most recent scheduled day not completed — start from next one
      continue;
    }
    if (completedDates.has(dateStr)) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}
