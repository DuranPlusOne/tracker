# Tracker — Personal Habit Tracker

A minimal, mobile-friendly habit tracker built with Next.js 16, React 19, Supabase, and Tailwind CSS v4.

## Features

- **Daily & Weekly habits** — track recurring tasks with flexible scheduling
- **Smart recurrence** — weekly habits only show on their scheduled days
- **Streak tracking** — 🔥 consecutive day counter per habit
- **Progress bar** — visual daily completion progress
- **Weekly summary** — aggregate stats for the current week
- **Calendar heatmap** — GitHub-style activity grid per habit
- **Habit detail page** — stats, completion rate, and activity history
- **Toast notifications** — feedback on every action
- **Optimistic updates** — instant UI response using React 19 `useOptimistic`
- **Dark mode** — automatic via system preference
- **Mobile-first** — responsive, centered layout

## Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org) (App Router, Server Components, Server Actions)
- **Language**: TypeScript
- **Database**: [Supabase](https://supabase.com) (PostgreSQL)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com)
- **Fonts**: [Geist](https://vercel.com/font)
- **Toasts**: [Sonner](https://sonner.emilkowal.dev)
- **Dates**: [date-fns](https://date-fns.org)
- **React Compiler**: Enabled

## Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/DuranPlusOne/niche-search.git tracker
cd tracker
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Copy `.env.local.example` to `.env.local` and fill in your credentials:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Create database tables

Copy the contents of `src/lib/supabase/phase1.sql` into the Supabase SQL editor and run it. This creates:

- `habits` table (with RLS)
- `habit_logs` table (with RLS, unique constraint, indexes)

### 5. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
src/
├── app/
│   ├── page.tsx              # Today View (main page)
│   ├── loading.tsx           # Global loading spinner
│   ├── error.tsx             # Global error boundary
│   ├── not-found.tsx         # Global 404
│   ├── actions.ts            # Server Actions (toggle, add, delete)
│   ├── layout.tsx            # Root layout with Toaster
│   └── habits/
│       ├── page.tsx          # Manage Habits page
│       ├── loading.tsx       # Habits loading spinner
│       └── [id]/
│           ├── page.tsx      # Habit detail + calendar heatmap
│           └── not-found.tsx # Habit 404
├── components/
│   ├── HabitCard.tsx         # Toggle card with optimistic updates
│   ├── AddHabitForm.tsx      # Form with day-of-week picker
│   ├── DeleteHabitButton.tsx # Soft-delete button
│   └── CalendarHeatmap.tsx   # Activity grid component
└── lib/
    ├── streaks.ts            # Streak calculation utility
    └── supabase/
        ├── client.ts         # Browser Supabase client
        ├── server.ts         # Server Supabase client
        ├── types.ts          # TypeScript interfaces
        └── phase1.sql        # Database schema SQL
```

## Database Schema

### `habits`
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK, auto-generated |
| title | text | required |
| description | text | optional |
| frequency | text | "daily" or "weekly" |
| days_of_week | int[] | [1,3,5] for Mon/Wed/Fri |
| is_active | boolean | soft delete flag |
| created_at | timestamptz | auto |

### `habit_logs`
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK, auto-generated |
| habit_id | uuid | FK → habits |
| date | date | the day |
| completed | boolean | default false |
| created_at | timestamptz | auto |

Unique constraint on `(habit_id, date)` prevents duplicate logs.

## Deploy on Vercel

1. Push to GitHub
2. Import the repo on [Vercel](https://vercel.com)
3. Add environment variables: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy

## Architecture Decisions

- **No pre-generated rows** — logs are created on toggle only
- **Soft delete** — habits are deactivated, not deleted
- **Server-side streaks** — computed in Server Components, no client queries
- **Optimistic UI** — React 19 `useOptimistic` for instant toggle feedback
- **90-day log window** — bounded queries for performance