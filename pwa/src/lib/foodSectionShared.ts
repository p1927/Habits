export { MEAL_TYPES as FOOD_MEAL_TYPES } from './logSectionShared';

export function proteinProgressPct(protein: number, target: number | null | undefined): number {
  if (!target || target <= 0) return 0;
  return Math.min(100, (protein / target) * 100);
}
