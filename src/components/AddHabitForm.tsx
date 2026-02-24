"use client";

import { addHabit } from "@/app/actions";
import { useRef, useState } from "react";
import { toast } from "sonner";

const DAYS = [
  { value: 1, label: "Mon" },
  { value: 2, label: "Tue" },
  { value: 3, label: "Wed" },
  { value: 4, label: "Thu" },
  { value: 5, label: "Fri" },
  { value: 6, label: "Sat" },
  { value: 7, label: "Sun" },
];

const ALL_DAYS = DAYS.map((d) => d.value);

const COLORS = [
  { value: "#3b82f6", label: "Blue" },
  { value: "#10b981", label: "Green" },
  { value: "#f59e0b", label: "Amber" },
  { value: "#ef4444", label: "Red" },
  { value: "#8b5cf6", label: "Purple" },
  { value: "#ec4899", label: "Pink" },
  { value: "#06b6d4", label: "Cyan" },
  { value: "#f97316", label: "Orange" },
];

const EMOJIS = [
  "🏋️",
  "📚",
  "💧",
  "🧘",
  "🏃",
  "💤",
  "🎯",
  "✍️",
  "🍎",
  "🧹",
  "💊",
  "🎵",
  "🌅",
  "🚶",
  "🧠",
  "💰",
];

export default function AddHabitForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [selectedDays, setSelectedDays] = useState<number[]>(ALL_DAYS);
  const [selectedColor, setSelectedColor] = useState<string>(COLORS[0].value);
  const [selectedEmoji, setSelectedEmoji] = useState<string>("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  function toggleDay(day: number) {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day],
    );
  }

  return (
    <form
      ref={formRef}
      action={async (formData) => {
        const title = formData.get("title") as string;
        formData.set("days_of_week", JSON.stringify(selectedDays));
        formData.set("color", selectedColor);
        if (selectedEmoji) formData.set("emoji", selectedEmoji);
        await addHabit(formData);
        toast.success(`"${title}" added!`);
        formRef.current?.reset();
        setSelectedDays(ALL_DAYS);
        setSelectedColor(COLORS[0].value);
        setSelectedEmoji("");
        setShowEmojiPicker(false);
      }}
      className="flex flex-col gap-3"
    >
      <input
        name="title"
        type="text"
        placeholder="Habit name"
        required
        className="rounded-lg border border-zinc-300 px-4 py-2 text-sm focus:border-zinc-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
      />
      <input
        name="description"
        type="text"
        placeholder="Description (optional)"
        className="rounded-lg border border-zinc-300 px-4 py-2 text-sm focus:border-zinc-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
      />

      {/* Emoji picker */}
      <div>
        <p className="mb-2 text-sm text-zinc-500">Icon (optional)</p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-300 text-lg transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
          >
            {selectedEmoji || "➕"}
          </button>
          {selectedEmoji && (
            <button
              type="button"
              onClick={() => setSelectedEmoji("")}
              className="text-xs text-zinc-400 hover:text-zinc-600"
            >
              Clear
            </button>
          )}
        </div>
        {showEmojiPicker && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {EMOJIS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => {
                  setSelectedEmoji(emoji);
                  setShowEmojiPicker(false);
                }}
                className={`flex h-9 w-9 items-center justify-center rounded-lg text-lg transition-all ${
                  selectedEmoji === emoji
                    ? "bg-zinc-900 text-white dark:bg-zinc-100"
                    : "hover:bg-zinc-100 dark:hover:bg-zinc-800"
                }`}
              >
                {emoji}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Color picker */}
      <div>
        <p className="mb-2 text-sm text-zinc-500">Color</p>
        <div className="flex flex-wrap gap-2">
          {COLORS.map((color) => (
            <button
              key={color.value}
              type="button"
              onClick={() => setSelectedColor(color.value)}
              className={`h-8 w-8 rounded-full transition-all ${
                selectedColor === color.value
                  ? "ring-2 ring-offset-2 ring-zinc-900 dark:ring-zinc-100 dark:ring-offset-zinc-950"
                  : "hover:scale-110"
              }`}
              style={{ backgroundColor: color.value }}
              aria-label={color.label}
            />
          ))}
        </div>
      </div>

      {/* Day picker */}
      <div>
        <p className="mb-2 text-sm text-zinc-500">Repeat on</p>
        <div className="flex flex-wrap gap-2">
          {DAYS.map((day) => (
            <button
              key={day.value}
              type="button"
              onClick={() => toggleDay(day.value)}
              className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${
                selectedDays.includes(day.value)
                  ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                  : "border border-zinc-300 text-zinc-600 hover:border-zinc-500 dark:border-zinc-700 dark:text-zinc-400"
              }`}
            >
              {day.label}
            </button>
          ))}
        </div>
      </div>

      <button
        type="submit"
        disabled={selectedDays.length === 0}
        className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
      >
        Add Habit
      </button>
    </form>
  );
}
