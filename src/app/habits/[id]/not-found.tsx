import Link from "next/link";

export default function HabitNotFound() {
  return (
    <main className="mx-auto flex min-h-[50vh] max-w-lg flex-col items-center justify-center gap-4 p-6 text-center">
      <h2 className="text-xl font-semibold">Habit not found</h2>
      <p className="text-sm text-zinc-500">
        {"This habit doesn't exist or has been removed."}
      </p>
      <Link
        href="/habits"
        className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
      >
        Back to Habits
      </Link>
    </main>
  );
}
