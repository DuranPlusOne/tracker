import { createClient } from "@/lib/supabase/server";
import { Habit } from "@/lib/supabase/types";
import AddHabitForm from "@/components/AddHabitForm";
import DeleteHabitButton from "@/components/DeleteHabitButton";
import Link from "next/link";
import { format, subDays } from "date-fns";
import { calculateStreak } from "@/lib/streaks";

export default async function HabitsPage() {
  const client = await createClient();

  const { data } = await client
    .from("habits")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  const habits = (data ?? []) as Habit[];

  // Fetch logs for streak calculation
  const today = new Date();
  const todayStr = format(today, "yyyy-MM-dd");
  const ninetyDaysAgo = format(subDays(today, 90), "yyyy-MM-dd");
  const { data: logsData } = await client
    .from("habit_logs")
    .select("habit_id, date, completed")
    .gte("date", ninetyDaysAgo)
    .lte("date", todayStr);
  const allLogs = (logsData ?? []) as {
    habit_id: string;
    date: string;
    completed: boolean;
  }[];

  const logsByHabit = new Map<string, { date: string; completed: boolean }[]>();
  allLogs.forEach((l) => {
    const existing = logsByHabit.get(l.habit_id) ?? [];
    existing.push({ date: l.date, completed: l.completed });
    logsByHabit.set(l.habit_id, existing);
  });

  const streakMap = new Map<string, number>();
  habits.forEach((h) => {
    streakMap.set(
      h.id,
      calculateStreak({
        days_of_week: h.days_of_week,
        logs: logsByHabit.get(h.id) ?? [],
      }),
    );
  });

  return (
    <main className="mx-auto max-w-lg p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Habits</h1>
      </div>

      <section className="mb-8 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="mb-3 text-lg font-medium">Add New Habit</h2>
        <AddHabitForm />
      </section>

      <section>
        <h2 className="mb-3 text-lg font-medium">Your Habits</h2>
        {habits.length === 0 ? (
          <p className="text-sm text-zinc-500">No habits yet. Add one above!</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {habits.map((h) => (
              <li
                key={h.id}
                className="flex items-center justify-between rounded-xl border bg-white p-4 shadow-sm dark:bg-zinc-900"
                style={{
                  borderColor: h.color ?? undefined,
                  borderLeftWidth: h.color ? "4px" : undefined,
                }}
              >
                <div>
                  <p className="font-medium">
                    {h.emoji && <span className="mr-1.5">{h.emoji}</span>}
                    {h.title}
                  </p>
                  {h.description && (
                    <p className="text-sm text-zinc-500">{h.description}</p>
                  )}
                  <p className="text-xs text-zinc-400">
                    {h.days_of_week.length === 7
                      ? "Every day"
                      : h.days_of_week
                          .map(
                            (d) =>
                              [
                                "",
                                "Mon",
                                "Tue",
                                "Wed",
                                "Thu",
                                "Fri",
                                "Sat",
                                "Sun",
                              ][d],
                          )
                          .join(", ")}
                    {(streakMap.get(h.id) ?? 0) > 0 &&
                      ` · 🔥 ${streakMap.get(h.id)}`}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    href={`/habits/${h.id}`}
                    className="rounded-lg border border-zinc-200 px-3 py-1 text-sm text-zinc-600 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-900"
                  >
                    View
                  </Link>
                  <DeleteHabitButton habitId={h.id} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
