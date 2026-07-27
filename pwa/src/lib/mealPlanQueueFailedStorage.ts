import {
  readMealPlanFailedIdsRaw,
  readMealPlanQueueRaw,
  writeMealPlanFailedIds,
} from './mealPlanQueueStorageIo';

export function getMealPlanFailedIds(): string[] {
  const queueIds = new Set(readMealPlanQueueRaw().map((item) => item.id));
  return readMealPlanFailedIdsRaw().filter((id) => queueIds.has(id));
}

export function getMealPlanFailedCount(): number {
  return getMealPlanFailedIds().length;
}

export function setMealPlanFailedIds(ids: Iterable<string>) {
  writeMealPlanFailedIds([...ids]);
}

export function addMealPlanFailedId(id: string) {
  const next = new Set(readMealPlanFailedIdsRaw());
  next.add(id);
  writeMealPlanFailedIds([...next]);
}

export function removeMealPlanFailedId(id: string) {
  writeMealPlanFailedIds(readMealPlanFailedIdsRaw().filter((x) => x !== id));
}

export function clearMealPlanFailedIds() {
  writeMealPlanFailedIds([]);
}

export function pruneMealPlanFailedIds() {
  const queueIds = new Set(readMealPlanQueueRaw().map((item) => item.id));
  if (queueIds.size === 0) {
    writeMealPlanFailedIds([]);
    return;
  }
  writeMealPlanFailedIds(readMealPlanFailedIdsRaw().filter((id) => queueIds.has(id)));
}