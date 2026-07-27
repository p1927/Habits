import { QueueEmptyHint } from './QueueEmptyHint';

export function MealPlanQueueEmptyHint({ announce = false }: { announce?: boolean }) {
  return <QueueEmptyHint announce={announce}>No pending offline meal logs</QueueEmptyHint>;
}
