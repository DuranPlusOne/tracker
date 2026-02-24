"use client";

import { deleteHabit } from "@/app/actions";
import { useTransition } from "react";
import { toast } from "sonner";

interface DeleteHabitButtonProps {
  habitId: string;
}

export default function DeleteHabitButton({ habitId }: DeleteHabitButtonProps) {
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    startTransition(async () => {
      await deleteHabit(habitId);
      toast.success("Habit removed");
    });
  }

  return (
    <button
      onClick={handleDelete}
      disabled={isPending}
      className={`rounded-lg border border-red-200 px-3 py-1 text-sm text-red-600 transition-colors hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950 ${isPending ? "opacity-50" : ""}`}
    >
      {isPending ? "..." : "Remove"}
    </button>
  );
}
