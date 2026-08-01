export function kcalProgressPct(consumed: number, target: number | null | undefined): number {
  if (!target || target <= 0) return 0;
  return Math.min(100, (consumed / target) * 100);
}

export function kcalRemaining(
  consumed: number,
  target: number | null | undefined,
): number | null {
  if (!target || target <= 0) return null;
  return Math.max(0, target - consumed);
}

export function formatKcal(value: number): string {
  return value.toFixed(0);
}

export function formatGrams(value: number): string {
  return value.toFixed(1);
}
