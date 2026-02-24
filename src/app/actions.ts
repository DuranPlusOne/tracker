"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function toggleHabit(
  habitId: string,
  date: string,
  completed: boolean,
) {
  const client = await createClient();

  if (completed) {
    // Mark as incomplete — delete the log
    await client
      .from("habit_logs")
      .delete()
      .eq("habit_id", habitId)
      .eq("date", date);
  } else {
    // Mark as complete — upsert a log
    await client
      .from("habit_logs")
      .upsert(
        { habit_id: habitId, date, completed: true },
        { onConflict: "habit_id,date" },
      );
  }

  revalidatePath("/");
}

export async function addHabit(formData: FormData) {
  const title = formData.get("title") as string;
  const description = (formData.get("description") as string) || null;
  const daysOfWeekJson = formData.get("days_of_week") as string;
  const color = (formData.get("color") as string) || null;
  const emoji = (formData.get("emoji") as string) || null;

  if (!title?.trim()) return;

  const days_of_week: number[] = daysOfWeekJson
    ? JSON.parse(daysOfWeekJson)
    : [1, 2, 3, 4, 5, 6, 7];

  const client = await createClient();

  await client.from("habits").insert({
    title: title.trim(),
    description,
    frequency: "daily", // Legacy column — kept for DB compatibility
    days_of_week,
    color,
    emoji,
    is_active: true,
  });

  revalidatePath("/habits");
  revalidatePath("/");
}

export async function deleteHabit(habitId: string) {
  const client = await createClient();

  await client.from("habits").update({ is_active: false }).eq("id", habitId);

  revalidatePath("/habits");
  revalidatePath("/");
}
