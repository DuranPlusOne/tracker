"use client";

import { Habit } from "@/lib/supabase/types";
import { toggleHabit } from "@/app/actions";
import { useOptimistic, useTransition } from "react";
import { format } from "date-fns";
import { toast } from "sonner";

interface HabitCardProps {
  habit: Habit;
  completed: boolean;
  streak?: number;
}

export default function HabitCard({
  habit,
  completed,
  streak = 0,
}: HabitCardProps) {
  const [isPending, startTransition] = useTransition();
  const [optimisticCompleted, setOptimisticCompleted] = useOptimistic(
    completed,
    (_current: boolean, next: boolean) => next,
  );
  const todayStr = format(new Date(), "yyyy-MM-dd");

  function handleToggle() {
    const newState = !optimisticCompleted;
    startTransition(async () => {
      setOptimisticCompleted(newState);
      await toggleHabit(habit.id, todayStr, completed);
      toast.success(
        completed ? `${habit.title} unmarked` : `${habit.title} completed! ✓`,
      );
    });
  }

  return (
    <div className="flex w-full items-center justify-between">
      <div className="flex items-start gap-3">
        {/* Color indicator */}
        {habit.color && (
          <div
            className="mt-1.5 h-3 w-3 shrink-0 rounded-full"
            style={{ backgroundColor: habit.color }}
          />
        )}
        <div>
          <p
            className={`text-lg font-medium ${optimisticCompleted ? "line-through text-zinc-400" : ""}`}
          >
            {habit.emoji && <span className="mr-1.5">{habit.emoji}</span>}
            {habit.title}
          </p>
          {streak > 0 && (
            <span className="text-sm text-orange-500">
              🔥 {streak} day{streak !== 1 ? "s" : ""}
            </span>
          )}
          {habit.description && (
            <p className="text-sm text-zinc-500">{habit.description}</p>
          )}
        </div>
      </div>
      <button
        onClick={handleToggle}
        disabled={isPending}
        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 text-lg font-bold transition-all duration-200 active:scale-90 ${
          optimisticCompleted
            ? "border-green-500 bg-green-500 text-white shadow-green-200 shadow-md dark:shadow-green-900"
            : "border-zinc-300 hover:border-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800"
        } ${isPending ? "opacity-50" : ""}`}
        aria-label={optimisticCompleted ? "Mark incomplete" : "Mark complete"}
      >
        {optimisticCompleted ? "✓" : ""}
      </button>
    </div>
  );
}
