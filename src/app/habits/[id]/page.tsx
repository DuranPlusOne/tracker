import { createClient } from "@/lib/supabase/server";
import { Habit } from "@/lib/supabase/types";
import { calculateStreak } from "@/lib/streaks";
import CalendarHeatmap from "@/components/CalendarHeatmap";
import Link from "next/link";
import { format, subDays } from "date-fns";
import { notFound } from "next/navigation";

const DAY_NAMES = ["", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default async function HabitDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const client = await createClient();

  // Fetch the habit
  const { data: habitData } = await client
    .from("habits")
    .select("*")
    .eq("id", id)
    .single();

  if (!habitData) notFound();
  const habit = habitData as Habit;

  // Fetch logs for the last 90 days
  const today = new Date();
  const todayStr = format(today, "yyyy-MM-dd");
  const ninetyDaysAgo = format(subDays(today, 90), "yyyy-MM-dd");

  const { data: logsData } = await client
    .from("habit_logs")
    .select("date, completed")
    .eq("habit_id", id)
    .gte("date", ninetyDaysAgo)
    .lte("date", todayStr);

  const logs = (logsData ?? []) as { date: string; completed: boolean }[];

  // Build completion map for heatmap
  const completionMap: Record<string, boolean> = {};
  logs.forEach((l) => {
    completionMap[l.date] = l.completed;
  });

  // Calculate streak
  const currentStreak = calculateStreak({
    days_of_week: habit.days_of_week,
    logs,
  });

  // Calculate total completions
  const totalCompletions = logs.filter((l) => l.completed).length;

  // Calculate completion rate (last 30 days)
  const thirtyDaysAgo = subDays(today, 30);
  const last30Logs = logs.filter(
    (l) => new Date(l.date + "T00:00:00") >= thirtyDaysAgo,
  );
  const last30Completed = last30Logs.filter((l) => l.completed).length;
  // Count scheduled days in last 30 based on days_of_week
  const possibleDays = Math.round((30 / 7) * habit.days_of_week.length);
  const completionRate =
    possibleDays > 0 ? Math.round((last30Completed / possibleDays) * 100) : 0;

  return (
    <main className="mx-auto max-w-lg p-6">
      <Link
        href="/habits"
        className="mb-4 inline-block text-sm font-medium text-zinc-500 transition-all hover:-translate-x-0.5 hover:text-zinc-900 dark:hover:text-zinc-100"
      >
        ← Back to Habits
      </Link>

      <h1 className="text-2xl font-semibold">
        {habit.emoji && <span className="mr-2">{habit.emoji}</span>}
        {habit.title}
      </h1>
      {habit.description && (
        <p className="mt-1 text-sm text-zinc-500">{habit.description}</p>
      )}
      <p className="mt-1 text-xs text-zinc-400">
        {habit.days_of_week.length === 7
          ? "Every day"
          : habit.days_of_week.map((d) => DAY_NAMES[d]).join(", ")}
      </p>

      {/* Stats */}
      <div className="mt-6 grid grid-cols-3 gap-4">
        <div className="rounded-xl border border-orange-500/20 bg-orange-500/5 p-4 text-center">
          <p className="text-2xl font-bold text-orange-500">
            {currentStreak > 0 ? `🔥 ${currentStreak}` : "0"}
          </p>
          <p className="text-xs text-zinc-500">Current Streak</p>
        </div>
        <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-4 text-center">
          <p className="text-2xl font-bold">{totalCompletions}</p>
          <p className="text-xs text-zinc-500">Total (90d)</p>
        </div>
        <div className="rounded-xl border border-green-500/20 bg-green-500/5 p-4 text-center">
          <p className="text-2xl font-bold">{completionRate}%</p>
          <p className="text-xs text-zinc-500">Rate (30d)</p>
        </div>
      </div>

      {/* Calendar Heatmap */}
      <div className="mt-6">
        <h2 className="mb-3 text-lg font-medium">Activity</h2>
        <CalendarHeatmap
          completionMap={completionMap}
          scheduledDays={habit.days_of_week}
        />
      </div>
    </main>
  );
}
