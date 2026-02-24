"use client";

import { format, subDays, getDay } from "date-fns";

interface CalendarHeatmapProps {
  /** Map of date string (YYYY-MM-DD) to completed boolean */
  completionMap: Record<string, boolean>;
  /** Which days are scheduled (1=Mon...7=Sun) */
  scheduledDays: number[];
  /** Number of weeks to show */
  weeks?: number;
}

function getIntensityClass(
  dateStr: string,
  completionMap: Record<string, boolean>,
  scheduledDays: number[],
): string {
  const date = new Date(dateStr + "T00:00:00");
  const jsDay = getDay(date);
  const isoDay = jsDay === 0 ? 7 : jsDay;

  // Not a scheduled day — show as not applicable
  if (!scheduledDays.includes(isoDay)) {
    return "bg-zinc-100 dark:bg-zinc-900";
  }

  if (completionMap[dateStr] === true) {
    return "bg-green-500 dark:bg-green-400";
  }

  // Scheduled but not completed
  return "bg-zinc-200 dark:bg-zinc-800";
}

export default function CalendarHeatmap({
  completionMap,
  scheduledDays,
  weeks = 12,
}: CalendarHeatmapProps) {
  const today = new Date();

  // Build grid: columns = weeks, rows = days of week (Mon-Sun)
  const grid: { date: string; label: string }[][] = [];

  for (let w = weeks - 1; w >= 0; w--) {
    const week: { date: string; label: string }[] = [];
    for (let d = 1; d <= 7; d++) {
      // d=1 is Monday, d=7 is Sunday
      const daysAgo = w * 7 + (7 - d);
      const date = subDays(today, daysAgo);
      const dateStr = format(date, "yyyy-MM-dd");
      const label = format(date, "MMM d");
      week.push({ date: dateStr, label });
    }
    grid.push(week);
  }

  const dayLabels = ["M", "T", "W", "T", "F", "S", "S"];

  return (
    <div className="overflow-x-auto">
      <div className="flex gap-0.5">
        {/* Day labels column */}
        <div className="flex flex-col gap-0.5 pr-1">
          {dayLabels.map((label, i) => (
            <div
              key={i}
              className="flex h-3.5 w-3.5 items-center justify-center text-[8px] text-zinc-400"
            >
              {i % 2 === 0 ? label : ""}
            </div>
          ))}
        </div>
        {/* Weeks */}
        {grid.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-0.5">
            {week.map((cell) => (
              <div
                key={cell.date}
                title={`${cell.label}: ${completionMap[cell.date] ? "Completed" : "Not completed"}`}
                className={`h-3.5 w-3.5 rounded-sm ${getIntensityClass(cell.date, completionMap, scheduledDays)}`}
              />
            ))}
          </div>
        ))}
      </div>
      {/* Legend */}
      <div className="mt-2 flex items-center gap-2 text-[10px] text-zinc-400">
        <div className="h-3.5 w-3.5 rounded-sm bg-zinc-100 dark:bg-zinc-900" />
        <span>Not scheduled</span>
        <div className="h-3.5 w-3.5 rounded-sm bg-zinc-200 dark:bg-zinc-800" />
        <span>Incomplete</span>
        <div className="h-3.5 w-3.5 rounded-sm bg-green-500 dark:bg-green-400" />
        <span>Completed</span>
      </div>
    </div>
  );
}
