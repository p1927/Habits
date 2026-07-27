import { QueueEmptyHint } from './QueueEmptyHint';

export function FoodQueueEmptyHint({ announce = false }: { announce?: boolean }) {
  return (
    <QueueEmptyHint announce={announce} className="food-queue-empty">
      No pending offline food logs
    </QueueEmptyHint>
  );
}
