import type { HabitsTodayResponse } from './api';

export const HOME_METRICS = ['sleep', 'work', 'wasted', 'speak', 'game', 'read'] as const;

export const HOME_MET_TARGETS: Record<string, number> = {
  sleep: 7,
  work: 4,
  read: 1,
  speak: 0.5,
  game: 0,
  wasted: 0,
};

export const HOME_HABIT_SPARKLINES = [
  { key: 'sleep', label: 'Sleep', target: 7, color: 'var(--ring-habits)' },
  { key: 'work', label: 'Work', target: 4, color: 'var(--accent)' },
  { key: 'read', label: 'Read', target: 1, color: 'var(--ok)' },
  { key: 'speak', label: 'Speak', target: 0.5, color: 'var(--warn)' },
] as const;

export function estimateActiveBurn(habits: HabitsTodayResponse | null): number {
  if (!habits?.metrics) return 0;
  const work = habits.metrics.work ?? 0;
  const read = habits.metrics.read ?? 0;
  return Math.round(work * 3.5 * 70 + read * 1.3 * 70);
}

export function habitCompletionPct(habits: HabitsTodayResponse | null): number {
  if (!habits?.metrics) return 0;
  let score = 0;
  let total = 0;
  for (const m of HOME_METRICS) {
    const target = HOME_MET_TARGETS[m];
    if (target <= 0) continue;
    total += 1;
    const val = habits.metrics[m] ?? 0;
    score += Math.min(val / target, 1);
  }
  return total > 0 ? Math.round((score / total) * 100) : 0;
}
