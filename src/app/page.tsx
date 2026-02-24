import { Habit } from "@/lib/supabase/types";
import { createClient } from "@/lib/supabase/server";
import HabitCard from "@/components/HabitCard";
import { getDay, format, subDays, startOfWeek, addDays } from "date-fns";
import { calculateStreak } from "@/lib/streaks";

export default async function Page() {
  const client = await createClient();

  // Build today's date as YYYY-MM-DD
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  const todayStr = `${yyyy}-${mm}-${dd}`;

  // Get today's day of week: 1=Mon, 2=Tue, ..., 7=Sun
  const jsDay = getDay(today); // 0=Sun, 1=Mon, ..., 6=Sat
  const isoDay = jsDay === 0 ? 7 : jsDay; // Convert to ISO: 1=Mon...7=Sun

  // Fetch active habits
  const habitsRes = await client
    .from("habits")
    .select("*")
    .eq("is_active", true);
  const allHabits = (habitsRes.data ?? []) as Habit[];

  // Filter: show habits scheduled for today (null-safe)
  const habits = allHabits.filter((h) => {
    const days = h.days_of_week ?? [1, 2, 3, 4, 5, 6, 7];
    return Array.isArray(days) && days.includes(isoDay);
  });

  // Fetch logs for the last 90 days (for streaks) + today
  const ninetyDaysAgo = format(subDays(today, 90), "yyyy-MM-dd");
  const allLogsRes = await client
    .from("habit_logs")
    .select("habit_id, date, completed")
    .gte("date", ninetyDaysAgo)
    .lte("date", todayStr);
  const allLogs = (allLogsRes.data ?? []) as {
    habit_id: string;
    date: string;
    completed: boolean;
  }[];

  // Group logs by habit_id
  const logsByHabit = new Map<string, { date: string; completed: boolean }[]>();
  allLogs.forEach((l) => {
    const existing = logsByHabit.get(l.habit_id) ?? [];
    existing.push({ date: l.date, completed: l.completed });
    logsByHabit.set(l.habit_id, existing);
  });

  // Build completed map for today
  const completedMap = new Map<string, boolean>();
  allLogs
    .filter((l) => l.date === todayStr)
    .forEach((l) => completedMap.set(l.habit_id, l.completed));

  // Compute streaks
  const streakMap = new Map<string, number>();
  habits.forEach((h) => {
    const streak = calculateStreak({
      days_of_week: h.days_of_week,
      logs: logsByHabit.get(h.id) ?? [],
    });
    streakMap.set(h.id, streak);
  });

  // Progress stats
  const completedCount = habits.filter(
    (h) => completedMap.get(h.id) === true,
  ).length;
  const totalCount = habits.length;
  const progressPct = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
  const allDone = totalCount > 0 && completedCount === totalCount;

  // Weekly summary: count completions across all habits for this week (Mon-Sun)
  const weekStart = startOfWeek(today, { weekStartsOn: 1 }); // Monday
  let weekTotal = 0;
  let weekCompleted = 0;
  for (let d = 0; d < 7; d++) {
    const dayDate = addDays(weekStart, d);
    const dayStr = format(dayDate, "yyyy-MM-dd");
    const dayJsDay = getDay(dayDate);
    const dayIso = dayJsDay === 0 ? 7 : dayJsDay;

    allHabits.forEach((h) => {
      if (!h.is_active) return;
      if (!h.days_of_week.includes(dayIso)) return;
      weekTotal++;
      const log = allLogs.find(
        (l) => l.habit_id === h.id && l.date === dayStr && l.completed,
      );
      if (log) weekCompleted++;
    });
  }
  const weekPct =
    weekTotal > 0 ? Math.round((weekCompleted / weekTotal) * 100) : 0;

  // Formatted date
  const dateDisplay = format(today, "EEEE, d MMMM");

  return (
    <main className="mx-auto max-w-lg p-6">
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-3xl font-bold">Today</h1>
        <p className="text-sm text-zinc-500">{dateDisplay}</p>
      </div>

      {/* Progress bar */}
      {totalCount > 0 && (
        <div className="mb-6">
          <div className="mb-1 flex items-center justify-between text-sm">
            <span className="text-zinc-500">
              {completedCount}/{totalCount} completed
            </span>
            {allDone && <span className="text-green-600">All done! 🎉</span>}
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                allDone ? "bg-green-500" : "bg-zinc-900 dark:bg-zinc-100"
              }`}
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      )}

      {/* Weekly summary */}
      {totalCount > 0 && (
        <p className="mb-6 text-sm text-zinc-500">
          This week: {weekCompleted}/{weekTotal} completed ({weekPct}%)
        </p>
      )}

      {/* Empty state */}
      {totalCount === 0 && (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <p className="text-lg text-zinc-500">No habits scheduled for today</p>
          <p className="text-sm text-zinc-400">
            Head to the Habits tab to add some
          </p>
        </div>
      )}

      {/* Habit list — card-based */}
      {totalCount > 0 && (
        <ul className="flex flex-col gap-3">
          {habits.map((h) => {
            const completed = completedMap.get(h.id) ?? false;
            return (
              <li
                key={h.id}
                className="rounded-xl border bg-white p-4 shadow-sm transition-shadow hover:shadow-md dark:bg-zinc-900"
                style={{
                  borderColor: h.color ?? undefined,
                  borderLeftWidth: h.color ? "4px" : undefined,
                }}
              >
                <HabitCard
                  habit={h}
                  completed={completed}
                  streak={streakMap.get(h.id) ?? 0}
                />
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
