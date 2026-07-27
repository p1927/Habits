const flushInFlight = new Map<string, Promise<void>>();

/** One meal-plan queue flush per sync source at a time. */
export function runMealPlanFlushGuarded(
  syncSource: string,
  run: () => Promise<void>,
): Promise<void> {
  const existing = flushInFlight.get(syncSource);
  if (existing) return existing;

  const promise = run().finally(() => {
    if (flushInFlight.get(syncSource) === promise) {
      flushInFlight.delete(syncSource);
    }
  });
  flushInFlight.set(syncSource, promise);
  return promise;
}
